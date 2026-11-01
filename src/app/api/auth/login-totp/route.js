import { NextResponse } from "next/server";
import {
  getSingleAdmin,
  checkAuthenticatorDoorLockout,
  recordFailedAuthenticatorAttempt,
  recordSuccessfulAuthenticatorLogin,
  queryAll,
  execute,
  addActivityLog,
} from "@/lib/db";
import { signToken } from "@/lib/auth";
import { verifyTOTPWithStep, verifyRecoveryCode } from "@/lib/totp";
import { checkRateLimit } from "@/lib/rateLimit";
import { registerDeviceAndAlert } from "@/lib/deviceAlert";

export async function POST(req) {
  try {
    // Rate limit: 5 attempts per 15 minutes per IP
    const rateCheck = await checkRateLimit(req, "login-totp", 5, 900);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "Too many authenticator login attempts. Please wait 15 minutes before trying again.",
        },
        { status: 429, headers: rateCheck.headers }
      );
    }

    const body = await req.json().catch(() => ({}));
    const rawCode = (body.code || "").trim();

    if (!rawCode) {
      return NextResponse.json(
        { success: false, error: "Verification code is required." },
        { status: 400 }
      );
    }

    // Load the single admin
    const admin = await getSingleAdmin();
    if (!admin || !admin.two_factor_enabled || !admin.totp_secret) {
      return NextResponse.json(
        { success: false, error: "Invalid code or authenticator not available." },
        { status: 400 }
      );
    }

    // Check Authenticator Door Lockout (3 consecutive failed attempts -> 15 min lock)
    const lockout = checkAuthenticatorDoorLockout(admin, 3);
    if (lockout.isLocked) {
      return NextResponse.json(
        { success: false, error: lockout.message },
        { status: 403 }
      );
    }

    let isValid = false;
    let loginMethod = "authenticator";
    let matchedTimeStep = null;
    const now = new Date().toISOString();

    // 1. Try TOTP with Anti-Replay check
    const totpResult = verifyTOTPWithStep(
      rawCode,
      admin.totp_secret,
      1,
      admin.last_totp_step || 0
    );

    if (totpResult.valid) {
      isValid = true;
      loginMethod = "authenticator";
      matchedTimeStep = totpResult.step;
    } else if (totpResult.reason === "replay") {
      // Code is valid cryptographically, but has already been used in this step
      const { attempts, isLocked: newlyLocked } = await recordFailedAuthenticatorAttempt(admin.id, 3, 15);
      await addActivityLog(
        "Failed Authenticator Login (Replayed Code)",
        `Rejected previously used TOTP code for: ${admin.username} (Failed attempts: ${attempts})`,
        "Central CMS",
        admin.username
      );

      const remaining = Math.max(0, 3 - attempts);
      const errorMsg =
        newlyLocked || remaining <= 0
          ? "Authenticator login is locked for ~15 min — use Password."
          : `Code has already been used. Please wait for the next 30-second token. (${remaining} attempt(s) remaining before authenticator lockout)`;

      return NextResponse.json(
        { success: false, error: errorMsg },
        { status: newlyLocked ? 403 : 401 }
      );
    } else {
      // 2. If not a valid TOTP, check if it matches an unused emergency recovery code
      const allCodes = (await queryAll(
        "SELECT id, code_hash FROM admin_recovery_codes WHERE admin_id = ? AND used = 0",
        [admin.id]
      )) || [];

      let matchedRecoveryId = null;
      for (const rc of allCodes) {
        if (verifyRecoveryCode(rawCode, rc.code_hash)) {
          matchedRecoveryId = rc.id;
          break;
        }
      }

      if (matchedRecoveryId) {
        isValid = true;
        loginMethod = "recovery_code";
        // Mark recovery code used immediately
        await execute(
          "UPDATE admin_recovery_codes SET used = 1, used_at = ? WHERE id = ?",
          [now, matchedRecoveryId]
        );
      }
    }

    // If neither matched: record failed attempt & check lock
    if (!isValid) {
      const { attempts, isLocked: newlyLocked } = await recordFailedAuthenticatorAttempt(admin.id, 3, 15);
      await addActivityLog(
        "Failed Authenticator Login",
        `Invalid authenticator/recovery code for: ${admin.username} (Failed attempts: ${attempts})`,
        "Central CMS",
        admin.username
      );

      const remaining = Math.max(0, 3 - attempts);
      const errorMsg =
        newlyLocked || remaining <= 0
          ? "Authenticator login is locked for ~15 min — use Password."
          : `Invalid authenticator or recovery code. (${remaining} attempt(s) remaining before authenticator lockout)`;

      return NextResponse.json(
        { success: false, error: errorMsg },
        { status: newlyLocked ? 403 : 401 }
      );
    }

    // Authenticator Door Success: session granted immediately
    await recordSuccessfulAuthenticatorLogin(admin.id, matchedTimeStep);
    const { token, exp } = signToken(admin, false);
    await addActivityLog(
      "Admin Login (Authenticator Door)",
      `Authenticated successfully via ${loginMethod === "recovery_code" ? "Emergency Recovery Code" : "Authenticator App (TOTP)"} into Central CMS.`,
      "Central CMS",
      admin.username
    );

    // Register device and send security alert if unrecognized
    const { deviceCookie } = await registerDeviceAndAlert(req, admin, loginMethod);

    const isProd = process.env.NODE_ENV === "production";
    const maxAge = 24 * 60 * 60; // 24 hours standard session

    const response = NextResponse.json({
      success: true,
      token,
      expires_at: exp,
      login_method: loginMethod,
      user: {
        id: admin.id,
        username: admin.username,
        full_name: admin.full_name || "Super Admin",
        email: admin.email || "",
        role: admin.role || "super_admin",
        avatar: admin.avatar || "/ashifur.jpeg",
        avatar_position: admin.avatar_position || "50% 50%",
      },
    });

    // Session cookie
    response.cookies.set("cms_auth_token", token, {
      path: "/",
      httpOnly: false,
      secure: isProd,
      sameSite: "lax",
      maxAge,
    });

    // Device identity cookie (if new device)
    if (deviceCookie) {
      response.cookies.set("pf_device", deviceCookie, {
        path: "/",
        httpOnly: true,
        secure: isProd,
        sameSite: "lax",
        maxAge: 365 * 24 * 60 * 60,
      });
    }

    return response;
  } catch (error) {
    console.error("POST /api/auth/login-totp error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}

