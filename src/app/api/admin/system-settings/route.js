import { NextResponse } from "next/server";
import { getSystemSettings, saveSystemSettings } from "@/lib/db";
import { authenticateRequest } from "@/lib/auth";

export async function GET(req) {
  try {
    const user = authenticateRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const data = await getSystemSettings();
    return NextResponse.json(data);
  } catch (error) {
    console.error(error); return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const user = authenticateRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const { category, ...data } = await req.json();
    if (!category) {
      return NextResponse.json({ success: false, error: "Missing category" }, { status: 400 });
    }
    const result = await saveSystemSettings(category, data, user.sub);
    return NextResponse.json(result);
  } catch (error) {
    console.error(error); return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 });
  }
}
