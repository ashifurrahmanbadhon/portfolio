import { NextResponse } from "next/server";
import { getWebsites } from "@/lib/db";
import { authenticateRequest } from "@/lib/auth";
import { isSafePublicUrl } from "@/lib/security";

export async function POST(req, { params }) {
  try {
    const user = authenticateRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const resolvedParams = await params;
    const websites = await getWebsites();
    const site = websites.find((w) => String(w.id) === String(resolvedParams.id));

    if (!site) {
      return NextResponse.json({ success: false, error: "Website not found" }, { status: 404 });
    }

    const safeCheck = isSafePublicUrl(site.url);
    if (!safeCheck.safe) {
      return NextResponse.json(
        { success: false, error: safeCheck.error || "Blocked private or unsafe target URL." },
        { status: 400 }
      );
    }

    const start = Date.now();
    let status = "online";
    let latency = 45;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(site.url, { method: "HEAD", signal: controller.signal });
      clearTimeout(timeout);
      latency = Math.max(12, Date.now() - start);
      status = res.ok ? "online" : "warning";
    } catch {
      status = "offline";
      latency = 0;
    }

    return NextResponse.json({
      success: true,
      site_id: site.id,
      name: site.name,
      status,
      latency_ms: latency,
      checked_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Ping error:", error);
    return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 });
  }
}
