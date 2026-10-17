import { NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";
import { verifyTOTP, generateRecoveryCodes, hashRecoveryCode } from "@/lib/totp";
import { getDb, getAdminById, verifyPassword, addActivityLog } from "@/lib/db";

export async function POST(req) {
  try {
    const user = authenticateRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { setup_token, code } = body;
    const password = body.password || body.current_password || body.currentPassword;

    if (!password) {
      return NextResponse.json(
        { success: false, error: "Administrative password is required to enable 2FA." },
        { status: 401 }
      );
    }

    const admin = await getAdminById(user.uid);
    if (!admin) {
      return NextResponse.json({ success: false, error: "Admin not found." }, { status: 404 });
    }

    if (!verifyPassword(password, admin.password_hash, admin.salt)) {
      return NextResponse.json(
        { success: false, error: "Incorrect administrative password." },
        { status: 401 }
      );
    }

    if (!setup_token || !code) {
      return NextResponse.json({ success: false, error: "Missing secret or verification code." }, { status: 400 });
    }

    const isValid = verifyTOTP(code, setup_token);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "Invalid verification code. Please check your authenticator app." },
        { status: 400 }
      );
    }

    const db = getDb();
    const recoveryCodes = generateRecoveryCodes(8);
    const now = new Date().toISOString();

    await db.prepare(`
      UPDATE admins
      SET two_factor_enabled = 1, totp_secret = ?, totp_created_at = ?, updated_at = ?
      WHERE id = ?
    `).run(setup_token, now, now, user.uid);

    // Save salted recovery codes
    await db.prepare("DELETE FROM admin_recovery_codes WHERE admin_id = ?").run(user.uid);
    const insertCode = db.prepare(`
      INSERT INTO admin_recovery_codes (admin_id, code_hash, used, created_at)
      VALUES (?, ?, 0, ?)
    `);
    for (const rc of recoveryCodes) {
      const saltedHash = hashRecoveryCode(rc);
      await insertCode.run(user.uid, saltedHash, now);
    }

    await addActivityLog("Enabled Two-Factor Authentication", "2FA activated with Google Authenticator.", "Central CMS", user.sub);

    return NextResponse.json({
      success: true,
      message: "Two-Factor Authentication enabled successfully",
      recovery_codes: recoveryCodes,
    });
  } catch (error) {
    console.error("2FA enable error:", error);
    return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 });
  }
}
