import { NextResponse } from "next/server";
import { getToolGhorContent } from "@/lib/db";

export async function GET() {
  try {
    const data = getToolGhorContent();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
