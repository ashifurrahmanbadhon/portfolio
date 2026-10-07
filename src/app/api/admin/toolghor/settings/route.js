import { NextResponse } from "next/server";
import { saveToolGhorSettings } from "@/lib/db";
import { authenticateRequest } from "@/lib/auth";

export async function PUT(req) {
  try {
    const user = authenticateRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const body = await req.json();
    const result = saveToolGhorSettings(body, user.sub);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
