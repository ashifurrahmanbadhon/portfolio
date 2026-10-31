import { NextResponse } from "next/server";
import { getPortfolioContent, updatePortfolioSection, getContentVersion } from "@/lib/db";
import { authenticateRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const CACHE_CONTROL_HEADER = "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0";

export async function GET() {
  try {
    const data = await getPortfolioContent();
    const version = String(data.content_version || data.site_settings?.content_version || 1);
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": CACHE_CONTROL_HEADER,
        "CDN-Cache-Control": "no-store",
        "Vercel-CDN-Cache-Control": "no-store",
        "X-Content-Version": version,
      },
    });
  } catch (error) {
    console.error("GET /api/content failed:", error);
    return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 });
  }
}

export async function HEAD() {
  try {
    const version = String(await getContentVersion().catch(() => 1));
    return new NextResponse(null, {
      status: 200,
      headers: {
        "Cache-Control": CACHE_CONTROL_HEADER,
        "CDN-Cache-Control": "no-store",
        "Vercel-CDN-Cache-Control": "no-store",
        "X-Content-Version": version,
      },
    });
  } catch (_) {
    return new NextResponse(null, {
      status: 200,
      headers: {
        "Cache-Control": CACHE_CONTROL_HEADER,
        "CDN-Cache-Control": "no-store",
        "Vercel-CDN-Cache-Control": "no-store",
      },
    });
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
    const res = await updatePortfolioSection(section, data, user.sub);
    return NextResponse.json(res);
  } catch (error) {
    console.error("PUT /api/content failed:", error);
    console.error(error); return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 });
  }
}
