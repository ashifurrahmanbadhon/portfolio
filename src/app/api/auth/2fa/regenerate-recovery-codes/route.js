import { NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";
import { getDb, verifyPassword, getAdminById, addActivityLog } from "@/lib/db";
import { generateRecoveryCodes, hashRecoveryCode } from "@/lib/totp";

export async function POST(req) {
  try {
    const user = authenticateRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { password } = await req.json();
    const db = getDb();
    const admin = await getAdminById(user.uid);

    if (!admin || !verifyPassword(password, admin.password_hash, admin.salt)) {
      return NextResponse.json({ success: false, error: "Invalid administrative password." }, { status: 401 });
    }

    const recoveryCodes = generateRecoveryCodes(8);
    const now = new Date().toISOString();

    await db.prepare("DELETE FROM admin_recovery_codes WHERE admin_id = ?").run(user.uid);
    const insertCode = db.prepare(`
      INSERT INTO admin_recovery_codes (admin_id, code_hash, used, created_at)
      VALUES (?, ?, 0, ?)
    `);
    for (const rc of recoveryCodes) {
      const saltedHash = hashRecoveryCode(rc);
      await insertCode.run(user.uid, saltedHash, now);
    }

    await addActivityLog("Regenerated 2FA Recovery Codes", "New backup codes generated.", "Central CMS", user.sub);

    return NextResponse.json({ success: true, recovery_codes: recoveryCodes });
  } catch (error) {
    console.error("Regenerate recovery codes error:", error);
    return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 });
  }
}
