import { queryOne, execute } from "@/lib/db";

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
    tableEnsured = true; // prevent repetitive crashing
  }
}

export function getClientIp(req) {
  try {
    const forwarded = req.headers.get("x-forwarded-for");
    if (forwarded) {
      const firstIp = forwarded.split(",")[0].trim();
      if (firstIp) return firstIp;
    }
    const realIp = req.headers.get("x-real-ip");
    if (realIp) return realIp.trim();
    const cfIp = req.headers.get("cf-connecting-ip");
    if (cfIp) return cfIp.trim();
  } catch {}
  return "127.0.0.1";
}

export async function checkRateLimit(req, action, maxHits, windowSeconds) {
  try {
    await ensureRateLimitTable();
    const ip = getClientIp(req);
    const rateKey = `${action}:${ip}`;
    const now = Date.now();
    const windowMs = windowSeconds * 1000;

    const record = await queryOne(
      "SELECT rate_key, hits, reset_at FROM persistent_rate_limits WHERE rate_key = ?",
      [rateKey]
    );

    if (!record || now > Number(record.reset_at)) {
      const resetAt = now + windowMs;
      await execute("DELETE FROM persistent_rate_limits WHERE rate_key = ?", [rateKey]);
      await execute(
        "INSERT INTO persistent_rate_limits (rate_key, hits, reset_at, updated_at) VALUES (?, ?, ?, ?)",
        [rateKey, 1, resetAt, new Date().toISOString()]
      );
      return {
        allowed: true,
        remaining: maxHits - 1,
        resetAt,
        headers: {
          "X-RateLimit-Limit": String(maxHits),
          "X-RateLimit-Remaining": String(maxHits - 1),
          "X-RateLimit-Reset": String(Math.ceil(resetAt / 1000)),
        },
      };
    }

    const currentHits = Number(record.hits);
    if (currentHits >= maxHits) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: Number(record.reset_at),
        headers: {
          "X-RateLimit-Limit": String(maxHits),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(Math.ceil(Number(record.reset_at) / 1000)),
          "Retry-After": String(Math.max(1, Math.ceil((Number(record.reset_at) - now) / 1000))),
        },
      };
    }

    const updatedHits = currentHits + 1;
    await execute(
      "UPDATE persistent_rate_limits SET hits = ?, updated_at = ? WHERE rate_key = ?",
      [updatedHits, new Date().toISOString(), rateKey]
    );

    return {
      allowed: true,
      remaining: maxHits - updatedHits,
      resetAt: Number(record.reset_at),
      headers: {
        "X-RateLimit-Limit": String(maxHits),
        "X-RateLimit-Remaining": String(maxHits - updatedHits),
        "X-RateLimit-Reset": String(Math.ceil(Number(record.reset_at) / 1000)),
      },
    };
  } catch (err) {
    console.error("Rate limiter error, failing closed for security:", err);
    return {
      allowed: false,
      remaining: 0,
      resetAt: Date.now() + 60000,
      headers: {},
    };
  }
}
