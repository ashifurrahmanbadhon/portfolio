import { NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";
import { isAdminOnline, updateAdminPresence } from "@/lib/db";

export async function POST(req) {
  try {
    const user = authenticateRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const res = await updateAdminPresence();
    return NextResponse.json({ success: true, online: true, last_seen: res.last_seen });
  } catch (error) {
    console.error("Presence POST error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const online = await isAdminOnline();
    return NextResponse.json({ success: true, online });
  } catch (error) {
    console.error("Presence GET error:", error);
    return NextResponse.json(
      { success: false, online: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
