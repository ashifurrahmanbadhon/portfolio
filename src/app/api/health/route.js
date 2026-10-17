import { NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";

export async function GET(req) {
  const user = authenticateRequest(req);
  if (!user) {
    return NextResponse.json({ status: "ok" });
  }
  return NextResponse.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: Math.round(process.uptime()),
  });
}
