import { NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";
import { getAdminById, updateAdminProfile } from "@/lib/db";

export async function GET(req) {
  try {
    const user = authenticateRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const admin = await getAdminById(user.uid);
    if (!admin) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }
    return NextResponse.json({
      success: true,
      user: {
        id: admin.id,
        username: admin.username,
        full_name: admin.full_name || "Ashifur Rahman",
        email: admin.email || "",
        role: admin.role || "super_admin",
        avatar: admin.avatar || "/ashifur.jpeg",
        two_factor_enabled: Boolean(admin.two_factor_enabled),
      },
    });
  } catch (error) {
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
    await updateAdminProfile(user.uid, {
      fullName: body.full_name,
      email: body.email,
      avatar: body.avatar,
      currentPassword: body.current_password,
      newPassword: body.new_password,
    });
    return NextResponse.json({ success: true, message: "Profile updated successfully" });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
