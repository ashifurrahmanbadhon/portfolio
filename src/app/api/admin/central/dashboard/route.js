import { NextResponse } from "next/server";
import { getCentralDashboard } from "@/lib/db";
import { authenticateRequest } from "@/lib/auth";

export async function GET(req) {
  try {
    const user = authenticateRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const data = await getCentralDashboard();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
