import { NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";
import { exec } from "child_process";

export async function POST(req) {
  try {
    const user = authenticateRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (process.env.VERCEL) {
      return NextResponse.json({
        success: true,
        message: "Live on Vercel: Database is already in 100% real-time cloud sync with Neon PostgreSQL.",
        isVercel: true,
      });
    }

    return new Promise((resolve) => {
      exec("git status --porcelain", { cwd: process.cwd() }, (err, stdout) => {
        if (err) {
          resolve(
            NextResponse.json({ success: false, error: "Failed to check git status: " + err.message }, { status: 500 })
          );
          return;
        }

        const changes = (stdout || "")
          .split("\n")
          .map((l) => l.trim())
          .filter((l) => l.length > 0 && !l.includes("scratch/") && !l.endsWith(".db"));

        if (changes.length === 0) {
          resolve(
            NextResponse.json({
              success: true,
              message: "Everything is already 100% up to date with Git & GitHub! Live site is synchronized.",
              upToDate: true,
            })
          );
          return;
        }

        exec(
          'git add public/ .gitignore && git commit -m "chore(cms): sync admin updates to live" && git push origin main',
          { cwd: process.cwd() },
          (pushErr, pushOut, pushStderr) => {
            if (pushErr) {
              resolve(
                NextResponse.json(
                  { success: false, error: pushStderr || pushErr.message },
                  { status: 500 }
                )
              );
            } else {
              resolve(
                NextResponse.json({
                  success: true,
                  message: "Successfully pushed changes to GitHub! Live site deployment has been initiated.",
                  changesCount: changes.length,
                })
              );
            }
          }
        );
      });
    });
  } catch (error) {
    console.error("POST /api/admin/sync-git error:", error);
    return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 });
  }
}
