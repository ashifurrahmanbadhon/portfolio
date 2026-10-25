import { NextResponse } from "next/server";
import { getPortfolioContent, updatePortfolioSection } from "@/lib/db";
import { authenticateRequest } from "@/lib/auth";

export const revalidate = 10;

const CACHE_CONTROL_HEADER = "public, s-maxage=10, stale-while-revalidate=59";

export async function GET() {
  try {
    const data = await getPortfolioContent();
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": CACHE_CONTROL_HEADER,
        "CDN-Cache-Control": CACHE_CONTROL_HEADER,
        "Vercel-CDN-Cache-Control": CACHE_CONTROL_HEADER,
      },
    });
  } catch (error) {
    console.error("GET /api/content failed:", error);
    return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 });
  }
}

export async function HEAD() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Cache-Control": CACHE_CONTROL_HEADER,
      "CDN-Cache-Control": CACHE_CONTROL_HEADER,
      "Vercel-CDN-Cache-Control": CACHE_CONTROL_HEADER,
    },
  });
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
    const res = await updatePortfolioSection(section, data, user.sub);
    return NextResponse.json(res);
  } catch (error) {
    console.error("PUT /api/content failed:", error);
    console.error(error); return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 });
  }
}
