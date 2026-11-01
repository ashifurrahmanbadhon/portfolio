import { NextResponse } from "next/server";
import {
  getAdminByIdentifier,
  verifyPassword,
  checkPasswordDoorLockout,
  recordFailedPasswordAttempt,
  recordSuccessfulPasswordLogin,
  addActivityLog,
} from "@/lib/db";
import { signToken } from "@/lib/auth";
import { registerDeviceAndAlert } from "@/lib/deviceAlert";

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const identifier = (body.identifier || body.username || body.email || "admin").trim();
    const password = (body.password || "").trim();
    const rememberMe = body.remember ?? body.remember_me ?? false;

    if (!password) {
      return NextResponse.json(
        { success: false, error: "Password is required." },
        { status: 400 }
      );
    }

    const admin = await getAdminByIdentifier(identifier);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Invalid username or password." },
        { status: 401 }
      );
    }

    // Check Password Door Lockout (3 consecutive failed attempts -> 15 min lock)
    const lockout = checkPasswordDoorLockout(admin, 3);
    if (lockout.isLocked) {
      return NextResponse.json(
        { success: false, error: lockout.message },
        { status: 403 }
      );
    }

    // Verify Password
    const isValid = verifyPassword(password, admin.password_hash, admin.salt);
    if (!isValid) {
      const { attempts, isLocked: newlyLocked } = await recordFailedPasswordAttempt(admin.id, 3, 15);
      await addActivityLog(
        "Failed Login Attempt (Password Door)",
        `Invalid password for user: ${admin.username} (Failed attempts: ${attempts})`,
        "Central CMS",
        admin.username
      );

      const remaining = Math.max(0, 3 - attempts);
      const errorMsg =
        newlyLocked || remaining <= 0
          ? "Password login is locked for ~15 min — use Authenticator."
          : `Invalid username or password. (${remaining} attempt(s) remaining before password lockout)`;

      return NextResponse.json(
        { success: false, error: errorMsg },
        { status: newlyLocked ? 403 : 401 }
      );
    }

    // Password Door Success: session granted immediately (NO 2FA challenge)
    await recordSuccessfulPasswordLogin(admin.id);
    const { token, exp } = signToken(admin, rememberMe);
    await addActivityLog(
      "Admin Login (Password Door)",
      "Authenticated successfully via password into Central CMS.",
      "Central CMS",
      admin.username
    );

    // Register device and send security alert if unrecognized
    const { deviceCookie } = await registerDeviceAndAlert(req, admin, "password");

    const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60;
    const isProd = process.env.NODE_ENV === "production";

    const response = NextResponse.json({
      success: true,
      token,
      expires_at: exp,
      login_method: "password",
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
    console.error("POST /api/auth/login error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}
