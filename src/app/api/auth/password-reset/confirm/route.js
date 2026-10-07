import { NextResponse } from "next/server";
import crypto from "crypto";
import { getDb, hashPassword, addActivityLog } from "@/lib/db";

export async function POST(req) {
  try {
    const { token, new_password } = await req.json();
    if (!token || !new_password) {
      return NextResponse.json({ success: false, error: "Token and new password are required." }, { status: 400 });
    }

    const tokenHash = crypto.createHash("sha256").update(token.trim()).digest("hex");
    const db = getDb();
    const now = new Date().toISOString();

    const record = db.prepare("SELECT * FROM password_resets WHERE token_hash = ? AND used = 0 LIMIT 1").get(tokenHash);
    if (!record) {
      return NextResponse.json({ success: false, error: "Invalid or already used password reset token." }, { status: 400 });
    }

    if (record.expires_at < now) {
      return NextResponse.json({ success: false, error: "Reset token has expired." }, { status: 400 });
    }

    const { hash, salt } = hashPassword(new_password);
    db.prepare("UPDATE admins SET password_hash = ?, salt = ?, updated_at = ? WHERE id = ?").run(hash, salt, now, record.admin_id);
    db.prepare("UPDATE password_resets SET used = 1 WHERE id = ?").run(record.id);

    addActivityLog("Password Reset Completed", "Admin password changed via verified reset token.", "Central CMS", record.identifier);

    return NextResponse.json({ success: true, message: "Password updated successfully. You can now login." });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
