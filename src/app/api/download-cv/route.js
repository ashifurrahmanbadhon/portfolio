import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { queryOne } from "@/lib/db";

export async function GET() {
  try {
    let fileBuffer = null;
    const fileName = "Ashifur_Rahman_CV.pdf";

    // Check if custom resume is configured in DB
    try {
      const resumeRow = await queryOne("SELECT * FROM resumes WHERE id = 1 OR is_active = 1 LIMIT 1");
      if (resumeRow?.file_url && resumeRow.file_url.startsWith("http")) {
        const response = await fetch(resumeRow.file_url);
        if (response.ok) {
          const arrayBuffer = await response.arrayBuffer();
          fileBuffer = Buffer.from(arrayBuffer);
        }
      }
    } catch (_) {}

    // Fallback to local /public/resume.pdf
    if (!fileBuffer) {
      const filePath = path.join(process.cwd(), "public", "resume.pdf");
      if (fs.existsSync(filePath)) {
        fileBuffer = fs.readFileSync(filePath);
      }
    }

    if (!fileBuffer) {
      return new NextResponse("Resume file not found", { status: 404 });
    }

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err) {
    return new NextResponse("Error downloading CV: " + err.message, { status: 500 });
  }
}
