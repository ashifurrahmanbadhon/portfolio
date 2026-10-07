import { NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";
import { getAdminById, getDb } from "@/lib/db";

export async function GET(req) {
  try {
    const user = authenticateRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const admin = getAdminById(user.uid);
    if (!admin) {
      return NextResponse.json({ success: false, error: "Admin not found" }, { status: 404 });
    }

    const db = getDb();
    const remainingCodes =
      db
        .prepare("SELECT COUNT(*) as c FROM admin_recovery_codes WHERE admin_id = ? AND used = 0")
        .get(admin.id)?.c || 0;

    return NextResponse.json({
      success: true,
      enabled: Boolean(admin.two_factor_enabled),
      phone: admin.phone ? `******${admin.phone.slice(-4)}` : "******7284",
      remaining_recovery_codes: remainingCodes,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
