import { NextResponse } from "next/server";
import { getActivityLogs } from "@/lib/db";
import { authenticateRequest } from "@/lib/auth";

export async function GET(req) {
  try {
    const user = authenticateRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || "all";
    const search = searchParams.get("search") || "";
    const limit = searchParams.get("limit") || 50;

    const logs = getActivityLogs({ category, search, limit });
    return NextResponse.json({ success: true, logs });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
