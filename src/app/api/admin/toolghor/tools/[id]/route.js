import { NextResponse } from "next/server";
import { saveToolGhorTool, deleteToolGhorTool } from "@/lib/db";
import { authenticateRequest } from "@/lib/auth";

export async function PUT(req, { params }) {
  try {
    const user = authenticateRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const resolvedParams = await params;
    const body = await req.json();
    const result = await saveToolGhorTool(resolvedParams.id, body, user.sub);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const user = authenticateRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const resolvedParams = await params;
    const result = await deleteToolGhorTool(resolvedParams.id, user.sub);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
