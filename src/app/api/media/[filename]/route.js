import { NextResponse } from "next/server";
import { getMediaFile } from "@/lib/db";
import path from "path";
import fs from "fs/promises";

export async function GET(req, { params }) {
  try {
    const resolvedParams = await params;
    const filename = resolvedParams?.filename;

    if (!filename) {
      return new NextResponse("Filename is required", { status: 400 });
    }

    // 1. Try DB (Neon PostgreSQL or SQLite)
    const media = await getMediaFile(filename);
    if (media && media.data) {
      const buffer = Buffer.from(media.data, "base64");
      return new NextResponse(buffer, {
        status: 200,
        headers: {
          "Content-Type": media.mime_type || "application/octet-stream",
          "Content-Length": buffer.length.toString(),
          "Cache-Control": "public, max-age=31536000, immutable",
          "Content-Disposition": `inline; filename="${media.original_name || filename}"`,
        },
      });
    }

    // 2. Fallback to local filesystem (for pre-existing static uploads)
    try {
      const filePath = path.join(process.cwd(), "public", "uploads", filename);
      const fileData = await fs.readFile(filePath);
      return new NextResponse(fileData, {
        status: 200,
        headers: {
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    } catch {
      // File not found on disk
    }

    return new NextResponse("File not found", { status: 404 });
  } catch (error) {
    console.error("Media route error:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
