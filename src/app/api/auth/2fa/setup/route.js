import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { authenticateRequest } from "@/lib/auth";
import { generateBase32Secret } from "@/lib/totp";

export async function POST(req) {
  try {
    const user = authenticateRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
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
      qr_code: qrDataUrl,
      otpauth_url: otpauthUrl,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
