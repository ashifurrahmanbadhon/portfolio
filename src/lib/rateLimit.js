import { queryOne, execute, getDb } from "@/lib/db";

let tableEnsured = false;

async function ensureRateLimitTable() {
  if (tableEnsured) return;
  try {
    await execute(`
      CREATE TABLE IF NOT EXISTS persistent_rate_limits (
        rate_key VARCHAR(120) PRIMARY KEY,
        hits INTEGER NOT NULL DEFAULT 1,
        reset_at BIGINT NOT NULL,
        updated_at TEXT
      )
    `);
    tableEnsured = true;
  } catch (err) {
    console.error("Failed to ensure persistent_rate_limits table:", err);
    tableEnsured = true;
  }
}

export function getClientIp(req) {
  try {
    // 1. Vercel specific forwarded header
    const vercelFwd = req.headers.get("x-vercel-forwarded-for");
    if (vercelFwd) {
      const ip = vercelFwd.split(",")[0].trim();
      if (ip) return ip;
    }

    // 2. Cloudflare connecting IP
    const cfIp = req.headers.get("cf-connecting-ip");
    if (cfIp) return cfIp.trim();

    // 3. Real IP header
    const realIp = req.headers.get("x-real-ip");
    if (realIp) return realIp.trim();

    // 4. Standard X-Forwarded-For
    const forwarded = req.headers.get("x-forwarded-for");
    if (forwarded) {
      const firstIp = forwarded.split(",")[0].trim();
      if (firstIp) return firstIp;
    }
  } catch {}
  return "127.0.0.1";
}

export function getSubnetBucket(ip) {
  if (!ip) return "127.0.0.1";
  // IPv4: bucket by /24 subnet (e.g. 104.29.194.0/24) to stop proxy pool bursts
  if (ip.includes(".") && !ip.includes(":")) {
    const parts = ip.split(".");
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.${parts[2]}`;
    }
  }
  // IPv6: bucket by /64 subnet (first 4 segments)
  if (ip.includes(":")) {
    const parts = ip.split(":");
    return parts.slice(0, 4).join(":");
  }
  return ip;
}

export async function checkRateLimit(req, action, maxHits, windowSeconds) {
  try {
    await ensureRateLimitTable();
    const rawIp = getClientIp(req);
    const subnet = getSubnetBucket(rawIp);
    const now = Date.now();
    const resetAt = now + windowSeconds * 1000;
    const nowIso = new Date().toISOString();

    // Use subnet bucket to stop rotating-IP bursts in cloud proxies
    const rateKey = `${action}:${subnet}`;

    // Atomic UPSERT to eliminate race conditions
    let hits = 1;
    let actualResetAt = resetAt;

    try {
      const record = await queryOne(`
        INSERT INTO persistent_rate_limits (rate_key, hits, reset_at, updated_at)
        VALUES (?, 1, ?, ?)
        ON CONFLICT (rate_key) DO UPDATE
        SET hits = CASE
          WHEN persistent_rate_limits.reset_at < ? THEN 1
          ELSE persistent_rate_limits.hits + 1
        END,
        reset_at = CASE
          WHEN persistent_rate_limits.reset_at < ? THEN ?
          ELSE persistent_rate_limits.reset_at
        END,
        updated_at = ?
        RETURNING hits, reset_at
      `, [rateKey, resetAt, nowIso, now, now, resetAt, nowIso]);

      if (record) {
        hits = Number(record.hits);
        actualResetAt = Number(record.reset_at);
      }
    } catch {
      // Fallback for database engines where RETURNING is constrained
      const existing = await queryOne(
        "SELECT hits, reset_at FROM persistent_rate_limits WHERE rate_key = ?",
        [rateKey]
      );

      if (!existing || now > Number(existing.reset_at)) {
        await execute("DELETE FROM persistent_rate_limits WHERE rate_key = ?", [rateKey]);
        await execute(
          "INSERT INTO persistent_rate_limits (rate_key, hits, reset_at, updated_at) VALUES (?, 1, ?, ?)",
          [rateKey, resetAt, nowIso]
        );
        hits = 1;
        actualResetAt = resetAt;
      } else {
        hits = Number(existing.hits) + 1;
        actualResetAt = Number(existing.reset_at);
        await execute(
          "UPDATE persistent_rate_limits SET hits = ?, updated_at = ? WHERE rate_key = ?",
          [hits, nowIso, rateKey]
        );
      }
    }

    if (hits > maxHits) {
      const retryAfter = Math.max(1, Math.ceil((actualResetAt - now) / 1000));
      return {
        allowed: false,
        remaining: 0,
        resetAt: actualResetAt,
        headers: {
          "X-RateLimit-Limit": String(maxHits),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(Math.ceil(actualResetAt / 1000)),
          "Retry-After": String(retryAfter),
        },
      };
    }

    return {
      allowed: true,
      remaining: Math.max(0, maxHits - hits),
      resetAt: actualResetAt,
      headers: {
        "X-RateLimit-Limit": String(maxHits),
        "X-RateLimit-Remaining": String(Math.max(0, maxHits - hits)),
        "X-RateLimit-Reset": String(Math.ceil(actualResetAt / 1000)),
      },
    };
  } catch (err) {
    console.error("Rate limiter error, failing closed for security:", err);
    return {
      allowed: false,
      remaining: 0,
      resetAt: Date.now() + 60000,
      headers: {
        "Retry-After": "60",
      },
    };
  }
}
