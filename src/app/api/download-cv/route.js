import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { queryOne } from "@/lib/db";
import { isSafePublicUrl } from "@/lib/security";

export async function GET() {
  try {
    let fileBuffer = null;
    const fileName = "Ashifur_Rahman_CV.pdf";

    // Check if custom resume is configured in DB
    try {
      const resumeRow = await queryOne("SELECT * FROM resumes WHERE id = 1 OR is_active = 1 LIMIT 1");
      if (resumeRow?.file_url && resumeRow.file_url.startsWith("http")) {
        const safeCheck = isSafePublicUrl(resumeRow.file_url);
        if (safeCheck.safe) {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout
          const response = await fetch(resumeRow.file_url, { signal: controller.signal });
          clearTimeout(timeout);
          if (response.ok) {
            const arrayBuffer = await response.arrayBuffer();
            fileBuffer = Buffer.from(arrayBuffer);
          }
        } else {
          console.warn("Blocked unsafe resume URL:", resumeRow.file_url);
        }
      }
    } catch (fetchErr) {
      console.warn("Custom resume remote fetch failed, falling back to local:", fetchErr.message);
    }

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
    console.error("Error downloading CV:", err);
    return new NextResponse("Error downloading CV. Please try again later.", { status: 500 });
  }
}
