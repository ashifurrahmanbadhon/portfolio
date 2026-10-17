import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";
import { authenticateRequest } from "@/lib/auth";
import { saveMediaFile } from "@/lib/db";

const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"]);

const MIME_BY_EXT = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif",
};

function verifyImageMagicBytes(buf, ext) {
  if (!buf || buf.length < 12) return false;
  // JPEG: FF D8 FF
  if (ext === ".jpg" || ext === ".jpeg") {
    return buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
  }
  // PNG: 89 50 4E 47
  if (ext === ".png") {
    return buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47;
  }
  // GIF: GIF87a or GIF89a
  if (ext === ".gif") {
    const header = buf.toString("ascii", 0, 6);
    return header === "GIF87a" || header === "GIF89a";
  }
  // WEBP: RIFF....WEBP
  if (ext === ".webp") {
    const riff = buf.toString("ascii", 0, 4);
    const webp = buf.toString("ascii", 8, 12);
    return riff === "RIFF" && webp === "WEBP";
  }
  // AVIF: ....ftyp(avif|mif1|avis)
  if (ext === ".avif") {
    const ftyp = buf.toString("ascii", 4, 8);
    const brand = buf.toString("ascii", 8, 12);
    return ftyp === "ftyp" && (brand === "avif" || brand === "mif1" || brand === "avis");
  }
  return false;
}

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

    const originalName = file.name || "upload.bin";
    const ext = (path.extname(originalName) || "").toLowerCase();

    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid file type. Only image files (JPEG, PNG, WebP, GIF, AVIF) are allowed.",
        },
        { status: 400 }
      );
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

    // Verify magic bytes
    if (!verifyImageMagicBytes(buffer, ext)) {
      return NextResponse.json(
        {
          success: false,
          error: "File verification failed. The file contents do not match a valid image.",
        },
        { status: 400 }
      );
    }

    const randomName = `${Date.now()}_${crypto.randomBytes(4).toString("hex")}${ext}`;
    const mimeType = MIME_BY_EXT[ext] || "application/octet-stream";
    const base64Data = buffer.toString("base64");

    // 1. Save directly to Database (Neon PostgreSQL / SQLite)
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
    return NextResponse.json({ success: false, error: "Internal server error during upload." }, { status: 500 });
  }
}
