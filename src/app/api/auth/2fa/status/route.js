import { NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";
import { getAdminById, getDb } from "@/lib/db";

export async function GET(req) {
  try {
    const user = authenticateRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const admin = await getAdminById(user.uid);
    if (!admin) {
      return NextResponse.json({ success: false, error: "Admin not found" }, { status: 404 });
    }

    const db = getDb();
    const recRow = await db
      .prepare("SELECT COUNT(*) as c FROM admin_recovery_codes WHERE admin_id = ? AND used = 0")
      .get(admin.id);
    const remainingCodes = Number(recRow?.c || 0);

    return NextResponse.json({
      success: true,
      enabled: Boolean(admin.two_factor_enabled),
      phone: admin.phone ? `******${admin.phone.slice(-4)}` : "******7284",
      remaining_recovery_codes: remainingCodes,
    });
  } catch (error) {
    console.error(error); return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 });
  }
}
