import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";
import { authenticateRequest } from "@/lib/auth";
import { saveMediaFile } from "@/lib/db";

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

    // Vercel serverless functions / database safe size limit (15MB)
    if (buffer.length > 15 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: "File size exceeds 15MB limit." },
        { status: 400 }
      );
    }

    const originalName = file.name || "upload.bin";
    const ext = (path.extname(originalName) || "").toLowerCase();
    const randomName = `${Date.now()}_${crypto.randomBytes(4).toString("hex")}${ext || ".bin"}`;
    const mimeType = file.type || "application/octet-stream";
    const base64Data = buffer.toString("base64");

    // 1. Save directly to Database (Neon PostgreSQL / SQLite)
    // This eliminates the Vercel EROFS (Read-only file system) error permanently
    await saveMediaFile({
      filename: randomName,
      originalName,
      mimeType,
      fileSize: buffer.length,
      data: base64Data,
    });

    // 2. Best-effort fallback to write to local public/uploads (local dev only)
    if (!process.env.VERCEL) {
      try {
        const uploadsDir = path.join(process.cwd(), "public", "uploads");
        await fs.mkdir(uploadsDir, { recursive: true });
        await fs.writeFile(path.join(uploadsDir, randomName), buffer);
      } catch (fsErr) {
        // Silently continue if read-only or permission restricted
        console.warn("Local disk write skipped:", fsErr.message);
      }
    }

    const publicUrl = `/api/media/${randomName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      file_name: originalName,
      file_size: buffer.length,
      mime_type: mimeType,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
