import { NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";
import { getAdminById } from "@/lib/db";

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

    return NextResponse.json({
      success: true,
      enabled: Boolean(admin.two_factor_enabled),
      phone: admin.phone ? `******${admin.phone.slice(-4)}` : "******7284",
    });
  } catch (error) {
    console.error(error); return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 });
  }
}
