import { NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";
import { getDb, verifyPassword, getAdminById, addActivityLog } from "@/lib/db";
import { verifyTOTP } from "@/lib/totp";

export async function POST(req) {
  try {
    const user = authenticateRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { password, code } = await req.json();
    const db = getDb();
    const admin = await getAdminById(user.uid);

    if (!admin) {
      return NextResponse.json({ success: false, error: "Admin not found" }, { status: 404 });
    }

    // Verify Password
    if (!verifyPassword(password, admin.password_hash, admin.salt)) {
      return NextResponse.json({ success: false, error: "Incorrect administrative password." }, { status: 401 });
    }

    // Verify code if provided
    if (code && admin.totp_secret) {
      const isValid = verifyTOTP(code, admin.totp_secret);
      if (!isValid) {
        return NextResponse.json({ success: false, error: "Invalid 2FA code." }, { status: 400 });
      }
    }

    const now = new Date().toISOString();
    await db.prepare(`
      UPDATE admins
      SET two_factor_enabled = 0, totp_secret = NULL, totp_created_at = NULL, updated_at = ?
      WHERE id = ?
    `).run(now, user.uid);

    await db.prepare("DELETE FROM admin_recovery_codes WHERE admin_id = ?").run(user.uid);
    await addActivityLog("Disabled Two-Factor Authentication", "2FA was disabled for admin account.", "Central CMS", user.sub);

    return NextResponse.json({ success: true, message: "Two-Factor Authentication disabled" });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
