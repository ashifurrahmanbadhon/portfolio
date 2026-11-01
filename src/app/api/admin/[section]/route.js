import { NextResponse } from "next/server";
import { updatePortfolioSection } from "@/lib/db";
import { authenticateRequest } from "@/lib/auth";
import { logActivity } from "@/lib/activity";

export async function PUT(req, { params }) {
  try {
    const user = authenticateRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const resolvedParams = await params;
    const section = resolvedParams.section;
    const data = await req.json();

    const result = await updatePortfolioSection(section, data, user.sub);
    await logActivity(req, user.uid, "content_updated", section);
    return NextResponse.json(result);
  } catch (error) {
    console.error(`PUT /api/admin/${params?.section} error:`, error);
    console.error(error); return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 });
  }
}
