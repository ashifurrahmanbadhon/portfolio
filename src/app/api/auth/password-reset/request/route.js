import { NextResponse } from "next/server";
import crypto from "crypto";
import { getAdminByIdentifier, getDb } from "@/lib/db";

export async function POST(req) {
  try {
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
      // For local development convenience:
      reset_token: resetToken,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
