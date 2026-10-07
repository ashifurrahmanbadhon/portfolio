import { NextResponse } from "next/server";
import crypto from "crypto";
import { authenticateRequest } from "@/lib/auth";
import { verifyTOTP, generateRecoveryCodes } from "@/lib/totp";
import { getDb, addActivityLog } from "@/lib/db";

export async function POST(req) {
  try {
    const user = authenticateRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { setup_token, code } = await req.json();
    if (!setup_token || !code) {
      return NextResponse.json({ success: false, error: "Missing secret or verification code" }, { status: 400 });
    }

    const isValid = verifyTOTP(code, setup_token);
    if (!isValid) {
      return NextResponse.json({ success: false, error: "Invalid verification code. Please check your authenticator app." }, { status: 400 });
    }

    const db = getDb();
    const recoveryCodes = generateRecoveryCodes(8);
    const now = new Date().toISOString();

    db.prepare(`
      UPDATE admins
      SET two_factor_enabled = 1, totp_secret = ?, totp_created_at = ?, updated_at = ?
      WHERE id = ?
    `).run(setup_token, now, now, user.uid);

    // Save hashed recovery codes
    db.prepare("DELETE FROM admin_recovery_codes WHERE admin_id = ?").run(user.uid);
    const insertCode = db.prepare(`
      INSERT INTO admin_recovery_codes (admin_id, code_hash, used, created_at)
      VALUES (?, ?, 0, ?)
    `);
    for (const rc of recoveryCodes) {
      const hash = crypto.createHash("sha256").update(rc.replace("-", "").toLowerCase()).digest("hex");
      insertCode.run(user.uid, hash, now);
    }

    addActivityLog("Enabled Two-Factor Authentication", "2FA activated with Google Authenticator.", "Central CMS", user.sub);

    return NextResponse.json({
      success: true,
      message: "Two-Factor Authentication enabled successfully",
      recovery_codes: recoveryCodes,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
