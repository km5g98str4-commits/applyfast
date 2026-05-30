import { NextRequest, NextResponse } from "next/server";

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_URL = "https://api.deepseek.com/v1/chat/completions";
const MODEL = "deepseek-chat";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  if (!DEEPSEEK_API_KEY) {
    return NextResponse.json({ success: false, error: "API key not configured" }, { status: 500 });
  }

  try {
    const body = await req.json();
    const { cv, jobDescription, toneMode = "professional" } = body;

    if (!cv || !jobDescription) {
      return NextResponse.json({ success: false, error: "CV and job description are required" }, { status: 400 });
    }

    const systemPrompt = `You are ApplyFast AI — a job application assistant producing SPECIFIC output with real company/role names. Never use placeholders. Reference actual CV details.

Return ONLY valid JSON. No markdown, no code blocks.

{
  "fullName": "from CV",
  "email": "from CV",
  "phone": "from CV",
  "location": "from CV",
  "currentTitle": "string",
  "yearsOfExperience": integer,
  "education": "string",
  "skills": ["strings", "max 10"],
  "whyThisRole": "2-3 punchy personalized sentences using the ACTUAL company name and role title. Reference specific CV experience that matches this role.",
  "coverLetterSnippet": "4-5 sentences. Starts with 'Dear [company] hiring team,'. Mentions 2 specific CV achievements mapped to the role.",
  "strengths": ["3-5 strengths for this exact role"],
  "companyName": "from job description",
  "roleTitle": "from job description",
  "atsAnalysis": {
    "matchScore": "0-100 number based on keyword + experience overlap",
    "matchedKeywords": ["matched keywords from CV found in JD"],
    "missingKeywords": [{"keyword": "string", "reframeSuggestion": "honest bridge using existing CV experience"}]
  },
  "jobAnalysis": {
    "salaryRange": "estimated range with numbers",
    "companySize": "estimated size/stage",
    "techStack": ["deduced from JD"],
    "workMode": "remote|hybrid|onsite"
  },
  "companyDeepDive": "3-5 bullet points about the company using • separator. Real info: what they do, funding, culture.",
  "sniperBullets": ["exactly 3. Format: '[CV proof] → [role requirement] → [impact]'. Under 150 chars each."],
  "quantifiedAchievements": ["3-5 CV bullets rewritten with specific numbers. Estimate realistic metrics if CV is vague."],
  "experienceMapping": [
    {"cvExperience": "one CV bullet", "jobRequirement": "matching JD requirement", "connection": "one sentence why it matters"}
  ],
  "skillGaps": [
    {"skill": "missing skill", "criticality": "high|medium|low", "learningPath": "specific course/platform suggestion"}
  ],
  "interviewPrep": [
    {"question": "role-specific question based on JD", "hint": "what to mention using real CV details"}
  ],
  "customQuestions": [
    {"question": "behavioral/technical question", "answer": "auto-generated using real CV context"}
  ],
  "starStories": [
    {"title": "short name", "situation": "context", "task": "what needed doing", "action": "specific actions", "result": "quantified outcome"}
  ],
  "followUpEmail": {
    "subject": "follow-up subject line with company name",
    "body": "full email. Professional, references company and candidate's specific value."
  },
  "whyThisRoleAr": "Arabic translation of whyThisRole",
  "coverLetterSnippetAr": "Arabic translation of coverLetterSnippet",
  "strengthsAr": ["Arabic strengths"]
}

CRITICAL RULES:
1. Use ACTUAL company and role names. NEVER "this company" or "the role".
2. Reference SPECIFIC CV details — real projects, companies, metrics.
3. Quantify everything. Estimate reasonable numbers if CV is vague.
4. Be honest. Don't fabricate skills. Bridge gaps creatively.
5. companyDeepDive: 3-5 bullets with • separator. Real info.
6. sniperBullets: EXACTLY 3 items, under 150 chars each.
7. interviewPrep: EXACTLY 5 questions.
8. customQuestions: EXACTLY 4 questions with answers.
9. starStories: EXACTLY 3 stories.
10. experienceMapping: at least 5 entries if CV has 5+ bullets.
11. Output language: ${toneMode} tone.`;

    const response = await fetch(DEEPSEEK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `CV:\n${cv.slice(0, 2500)}\n\n---\n\nJob Description:\n${jobDescription.slice(0, 2000)}\n\nGenerate the JSON. Output ONLY the JSON object, no explanation.`,
          },
        ],
        temperature: 0.3,
        max_tokens: 3500,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      console.error("DeepSeek API error:", response.status, errorText);
      return NextResponse.json(
        { success: false, error: `AI service error (${response.status}). Please try again.` },
        { status: 502 }
      );
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content;

    if (!content) {
      console.error("Empty DeepSeek response:", JSON.stringify(result).slice(0, 500));
      return NextResponse.json({ success: false, error: "Empty AI response" }, { status: 500 });
    }

    let parsed: any;
    try {
      const cleaned = content.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse DeepSeek output:", content.slice(0, 500));
      return NextResponse.json({ success: false, error: "Invalid AI output format" }, { status: 500 });
    }

    const latency = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`Generate completed in ${latency}s`);

    return NextResponse.json({
      success: true,
      data: parsed,
      latency: `${latency}s`,
    });
  } catch (error: any) {
    console.error("Generate error:", error?.message || error);
    return NextResponse.json(
      { success: false, error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
