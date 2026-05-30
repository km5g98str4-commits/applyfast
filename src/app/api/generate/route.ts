// Local API route - runs on laptop, NEVER deployed with keys
// DeepSeek is cheaper and runs locally only

import { NextResponse } from "next/server";

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_BASE_URL = "https://api.deepseek.com/v1";

// Simple in-memory rate limiting (resets on restart)
const usageStore: Record<string, number> = {};

function getUsageKey(ip: string): string {
  const today = new Date().toISOString().split("T")[0];
  return `${ip}-${today}`;
}

// Fallback: use OpenAI if DeepSeek key not set locally
async function callAI(
  model: string,
  messages: any[],
  responseFormat?: any
): Promise<string> {
  // Try DeepSeek first
  if (DEEPSEEK_API_KEY) {
    const res = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.3,
        max_tokens: 1500,
        ...(responseFormat ? { response_format: responseFormat } : {}),
      }),
    });

    if (res.ok) {
      const json = await res.json();
      return json.choices[0]?.message?.content || "";
    }

    // If DeepSeek fails, try OpenAI as fallback
    if (process.env.OPENAI_API_KEY) {
      console.log("DeepSeek failed, falling back to OpenAI");
    } else {
      throw new Error(`DeepSeek API error: ${res.status}`);
    }
  }

  // Fallback to OpenAI if available
  if (process.env.OPENAI_API_KEY) {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        temperature: 0.3,
        max_tokens: 1500,
        ...(responseFormat ? { response_format: responseFormat } : {}),
      }),
    });

    if (!res.ok) throw new Error(`OpenAI API error: ${res.status}`);
    const json = await res.json();
    return json.choices[0]?.message?.content || "";
  }

  throw new Error("No API keys configured");
}

export async function POST(req: Request) {
  try {
    const { cv, jobLink, jobDescription } = await req.json();

    if (!cv || (!jobLink && !jobDescription)) {
      return NextResponse.json(
        { error: "Missing CV or job description" },
        { status: 400 }
      );
    }

    // Rate limiting: 3 free per day per IP
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";
    const key = getUsageKey(ip);
    usageStore[key] = (usageStore[key] || 0) + 1;

    if (usageStore[key] > 3) {
      return NextResponse.json(
        {
          error: "FREE_LIMIT",
          message:
            "You've used your 3 free applications today. Support us with $3 for unlimited access (IBAN payment).",
          used: usageStore[key],
        },
        { status: 402 }
      );
    }

    const systemPrompt = `You are ApplyFast AI. Given a CV and job description, extract and generate application answers.
Return ONLY valid JSON. Be truthful - if info is not in CV, write "N/A".
{
  "fullName": "string",
  "email": "string",
  "phone": "string",
  "location": "string",
  "linkedin": "string or ''",
  "currentTitle": "string",
  "yearsOfExperience": "number (integer)",
  "education": "string",
  "skills": ["skill1", "skill2"],
  "whyThisRole": "string (2-3 sentences)",
  "coverLetterSnippet": "string (3 sentences max)",
  "strengths": ["strength1", "strength2", "strength3"],
  "salaryExpectation": "string",
  "availableStartDate": "string",
  "workAuthorization": "string"
}`;

    const jobText =
      jobDescription ||
      `Job URL: ${jobLink}\n(Analyze based on common job requirements for this type of role)`;

    const content = await callAI(
      "deepseek-chat",
      [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `CV:\n${cv}\n\nJob Description:\n${jobText}`,
        },
      ],
      { type: "json_object" }
    );

    if (!content) {
      return NextResponse.json(
        { error: "AI generation failed" },
        { status: 500 }
      );
    }

    const result = JSON.parse(content);

    return NextResponse.json({
      success: true,
      data: result,
      remaining: Math.max(0, 3 - usageStore[key]),
      usage: usageStore[key],
    });
  } catch (error: any) {
    console.error("ApplyFast API error:", error.message);
    return NextResponse.json(
      { error: "Generation failed", detail: error.message },
      { status: 500 }
    );
  }
}
