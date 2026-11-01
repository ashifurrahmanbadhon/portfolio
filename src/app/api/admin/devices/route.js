import { NextResponse } from "next/server";
import crypto from "crypto";
import { authenticateRequest } from "@/lib/auth";
import { queryAll, queryOne, execute } from "@/lib/db";
import { parseUserAgentSummary } from "@/lib/deviceAlert";
import { logActivity } from "@/lib/activity";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const user = authenticateRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const rows = (await queryAll("SELECT * FROM admin_devices ORDER BY last_seen_at DESC, id DESC")) || [];

    const deviceCookie = req.cookies?.get?.("pf_device")?.value;
    const currentHash = deviceCookie
      ? crypto.createHash("sha256").update(deviceCookie).digest("hex")
      : null;

    const devices = rows.map((r) => ({
      id: r.id,
      admin_id: r.admin_id,
      user_agent: r.user_agent,
      browser_summary: parseUserAgentSummary(r.user_agent),
      ip_first: r.ip_first,
      ip_last: r.ip_last,
      first_seen_at: r.first_seen_at,
      last_seen_at: r.last_seen_at,
      last_login_method: r.last_login_method || "password",
      is_current: Boolean(currentHash && r.device_hash === currentHash),
    }));

    return NextResponse.json({ success: true, devices });
  } catch (error) {
    console.error("GET /api/admin/devices error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const user = authenticateRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { searchParams } = new URL(req.url);
    const id = body.id || searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Device ID is required." }, { status: 400 });
    }

    const device = await queryOne("SELECT * FROM admin_devices WHERE id = ?", [id]);
    if (!device) {
      return NextResponse.json({ success: false, error: "Device not found." }, { status: 404 });
    }

    const uaSummary = parseUserAgentSummary(device.user_agent);

    await execute("DELETE FROM admin_devices WHERE id = ?", [id]);

    await logActivity(req, user.uid, "device_removed", uaSummary);

    return NextResponse.json({ success: true, message: "Device removed." });
  } catch (error) {
    console.error("DELETE /api/admin/devices error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
