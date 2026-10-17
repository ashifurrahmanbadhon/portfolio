import { NextResponse } from "next/server";
import crypto from "crypto";
import { verifyChallengeToken, signToken } from "@/lib/auth";
import {
  getAdminById,
  recordSuccessfulLogin,
  recordFailed2faAttempt,
  checkAdmin2faLockout,
  addActivityLog,
  getDb
} from "@/lib/db";
import { verifyTOTP } from "@/lib/totp";
import { checkRateLimit } from "@/lib/rateLimit";

export async function POST(req) {
  try {
    const rateCheck = await checkRateLimit(req, "verify-2fa", 10, 900);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "Too many 2FA verification attempts. Please wait 15 minutes before trying again. (অত্যধিক ২এফএ যাচাইকরণের চেষ্টা করা হয়েছে। ১৫ মিনিট পর আবার চেষ্টা করুন।)",
        },
        { status: 429, headers: rateCheck.headers }
      );
    }

    const { challenge_token, code, is_recovery } = await req.json();

    const decoded = verifyChallengeToken(challenge_token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired 2FA session. Please log in again." },
        { status: 401 }
      );
    }

    const admin = await getAdminById(decoded.uid);
    if (!admin) {
      return NextResponse.json({ success: false, error: "Admin account not found." }, { status: 404 });
    }

    // Check account-level 2FA lockout
    const lockout = checkAdmin2faLockout(admin);
    if (lockout.isLocked) {
      return NextResponse.json({ success: false, error: lockout.message }, { status: 423 });
    }

    const db = getDb();

    if (is_recovery) {
      // Recovery code check
      const cleanCode = (code || "").replace("-", "").toLowerCase().trim();
      const codeHash = crypto.createHash("sha256").update(cleanCode).digest("hex");
      const rec = await db.prepare(
        "SELECT id FROM admin_recovery_codes WHERE admin_id = ? AND code_hash = ? AND used = 0 LIMIT 1"
      ).get(admin.id, codeHash);

      if (!rec) {
        await recordFailed2faAttempt(admin.id);
        return NextResponse.json({ success: false, error: "Invalid or already used recovery code." }, { status: 401 });
      }

      // Mark used
      await db.prepare("UPDATE admin_recovery_codes SET used = 1, used_at = ? WHERE id = ?").run(
        new Date().toISOString(),
        rec.id
      );
    } else {
      // TOTP check
      if (!admin.totp_secret || !verifyTOTP(code, admin.totp_secret)) {
        await recordFailed2faAttempt(admin.id);
        return NextResponse.json({ success: false, error: "Invalid 6-digit authenticator code." }, { status: 401 });
      }
    }

    await recordSuccessfulLogin(admin.id);
    const { token, exp } = signToken(admin, decoded.remember);
    await addActivityLog(
      "2FA Verification Successful",
      `Admin logged in via ${is_recovery ? "Recovery Code" : "Authenticator App"}.`,
      "Central CMS",
      admin.username
    );

    return NextResponse.json({
      success: true,
      token,
      expires_at: exp,
      user: {
        id: admin.id,
        username: admin.username,
        full_name: admin.full_name || "Super Admin",
        email: admin.email || "",
        role: admin.role || "super_admin",
        avatar: admin.avatar || "/ashifur.jpeg",
      },
    });
  } catch (error) {
    console.error("2FA verify error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error during verification." },
      { status: 500 }
    );
  }
}
