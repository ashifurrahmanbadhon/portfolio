import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";
import { authenticateRequest } from "@/lib/auth";

export async function POST(req) {
  try {
    const user = authenticateRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });

    const originalName = file.name || "upload.bin";
    const ext = (path.extname(originalName) || "").toLowerCase();
    
    // Check max file size (50MB)
    if (buffer.length > 50 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: "File size exceeds 50MB limit." }, { status: 400 });
    }

    const randomName = `${Date.now()}_${crypto.randomBytes(4).toString("hex")}${ext || ".bin"}`;
    const filePath = path.join(uploadsDir, randomName);

    await fs.writeFile(filePath, buffer);

    const publicUrl = `/uploads/${randomName}`;
    return NextResponse.json({
      success: true,
      url: publicUrl,
      file_name: originalName,
      file_size: buffer.length,
      mime_type: file.type || "application/octet-stream",
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
