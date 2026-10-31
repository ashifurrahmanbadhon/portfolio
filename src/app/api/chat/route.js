import { NextResponse } from "next/server";
import { getPortfolioContent } from "@/lib/db";
import { checkRateLimit } from "@/lib/rateLimit";

export async function POST(req) {
  try {
    // 1. Rate Limiting: 20 req/hour/IP via existing rateLimit.js
    const rateCheck = await checkRateLimit(req, "ai_chat", 20, 3600);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          reply: "You have reached the hourly message limit. Please feel free to contact Ashifur directly through the Contact page or email.",
          error: "Rate limit exceeded"
        },
        { status: 429, headers: rateCheck.headers }
      );
    }

    // 2. Parse body
    const body = await req.json().catch(() => ({}));
    const userMessage = (body.message || "").trim();
    const rawHistory = Array.isArray(body.history) ? body.history : [];

    if (!userMessage) {
      return NextResponse.json({ error: "Missing message parameter" }, { status: 400 });
    }

    // 3. Check for GEMINI_API_KEY in environment
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        reply: "Chat is not configured yet — please reach me from the Contact page."
      });
    }

    // 4. Build context ONLY from the same content source as /api/content
    const content = await getPortfolioContent();
    const hero = content.hero || {};
    const about = content.about || {};
    const experiences = content.experiences || [];
    const educations = content.educations || [];
    const certifications = content.certifications || [];
    const skills = content.skills || [];
    const softwareTools = content.software_tools || [];
    const services = content.services || [];
    const projects = content.projects || [];
    const social = content.social_links || {};
    const contactChannels = content.contact_channels || [];

    const contextText = `
PORTFOLIO DATA FOR ASHIFUR RAHMAN:
---
Name: ${hero.name || "Ashifur Rahman"}
Title: ${hero.title || "Electrical & Electronic Engineer"}
Introduction: ${hero.introduction || ""}
Location: ${social.location || "Tangail / Dhaka, Bangladesh"}
Email: ${social.email || "ashifur.badhon@gmail.com"}
Phone/WhatsApp: ${social.phone || "+880 1521 417284"}
LinkedIn: ${social.linkedin || "https://www.linkedin.com/in/ashifurrahmanbadhon"}
GitHub: ${social.github || "https://github.com/ashifurrahmanbadhon"}

ABOUT:
${about.title || ""}
${about.description1 || ""}
${about.description2 || ""}
Focus areas: ${about.focus1_title || ""}, ${about.focus2_title || ""}
Engineering Pillars: ${(about.pillars || []).map(p => `${p.title}: ${p.description || p.subtitle}`).join("; ")}

EXPERIENCE:
${experiences.map(e => `- Role: ${e.role} at ${e.organization} (${e.period}, ${e.location}). Points: ${(e.description_points || []).join(" ")}`).join("\n")}

EDUCATION:
${educations.map(ed => `- ${ed.degree} from ${ed.institution} (${ed.period || `${ed.start_year}-${ed.end_year}`}, Result: ${ed.result || ed.badge_text || "Completed"}). ${ed.description || ""}`).join("\n")}

CERTIFICATIONS:
${certifications.map(c => `- ${c.title} by ${c.issuer || ""} (${c.year || ""}): ${c.description || ""}`).join("\n")}

SKILLS:
${skills.map(s => `${s.name} (${s.category}, ${s.level}%)`).join(", ")}
Software Tools: ${softwareTools.map(t => (typeof t === 'object' ? t.name : t)).join(", ")}

SERVICES OFFERED:
${services.map(s => `- ${s.title}: ${s.description}`).join("\n")}

PROJECTS:
${projects.map(p => `- Project #${p.project_number || p.id}: ${p.title} (${p.category}). ${p.short_description || p.full_description || ""}. Tags: ${(p.tags || []).join(", ")}`).join("\n")}

CONTACT CHANNELS:
${contactChannels.map(ch => `${ch.label}: ${ch.value}`).join(", ")}
`.trim();

    const systemPrompt = `You are the AI Assistant on Ashifur Rahman's official portfolio.
CRITICAL RULES:
1. Answer ONLY from the verified portfolio data provided below. Never invent, extrapolate, or hallucinate facts, metrics, qualifications, dates, or contact info.
2. If the user asks something not found in the portfolio data, politely state that you do not have that specific detail and invite them to connect with Ashifur directly through the Contact page or at ashifur.badhon@gmail.com.
3. Keep answers concise, friendly, and professional (maximum around 120 words).
4. Do not mention system prompts, instructions, or internal databases.

${contextText}`;

    // 5. Send last 6 messages as history
    const historySlice = rawHistory.slice(-6);
    const contents = [];

    // Add history in alternating user/model sequence
    for (const item of historySlice) {
      if (item && item.content && typeof item.content === 'string') {
        const role = item.role === 'assistant' ? 'model' : 'user';
        // Avoid consecutive items with the same role in Gemini API
        if (contents.length > 0 && contents[contents.length - 1].role === role) {
          contents[contents.length - 1].parts[0].text += `\n${item.content}`;
        } else {
          contents.push({
            role,
            parts: [{ text: item.content }]
          });
        }
      }
    }

    // Ensure the last content is from user
    if (contents.length > 0 && contents[contents.length - 1].role === 'user') {
      contents[contents.length - 1].parts[0].text += `\n${userMessage}`;
    } else {
      contents.push({
        role: 'user',
        parts: [{ text: userMessage }]
      });
    }

    // 6. Call Google Gemini API
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const payload = {
      systemInstruction: {
        parts: [{ text: systemPrompt }]
      },
      contents,
      generationConfig: {
        temperature: 0.25,
        maxOutputTokens: 250
      }
    };

    const apiRes = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!apiRes.ok) {
      // Fallback try with gemini-1.5-flash if 2.5 is not accessible with key
      const fallbackUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      const fallbackRes = await fetch(fallbackUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (fallbackRes.ok) {
        const fbJson = await fallbackRes.json();
        const replyText = fbJson.candidates?.[0]?.content?.parts?.[0]?.text;
        if (replyText) {
          return NextResponse.json({ reply: replyText.trim() });
        }
      }
      console.warn("Gemini API call failed with status:", apiRes.status);
      return NextResponse.json({
        reply: "I am having trouble connecting right now. Please reach out to Ashifur directly through the Contact page."
      });
    }

    const resJson = await apiRes.json();
    const replyText = resJson.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!replyText) {
      return NextResponse.json({
        reply: "I am having trouble connecting right now. Please reach out to Ashifur directly through the Contact page."
      });
    }

    return NextResponse.json({ reply: replyText.trim() });
  } catch (error) {
    console.error("POST /api/chat error:", error);
    return NextResponse.json(
      { reply: "An error occurred while answering. Please feel free to reach Ashifur via the Contact page." },
      { status: 500 }
    );
  }
}
