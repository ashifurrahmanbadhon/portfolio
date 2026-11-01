import { NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";
import { queryAll } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const user = authenticateRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const rows = (await queryAll("SELECT * FROM activity_log ORDER BY created_at DESC, id DESC LIMIT 30")) || [];

    return NextResponse.json({
      success: true,
      activities: rows,
    });
  } catch (error) {
    console.error("GET /api/admin/activity error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
