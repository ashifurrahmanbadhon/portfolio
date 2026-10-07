import { NextResponse } from "next/server";
import {
  getAdminByIdentifier,
  verifyPassword,
  checkAdminLockout,
  recordFailedLogin,
  recordSuccessfulLogin,
  addActivityLog,
} from "@/lib/db";
import { signToken, signChallengeToken } from "@/lib/auth";

export async function POST(req) {
  try {
    const { username, password, remember_me } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: "Username and password are required." },
        { status: 400 }
      );
    }

    const admin = getAdminByIdentifier(username);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Invalid username or password." },
        { status: 401 }
      );
    }

    // Check Lockout
    const { isLocked, message } = checkAdminLockout(admin);
    if (isLocked) {
      return NextResponse.json({ success: false, error: message }, { status: 403 });
    }

    // Check Password
    const isValid = verifyPassword(password, admin.password_hash, admin.salt);
    if (!isValid) {
      const attempts = recordFailedLogin(admin.id);
      addActivityLog(
        "Failed Login Attempt",
        `Invalid password for user: ${admin.username} (Attempt ${attempts})`,
        "Central CMS",
        admin.username
      );
      const remaining = Math.max(0, 5 - attempts);
      const errorMsg =
        remaining > 0
          ? `Invalid username or password. (${remaining} attempt(s) remaining before temporary lockout)`
          : "Account has been locked for 15 minutes due to too many failed attempts.";
      return NextResponse.json({ success: false, error: errorMsg }, { status: 401 });
    }

    // Check if 2FA is active
    if (admin.two_factor_enabled) {
      const challengeToken = signChallengeToken(admin, remember_me);
      return NextResponse.json({
        success: true,
        requires_2fa: true,
        challenge_token: challengeToken,
        two_factor_token: challengeToken,
        masked_phone: admin.phone ? `******${admin.phone.slice(-4)}` : "******7284",
        user: {
          id: admin.id,
          username: admin.username,
          phone: admin.phone || "",
        },
      });
    }

    // Direct Login Success
    recordSuccessfulLogin(admin.id);
    const { token, exp } = signToken(admin, remember_me);
    addActivityLog("Super Admin Login", "Authenticated successfully into Central CMS.", "Central CMS", admin.username);

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
        avatar: "/ashifur.jpeg",
      },
    });
  } catch (error) {
    console.error("POST /api/auth/login error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
