import { execute } from "@/lib/db";

/**
 * Log an administrative security or content action to the activity_log table.
 * All logging is wrapped in try/catch — it must NEVER break the caller.
 *
 * @param {Request|null} req - The incoming Next.js request object
 * @param {number|null} adminId - The ID of the acting administrator
 * @param {string} event - The event identifier (e.g. login, content_updated, etc.)
 * @param {string} detail - Contextual details of the action
 */
export async function logActivity(req, adminId, event, detail = "") {
  try {
    let ip = "127.0.0.1";
    let userAgent = "Unknown";

    if (req) {
      if (typeof req.headers?.get === "function") {
        ip =
          req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
          req.headers.get("x-real-ip") ||
          "127.0.0.1";
        userAgent = req.headers.get("user-agent") || "Unknown";
      } else if (req.headers && typeof req.headers === "object") {
        ip =
          (req.headers["x-forwarded-for"] || "")?.split(",")[0]?.trim() ||
          req.headers["x-real-ip"] ||
          "127.0.0.1";
        userAgent = req.headers["user-agent"] || "Unknown";
      }
    }

    const now = new Date().toISOString();

    await execute(
      `INSERT INTO activity_log (admin_id, event, detail, ip, user_agent, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        adminId ? Number(adminId) : null,
        String(event || "unknown"),
        String(detail || ""),
        String(ip),
        String(userAgent),
        now,
      ]
    );
  } catch (err) {
    console.error("[logActivity] Failed to log activity:", err);
  }
}
