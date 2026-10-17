import { NextResponse } from "next/server";
import { getToolGhorContent } from "@/lib/db";
import { authenticateRequest } from "@/lib/auth";

export async function GET(req) {
  try {
    const user = authenticateRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const data = await getToolGhorContent();
    return NextResponse.json(data);
  } catch (error) {
    console.error(error); return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 });
  }
}
