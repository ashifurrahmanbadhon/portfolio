import { NextResponse } from "next/server";
import crypto from "crypto";
import { getDb, hashPassword, addActivityLog } from "@/lib/db";
import { checkRateLimit } from "@/lib/rateLimit";

export async function POST(req) {
  try {
    const rateCheck = await checkRateLimit(req, "password-reset-confirm", 5, 3600);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "Too many password reset attempts. Please try again later. (অত্যধিক অনুরোধ করা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।)",
        },
        { status: 429, headers: rateCheck.headers }
      );
    }

    const { token, new_password } = await req.json();
    if (!token || !new_password) {
      return NextResponse.json({ success: false, error: "Token and new password are required." }, { status: 400 });
    }

    const tokenHash = crypto.createHash("sha256").update(token.trim()).digest("hex");
    const db = getDb();
    const now = new Date().toISOString();

    const record = await db.prepare("SELECT * FROM password_resets WHERE token_hash = ? AND used = 0 LIMIT 1").get(tokenHash);
    if (!record) {
      return NextResponse.json({ success: false, error: "Invalid or already used password reset token." }, { status: 400 });
    }

    if (record.expires_at < now) {
      return NextResponse.json({ success: false, error: "Reset token has expired." }, { status: 400 });
    }

    const { hash, salt } = hashPassword(new_password);
    await db.prepare("UPDATE admins SET password_hash = ?, salt = ?, updated_at = ? WHERE id = ?").run(hash, salt, now, record.admin_id);
    await db.prepare("UPDATE password_resets SET used = 1 WHERE id = ?").run(record.id);

    await addActivityLog("Password Reset Completed", "Admin password changed via verified reset token.", "Central CMS", record.identifier);

    return NextResponse.json({ success: true, message: "Password updated successfully. You can now login." });
  } catch (error) {
    console.error("Password reset confirm error:", error);
    return NextResponse.json({ success: false, error: "Unable to complete password reset at this time." }, { status: 500 });
  }
}
