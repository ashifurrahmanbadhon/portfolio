import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { authenticateRequest } from "@/lib/auth";
import { generateBase32Secret } from "@/lib/totp";
import { getAdminById, verifyPassword } from "@/lib/db";

export async function POST(req) {
  try {
    const user = authenticateRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const password = body.password || body.current_password || body.currentPassword;

    if (!password) {
      return NextResponse.json(
        { success: false, error: "Administrative password is required to initiate 2FA setup." },
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

    const secret = generateBase32Secret(20);
    const issuer = "Ashifur Central CMS";
    const otpauthUrl = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(
      user.email || user.sub
    )}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;

    const qrDataUrl = await QRCode.toDataURL(otpauthUrl, {
      margin: 2,
      width: 250,
      color: { dark: "#000000", light: "#ffffff" },
    });

    return NextResponse.json({
      success: true,
      secret,
      manual_key: secret,
      qr_code: qrDataUrl,
      otpauth_url: otpauthUrl,
    });
  } catch (error) {
    console.error("2FA setup error:", error);
    return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 });
  }
}
