import { NextResponse } from "next/server";
import { addContactMessage, getContactMessages, isAdminOnline, countUnreadContactMessages } from "@/lib/db";
import { authenticateRequest } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rateLimit";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req) {
  try {
    const rateCheck = await checkRateLimit(req, "contact", 5, 3600);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "Too many contact submissions. Please try again later. (অত্যধিক বার্তা পাঠানো হয়েছে। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।)",
        },
        { status: 429, headers: rateCheck.headers }
      );
    }

    const body = await req.json();
    let { name, email, subject, message } = body;

    name = typeof name === "string" ? name.trim() : "";
    email = typeof email === "string" ? email.trim() : "";
    subject = typeof subject === "string" ? subject.trim() : "";
    message = typeof message === "string" ? message.trim() : "";

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, error: "Name, email, and message are required." },
        { status: 400 }
      );
    }

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    if (name.length > 100) {
      return NextResponse.json(
        { success: false, error: "Name must not exceed 100 characters." },
        { status: 400 }
      );
    }

    if (message.length > 2000) {
      return NextResponse.json(
        { success: false, error: "Message must not exceed 2000 characters." },
        { status: 400 }
      );
    }

    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "";
    // DB insert ALWAYS happens (Inbox is the record; admin reply depends on it)
    await addContactMessage(name, email, subject, message, ip);

    // Check if admin is online (presence check failure defaults to false -> fail toward notifying)
    let isOnline = false;
    try {
      isOnline = await isAdminOnline();
    } catch (presErr) {
      console.warn("Presence check failed, defaulting to notify:", presErr);
      isOnline = false;
    }

    const isPackageInquiry = typeof subject === "string" && subject.startsWith("Package Inquiry:");

    // Only send email when owner is OFFLINE, OR ALWAYS if it's a hot lead (Package Inquiry)
    if (!isOnline || isPackageInquiry) {
      const resendApiKey = process.env.RESEND_API_KEY;
      if (resendApiKey) {
        try {
          const notifyAddress = process.env.NOTIFY_EMAIL || "ashifur.badhon@gmail.com";
          const dhakaTime = new Date().toLocaleString("en-US", {
            timeZone: "Asia/Dhaka",
            dateStyle: "full",
            timeStyle: "medium",
          });
          const adminUrl = process.env.NEXT_PUBLIC_APP_URL
            ? `${process.env.NEXT_PUBLIC_APP_URL}/admin`
            : "https://ashifurrahman.vercel.app/admin";

          const emailSubject = `New portfolio message: ${subject || "No subject"} — ${name}`;
          const textContent = `New message from ${name} (${email})\nSubject: ${subject || "No subject"}\nTime (Asia/Dhaka): ${dhakaTime}\n\nMessage:\n${message}\n\nAdmin Inbox: ${adminUrl}`;

          const htmlContent = `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff; color: #1a202c;">
              <h2 style="color: #0f172a; margin-top: 0; border-bottom: 2px solid #3b82f6; padding-bottom: 8px;">New Portfolio Inquiry</h2>
              <p style="font-size: 14px; color: #64748b; margin-bottom: 20px;">Received at <strong>${dhakaTime}</strong> (Asia/Dhaka)</p>
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <tr>
                  <td style="padding: 8px 0; color: #64748b; width: 90px; font-weight: 600;">Name:</td>
                  <td style="padding: 8px 0; color: #0f172a; font-weight: 500;">${name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Email:</td>
                  <td style="padding: 8px 0;"><a href="mailto:${email}" style="color: #3b82f6; text-decoration: none;">${email}</a></td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Subject:</td>
                  <td style="padding: 8px 0; color: #0f172a;">${subject || "No subject"}</td>
                </tr>
              </table>
              <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 16px; border-radius: 6px; margin-bottom: 24px;">
                <p style="margin: 0; white-space: pre-wrap; font-size: 15px; line-height: 1.6; color: #334155;">${message}</p>
              </div>
              <div style="text-align: center; margin-top: 24px;">
                <a href="${adminUrl}" style="background: #3b82f6; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">Open Admin Inbox</a>
              </div>
            </div>
          `;

          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${resendApiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: "Portfolio <onboarding@resend.dev>",
              to: [notifyAddress],
              reply_to: email,
              subject: emailSubject,
              text: textContent,
              html: htmlContent,
            }),
          });
        } catch (emailErr) {
          // Failure never fails the submission; key unset -> skip silently; log server-side only
          console.error("Resend notify email error:", emailErr);
        }
      }
    }

    return NextResponse.json({ success: true, message: "Inquiry saved successfully" });
  } catch (error) {
    console.error("Contact POST error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error. Please try again later." },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    const user = authenticateRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    if (searchParams.get("unread") === "1") {
      const unread = await countUnreadContactMessages();
      return NextResponse.json({ success: true, unread: Number(unread) });
    }

    const messages = await getContactMessages();
    return NextResponse.json({ success: true, messages });
  } catch (error) {
    console.error("Contact GET error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  try {
    const user = authenticateRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    let idsToDelete = [];
    const id = searchParams.get("id");
    const ids = searchParams.get("ids");
    if (ids) {
      idsToDelete = ids.split(",").map((i) => i.trim()).filter(Boolean);
    } else if (id) {
      idsToDelete = [id];
    } else {
      try {
        const body = await req.json();
        if (Array.isArray(body?.ids)) {
          idsToDelete = body.ids;
        } else if (body?.id) {
          idsToDelete = [body.id];
        }
      } catch (e) {
        // no json body
      }
    }

    if (idsToDelete.length === 0) {
      return NextResponse.json({ success: false, error: "ID or IDs required" }, { status: 400 });
    }

    const { deleteContactMessage } = await import("@/lib/db");
    for (const msgId of idsToDelete) {
      await deleteContactMessage(msgId);
    }
    return NextResponse.json({ success: true, count: idsToDelete.length });
  } catch (error) {
    console.error("Contact DELETE error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}

export async function PATCH(req) {
  try {
    const user = authenticateRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const body = await req.json();
    const { id, is_read } = body;
    if (!id) {
      return NextResponse.json({ success: false, error: "ID required" }, { status: 400 });
    }
    const { markContactMessageRead } = await import("@/lib/db");
    await markContactMessageRead(id, is_read !== undefined ? is_read : 1);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact PATCH error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}
