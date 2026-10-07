import { NextResponse } from "next/server";
import { addActivityLog } from "@/lib/db";
import { authenticateRequest } from "@/lib/auth";

export async function POST(req) {
  try {
    const user = authenticateRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const { action, details, website_name } = await req.json();
    await addActivityLog(action, details, website_name || "Central CMS", user.sub);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
