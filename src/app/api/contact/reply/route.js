import { NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";
import { addContactReply, queryOne } from "@/lib/db";

export async function POST(req) {
  try {
    const user = authenticateRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { messageId, reply } = body;

    if (!messageId) {
      return NextResponse.json({ success: false, error: "Message ID is required." }, { status: 400 });
    }

    const trimmedReply = typeof reply === "string" ? reply.trim() : "";
    if (!trimmedReply) {
      return NextResponse.json({ success: false, error: "Reply text cannot be empty." }, { status: 400 });
    }

    if (trimmedReply.length > 4000) {
      return NextResponse.json({ success: false, error: "Reply must not exceed 4000 characters." }, { status: 400 });
    }

    // Check Resend API key
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      return NextResponse.json(
        { success: false, error: "Email is not configured yet (RESEND_API_KEY missing)" },
        { status: 503 }
      );
    }

    // Fetch original message to get recipient email & subject
    const originalMsg = await queryOne("SELECT * FROM contact_messages WHERE id = ?", [messageId]);
    if (!originalMsg) {
      return NextResponse.json({ success: false, error: "Original message not found." }, { status: 404 });
    }

    if (!originalMsg.email) {
      return NextResponse.json({ success: false, error: "Original message has no recipient email address." }, { status: 400 });
    }

    const notifyAddress = process.env.NOTIFY_EMAIL || "ashifur.badhon@gmail.com";
    const emailSubject = `Re: ${originalMsg.subject || "your message"}`;

    const textContent = `${trimmedReply}\n\n---\nOn ${new Date(originalMsg.created_at || Date.now()).toLocaleDateString()}:\n> ${originalMsg.message}`;

    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1a202c; line-height: 1.6;">
        <div style="white-space: pre-wrap; font-size: 15px; margin-bottom: 24px; color: #1e293b;">${trimmedReply}</div>
        <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 13px;">
          <p style="margin: 0 0 8px 0; font-weight: 600;">Original inquiry from ${originalMsg.name} (${originalMsg.email}):</p>
          <blockquote style="margin: 0; padding-left: 12px; border-left: 3px solid #cbd5e1; color: #64748b; white-space: pre-wrap;">${originalMsg.message}</blockquote>
        </div>
      </div>
    `;

    // Attempt email delivery via Resend API
    let resendRes;
    try {
      resendRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Ashifur Rahman <onboarding@resend.dev>",
          to: [originalMsg.email],
          reply_to: notifyAddress,
          subject: emailSubject,
          text: textContent,
          html: htmlContent,
        }),
      });
    } catch (fetchErr) {
      console.error("Resend fetch failed:", fetchErr);
      return NextResponse.json({ success: false, error: "Failed to connect to email service" }, { status: 502 });
    }

    if (!resendRes.ok) {
      const errText = await resendRes.text();
      console.error("Resend API error response:", resendRes.status, errText);
      return NextResponse.json({ success: false, error: "Failed to send email reply" }, { status: 502 });
    }

    // Save row ONLY after successful send; mark original read
    const saveRes = await addContactReply(originalMsg.id, trimmedReply);

    return NextResponse.json({
      success: true,
      message: "Reply sent successfully",
      reply: saveRes.reply,
    });
  } catch (error) {
    console.error("Reply POST error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
