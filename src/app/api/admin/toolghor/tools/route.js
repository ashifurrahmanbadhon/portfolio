import { NextResponse } from "next/server";
import { saveToolGhorTool } from "@/lib/db";
import { authenticateRequest } from "@/lib/auth";

export async function POST(req) {
  try {
    const user = authenticateRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const body = await req.json();
    const result = await saveToolGhorTool(null, body, user.sub);
    return NextResponse.json(result);
  } catch (error) {
    console.error(error); return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 });
  }
}
