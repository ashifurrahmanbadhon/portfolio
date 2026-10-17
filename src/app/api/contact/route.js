import { NextResponse } from "next/server";
import { addContactMessage, getContactMessages } from "@/lib/db";
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
    await addContactMessage(name, email, subject, message, ip);
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
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, error: "ID required" }, { status: 400 });
    }
    const { deleteContactMessage } = await import("@/lib/db");
    await deleteContactMessage(id);
    return NextResponse.json({ success: true });
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
