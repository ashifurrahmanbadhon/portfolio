import { NextResponse } from "next/server";
import { verifyChallengeToken } from "@/lib/auth";
import { getAdminById } from "@/lib/db";

export async function POST(req) {
  try {
    const { two_factor_token } = await req.json();
    const decoded = verifyChallengeToken(two_factor_token);
    if (!decoded) {
      return NextResponse.json({ success: false, error: "Invalid session." }, { status: 401 });
    }

    const admin = await getAdminById(decoded.uid);
    const masked = admin?.phone ? `******${admin.phone.slice(-4)}` : "******7284";

    return NextResponse.json({
      success: true,
      message: `SMS OTP simulated successfully to verified number (${masked}).`,
      cooldown_seconds: 60,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
