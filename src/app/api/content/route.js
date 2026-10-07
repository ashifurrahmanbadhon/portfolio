import { NextResponse } from "next/server";
import { getPortfolioContent, updatePortfolioSection } from "@/lib/db";
import { authenticateRequest } from "@/lib/auth";

export async function GET() {
  try {
    const data = getPortfolioContent();
    return NextResponse.json(data);
  } catch (error) {
    console.error("GET /api/content failed:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const user = authenticateRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const body = await req.json();
    const { section, ...data } = body;
    if (!section) {
      return NextResponse.json({ success: false, error: "Missing section parameter" }, { status: 400 });
    }
    const res = updatePortfolioSection(section, data, user.sub);
    return NextResponse.json(res);
  } catch (error) {
    console.error("PUT /api/content failed:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
