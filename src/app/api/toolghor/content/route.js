import { NextResponse } from "next/server";
import { getToolGhorContent } from "@/lib/db";

export async function GET() {
  try {
    const data = await getToolGhorContent();
    return NextResponse.json(data);
  } catch (error) {
    console.error(error); return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 });
  }
}
