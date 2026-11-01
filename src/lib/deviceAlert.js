import crypto from "crypto";
import { queryOne, execute } from "@/lib/db";

function parseUserAgentSummary(ua = "") {
  if (!ua) return "Unknown Browser / OS";

  let os = "Unknown OS";
  if (/windows nt 10/i.test(ua)) os = "Windows 10/11";
  else if (/windows/i.test(ua)) os = "Windows";
  else if (/iphone|ipad|ipod/i.test(ua)) os = "iOS";
  else if (/macintosh|mac os x/i.test(ua)) os = "macOS";
  else if (/android/i.test(ua)) os = "Android";
  else if (/linux/i.test(ua)) os = "Linux";

  let browser = "Unknown Browser";
  if (/edg\//i.test(ua)) browser = "Microsoft Edge";
  else if (/opr\/|opera/i.test(ua)) browser = "Opera";
  else if (/chrome|crios/i.test(ua)) browser = "Chrome";
  else if (/firefox|fxios/i.test(ua)) browser = "Firefox";
  else if (/safari/i.test(ua)) browser = "Safari";

  return `${browser} on ${os}`;
}

export async function registerDeviceAndAlert(req, admin, method = "password") {
  try {
    const rawIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || "Unknown Device";
    const now = new Date().toISOString();

    const deviceCookie = req.cookies?.get?.("pf_device")?.value;

    if (deviceCookie) {
      const deviceHash = crypto.createHash("sha256").update(deviceCookie).digest("hex");
      const existing = await queryOne(
        `SELECT id, device_hash FROM admin_devices WHERE device_hash = ? LIMIT 1`,
        [deviceHash]
      );

      if (existing) {
        // Device recognized — update last seen timestamp, IP, and method. No email alert sent.
        await execute(
          `UPDATE admin_devices
           SET last_seen_at = ?, ip_last = ?, last_login_method = ?
           WHERE device_hash = ?`,
          [now, rawIp, method, deviceHash]
        );
        return { isNewDevice: false, deviceCookie: null };
      }
    }

    // New device detected (either no cookie or unknown hash)
    const newDeviceToken = crypto.randomBytes(32).toString("hex");
    const newDeviceHash = crypto.createHash("sha256").update(newDeviceToken).digest("hex");

    await execute(
      `INSERT INTO admin_devices
       (admin_id, device_hash, user_agent, ip_first, ip_last, first_seen_at, last_seen_at, last_login_method)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [admin.id, newDeviceHash, userAgent, rawIp, rawIp, now, now, method]
    );

    // Send New Device Alert Email via Resend
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      const dhakaTime = new Date().toLocaleString("en-US", {
        timeZone: "Asia/Dhaka",
        dateStyle: "full",
        timeStyle: "medium",
      });

      const browserSummary = parseUserAgentSummary(userAgent);
      const notifyAddress = "ashifur.badhon@gmail.com";
      const emailSubject = "New device login — Portfolio Admin";

      const textBody = `New device login detected on Portfolio Admin.

Time (Asia/Dhaka): ${dhakaTime}
Login Method: ${method}
IP Address: ${rawIp}
Device / Browser: ${browserSummary}
Raw User-Agent: ${userAgent}

If this wasn't you, change the admin password immediately.
`;

      const htmlBody = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; background: #0A0B10; border: 1px solid #23242B; color: #F5F2EA;">
          <div style="border-bottom: 1px solid #23242B; padding-bottom: 16px; margin-bottom: 20px;">
            <h2 style="color: #F59E0B; margin: 0 0 6px 0; font-size: 20px; font-weight: 700;">Security Alert: New Device Login</h2>
            <p style="color: #8E8B82; font-size: 13px; margin: 0; font-family: monospace;">Portfolio Central CMS • Administration Access</p>
          </div>

          <p style="color: #B9B5A9; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
            A successful sign-in occurred from a device or browser that hasn't been seen before.
          </p>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 13px;">
            <tr>
              <td style="padding: 8px 12px; background: #06070B; border: 1px solid #23242B; color: #8E8B82; width: 140px; font-family: monospace;">Login Time:</td>
              <td style="padding: 8px 12px; background: #06070B; border: 1px solid #23242B; color: #F5F2EA; font-weight: 600;">${dhakaTime} (Asia/Dhaka)</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; background: #06070B; border: 1px solid #23242B; color: #8E8B82; font-family: monospace;">Login Method:</td>
              <td style="padding: 8px 12px; background: #06070B; border: 1px solid #23242B; color: #F59E0B; font-weight: 600; text-transform: uppercase;">${method}</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; background: #06070B; border: 1px solid #23242B; color: #8E8B82; font-family: monospace;">IP Address:</td>
              <td style="padding: 8px 12px; background: #06070B; border: 1px solid #23242B; color: #F5F2EA; font-family: monospace;">${rawIp}</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; background: #06070B; border: 1px solid #23242B; color: #8E8B82; font-family: monospace;">Device / OS:</td>
              <td style="padding: 8px 12px; background: #06070B; border: 1px solid #23242B; color: #F5F2EA;">${browserSummary}</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; background: #06070B; border: 1px solid #23242B; color: #8E8B82; font-family: monospace;">User-Agent:</td>
              <td style="padding: 8px 12px; background: #06070B; border: 1px solid #23242B; color: #B9B5A9; font-size: 11px; word-break: break-all;">${userAgent}</td>
            </tr>
          </table>

          <div style="background: rgba(245, 158, 11, 0.08); border-left: 3px solid #F59E0B; padding: 12px 16px; margin-bottom: 24px;">
            <p style="margin: 0; font-size: 13px; font-weight: 600; color: #F5F2EA;">
              If this wasn't you, change the admin password immediately.
            </p>
          </div>
        </div>
      `;

      // Dispatch email (fire and catch errors so login never fails)
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Portfolio <onboarding@resend.dev>",
          to: [notifyAddress],
          subject: emailSubject,
          text: textBody,
          html: htmlBody,
        }),
      }).catch((err) => {
        console.error("[DeviceAlert] Failed to dispatch email via Resend:", err);
      });
    }

    return { isNewDevice: true, deviceCookie: newDeviceToken };
  } catch (err) {
    // Errors must NEVER block or fail login
    console.error("[DeviceAlert] Error registering device:", err);
    return { isNewDevice: false, deviceCookie: null };
  }
}

