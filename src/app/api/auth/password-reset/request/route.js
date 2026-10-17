import { NextResponse } from "next/server";
import crypto from "crypto";
import { getAdminByIdentifier, getDb } from "@/lib/db";
import { checkRateLimit } from "@/lib/rateLimit";

export async function POST(req) {
  try {
    const rateCheck = await checkRateLimit(req, "password-reset", 5, 3600);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "Too many password reset requests. Please try again later. (অত্যধিক অনুরোধ করা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।)",
        },
        { status: 429, headers: rateCheck.headers }
      );
    }

    const { identifier } = await req.json();
    const admin = await getAdminByIdentifier(identifier);
    if (!admin) {
      // Return success to prevent username enumeration
      return NextResponse.json({
        success: true,
        message: "If an administrative account exists with that identifier, instructions have been dispatched.",
      });
    }

    const resetToken = crypto.randomBytes(24).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");
    const expiresAt = new Date(Date.now() + 15 * 60000).toISOString();
    const now = new Date().toISOString();

    const db = getDb();
    await db.prepare(`
      INSERT INTO password_resets (admin_id, identifier, token_hash, expires_at, used, created_at)
      VALUES (?, ?, ?, ?, 0, ?)
    `).run(admin.id, identifier, tokenHash, expiresAt, now);

    return NextResponse.json({
      success: true,
      message: "Password reset instructions dispatched.",
    });
  } catch (error) {
    console.error("Password reset request error:", error);
    return NextResponse.json(
      { success: false, error: "Unable to process password reset request at this time." },
      { status: 500 }
    );
  }
}
