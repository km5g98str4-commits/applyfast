import { NextRequest, NextResponse } from "next/server";
import { getRedis } from "@/lib/redis";
import { getClientIP } from "@/lib/utils";

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_URL = "https://api.deepseek.com/v1/chat/completions";
const MODEL = "deepseek-chat";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const OPENAI_MODEL = "gpt-4o-mini";

export const runtime = "edge";

// Structured logging — never log secrets or full CV/JD content
function logEvent(event: string, meta?: Record<string, unknown>) {
  const entry = { event, ts: new Date().toISOString(), ...meta };
  // Filter out any key that looks like a secret
  const safe = Object.fromEntries(
    Object.entries(entry).filter(([k]) => !/key|secret|token|password/i.test(k))
  );
  console.log("[applyfast]", JSON.stringify(safe));
}


function getDailyKey(ip: string): string {
  const today = new Date().toISOString().slice(0, 10);
  return `daily:${ip}:${today}`;
}

function getCreditsKey(licenseKey: string): string {
  return `credits:${licenseKey}`;
}

async function checkCreditsDirect(
  licenseKey: string | undefined,
  ip: string
): Promise<{ allowed: boolean; error?: string; used?: number; remaining?: number; _consumeKey?: string; _consumeType?: "free" | "licensed" }> {
  const r = getRedis();
  if (!r) {
    logEvent("redis_not_configured", { endpoint: "generate" });
    return { allowed: false, remaining: 0, error: "Service unavailable. Redis is not configured." };
  }

  try {
    if (!licenseKey) {
      // Free tier: IP-based, max 3/day — just check, don't increment yet
      const dailyKey = getDailyKey(`ip:${ip}`);
      const used = await r.get<number>(dailyKey);

      if (used !== null && used >= 3) {
        return { allowed: false, remaining: 0, error: "Free daily limit reached (3/day)" };
      }

      return { allowed: true, remaining: Math.max(0, 3 - (used ?? 0)), used: used ?? 0, _consumeKey: dailyKey, _consumeType: "free" };
    }

    // Licensed user — just check balance, don't decrement yet
    const creditsKey = getCreditsKey(licenseKey);
    const balance = await r.get<number>(creditsKey);

    if (balance === null) {
      return { allowed: false, remaining: 0, error: "Invalid license key" };
    }
    if (balance <= 0) {
      return { allowed: false, remaining: 0, error: "No credits remaining" };
    }

    return { allowed: true, remaining: balance, _consumeKey: creditsKey, _consumeType: "licensed" };
  } catch (e: any) {
    const msg = e?.message || String(e);
    logEvent("redis_check_error", { error: msg.slice(0, 200) });
    return { allowed: false, remaining: 0, error: "Service temporarily unavailable. Please try again in a moment." };
  }
}

/** Consume a credit AFTER successful generation */
async function consumeCredit(consumeKey: string, consumeType: "free" | "licensed"): Promise<void> {
  const r = getRedis();
  if (!r) return;

  try {
    if (consumeType === "free") {
      const used = await r.get<number>(consumeKey);
      const next = (used ?? 0) + 1;
      const now = new Date();
      const endOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
      const ttl = Math.ceil((endOfDay.getTime() - now.getTime()) / 1000);
      await r.set(consumeKey, next, { ex: ttl });
    } else {
      await r.decr(consumeKey);
    }
  } catch (e: any) {
    logEvent("redis_consume_error", { error: (e?.message || String(e)).slice(0, 200) });
  }
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  const isDemoMode = !DEEPSEEK_API_KEY;

  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 });
    }
    const { cv, jobDescription, toneMode = "professional", licenseKey, freshGraduateMode = false } = body;

    if (!cv || !jobDescription) {
      return NextResponse.json({ success: false, error: "CV and job description are required" }, { status: 400 });
    }

    // Input length validation
    const CV_MAX = 5000;
    const JD_MAX = 3000;
    if (typeof cv === "string" && cv.length > CV_MAX) {
      return NextResponse.json(
        { success: false, error: `CV text is too long. Maximum is ${CV_MAX} characters.` },
        { status: 400 }
      );
    }
    if (typeof jobDescription === "string" && jobDescription.length > JD_MAX) {
      return NextResponse.json(
        { success: false, error: `Job description is too long. Maximum is ${JD_MAX} characters.` },
        { status: 400 }
      );
    }

    // Credit check — skip in demo mode, otherwise direct Redis, no internal HTTP call
    const ip = getClientIP(req);
    let creditCheck: Awaited<ReturnType<typeof checkCreditsDirect>>;
    
    if (isDemoMode) {
      creditCheck = { allowed: true, remaining: 999, _consumeKey: "demo", _consumeType: "free" };
    } else {
      creditCheck = await checkCreditsDirect(licenseKey, ip);
      if (!creditCheck.allowed) {
        return NextResponse.json(
          {
            success: false,
            error: creditCheck.error || "No credits remaining. Purchase more to continue.",
            noCredits: true,
            remaining: creditCheck.remaining ?? 0,
          },
          { status: 402 }
        );
      }
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
  "companyName": "Company name from job description. If no company name is found, use empty string '' — do NOT guess or invent.",
  "roleTitle": "from job description. If no role title is found, use empty string '' — do NOT guess or invent.",
  "atsAnalysis": {
    "matchScore": "0-100 number — see MATCH SCORE CALIBRATION rules below",
    "matchedKeywords": ["matched keywords from CV found in JD"],
    "missingKeywords": [{"keyword": "string", "reframeSuggestion": "honest bridge — see HONEST GAPS rule below"}],
    "saudiMarket": {
      "nitaqatCompatible": true/false,
      "saudization": "high|medium|low|none",
      "localCertifications": ["relevant Saudi/Gulf certifications: SCE, PMP, SCFHS, SASO, etc. — empty array if none apply"],
      "vision2030Alignment": "how this role aligns with Vision 2030 initiatives, or empty string if not applicable"
    }
  },
  "jobAnalysis": {
    "salaryRange": "estimated range with numbers",
    "companySize": "estimated size/stage",
    "techStack": ["deduced from JD"],
    "workMode": "remote|hybrid|onsite"
  },
  "companyDeepDive": "3-5 bullet points about the company using • separator. Real info: what they do, funding, culture.",
  "sniperBullets": ["exactly 3. Format: '[CV proof] → [role requirement] → [impact]'. Under 150 chars each."],
  "quantifiedAchievements": ["3-5 CV bullets rewritten with specific numbers FROM the CV. If CV has no numbers, use the bullet as-is with minor polish — never insert made-up metrics."],
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
  "whyThisRoleAr": "Arabic translation of whyThisRole — see ARABIC QUALITY rules below",
  "coverLetterSnippetAr": "Arabic translation of coverLetterSnippet — see ARABIC QUALITY rules below",
  "strengthsAr": ["Arabic strengths — see ARABIC QUALITY rules below"]
}

CRITICAL RULES:
1. Use ACTUAL company and role names from the JD. If company name is not found in JD, use "Hiring Team" or "your team" as greeting — NEVER invent a company name or write "your fintech company", "your SaaS company", "your company", or any fabricated descriptor.
2. ONLY use facts explicitly present in the pasted CV. If a field is missing from the CV (name, email, phone, experience, skills, etc.), output "unknown" or empty — NEVER invent, guess, or fabricate. No made-up numbers, certifications, employer names, or dates.
3. Quantify when possible using numbers FROM the CV.
4. Be honest. Don't fabricate skills. Bridge gaps creatively.
5. companyDeepDive: 3-5 bullets with • separator. Real info.
6. sniperBullets: EXACTLY 3 items, under 150 chars each.
7. interviewPrep: EXACTLY 5 questions.
8. customQuestions: EXACTLY 4 questions with answers.
9. starStories: EXACTLY 3 stories.
10. experienceMapping: at least 5 entries if CV has 5+ bullets.
11. Output language: ${toneMode} tone.

--- MATCH SCORE CALIBRATION ---
Use these explicit match score ranges. Do NOT inflate scores:
• 0-15: Completely different field, no relevant skills. Example: a mechanical engineer applying for senior software engineer MUST score 15 or below.
• 16-35: Some transferable soft skills but fundamentally different domain.
• 36-55: Adjacent field, some relevant experience but major gaps.
• 56-75: Good match, most requirements met with relevant experience.
• 76-90: Strong match, requirements met plus relevant domain expertise.
• 91-100: Near-perfect match, domain expert who exceeds requirements.

--- HONEST GAPS ---
For missingKeywords.reframeSuggestion: when a gap is genuinely unfillable (e.g., CS degree for a mechanical engineer applying to SWE), do NOT pretend existing experience covers it. Instead, honestly acknowledge the gap and suggest bridge steps:
• Suggest SDAIA-accredited programs (Tuwaiq Academy, SDAIA bootcamps)
• Recommend Saudi/GCC-specific certifications or training
• Propose transitional roles or upskilling paths
Do not fabricate connections that don't exist.

--- SAUDI ATS KEYWORDS ---
When the JD mentions a company in Saudi Arabia or the Gulf region, analyze for:
• Nitaqat/Saudization compatibility — is this role likely to require Saudi national status?
• Iqama/nationality status keywords — does the JD imply sponsorship or transferable Iqama requirements?
• Vision 2030 alignment — how does this role fit into national transformation initiatives?
• Local certifications: SCE (engineers), SCFHS (healthcare), PMP (project management), SASO (standards), SOCPA (accounting), CMA (capital market), SAMA (banking), CST/NCA (cybersecurity).
Always populate the saudiMarket object in atsAnalysis when relevant. If the role is not in Saudi/Gulf, set saudiMarket to an empty object {}.

--- ARABIC QUALITY ---
All Arabic fields (whyThisRoleAr, coverLetterSnippetAr, strengthsAr) MUST use professional Gulf Arabic — NOT literal/Google Translate Arabic:
• Use natural phrasing a Saudi professional would actually write.
• Apply proper diacritics (تشكيل) where needed for formal terms (e.g., رؤية, مبادرة, استراتيجية).
• whyThisRoleAr: write as if a Saudi professional is speaking — warm but professional tone, not stiff literal translation.
• Avoid robotic sentence structures. Write naturally flowing Arabic that reads like a human wrote it, not machine translation.

--- FRESH GRADUATE MODE (${freshGraduateMode ? 'ACTIVE' : 'INACTIVE'}) ---
${freshGraduateMode ? `When fresh graduate mode is ACTIVE:
1. Adjust MATCH SCORE CALIBRATION: a fresh graduate can score up to 70 even with minimal direct experience IF their education, internships, and projects align well. Never penalize for lack of years — evaluate potential.
2. For skillGaps: recommend beginner-friendly Saudi training programs (Tuwaiq Academy bootcamps, SDAIA nanodegrees, Misk Foundation programs, Tamheer internships). Never flag "no experience" as a critical gap — it's expected. Frame gaps as "growth areas" not deficiencies.
3. sniperBullets: use academic projects, capstones, internships, and coursework as proof instead of prior jobs. Format: '[Academic proof] → [role requirement] → [learning impact]'.
4. experienceMapping: map academic projects and internships to job requirements. If fewer than 5, that's acceptable — don't fabricate.
5. coverLetterSnippet: emphasize eagerness to learn, academic excellence, and alignment with Saudi Vision 2030 youth development goals. Mention Tamheer/HRDF eligibility if relevant.
6. strengths: focus on soft skills (adaptability, quick learner, bilingual, teamwork) and academic achievements (GPA if mentioned, relevant coursework, projects).
7. whyThisRole: frame around growth potential and contribution to Saudi talent development, not proven track record.
8. All Arabic fields: use warm, ambitious Gulf Arabic tone suitable for a young Saudi professional entering the workforce.
9. For jobAnalysis.salaryRange: use entry-level / fresh graduate ranges appropriate for the Saudi market.
10. DO NOT fabricate years of experience. If CV has none, output 0 for yearsOfExperience.` : `Fresh graduate mode is OFF. Apply standard professional evaluation rules.`}

--- REQUIRED FORMAT ---
The output MUST be a single valid JSON object. No markdown, no code blocks, no extra text.

The response will be parsed with JSON.parse().

Final reminder: output VALID JSON only.`;

    const userPrompt = `CV:\n${cv.slice(0, 5000)}\n\n---\n\nJob Description:\n${jobDescription.slice(0, 3000)}\n\nGenerate the JSON. Output ONLY the JSON object, no explanation.`;

    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ];

    // Helper: call an LLM API and return the content
    const callLLM = async (url: string, apiKey: string, model: string): Promise<{ content: string }> => {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.3,
          max_tokens: 3500,
          stream: false,
        }),
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        throw new Error(`LLM returned ${res.status}: ${errText.slice(0, 200)}`);
      }

      const result = await res.json();
      const content = result.choices?.[0]?.message?.content;
      if (!content) throw new Error("Empty response from LLM");
      return { content };
    };

    // Helper: call LLM with retry (2 attempts, exponential backoff)
    const callLLMWithRetry = async (
      url: string,
      apiKey: string,
      model: string,
      attempt = 1
    ): Promise<{ content: string }> => {
      const maxRetries = 2;
      try {
        return await callLLM(url, apiKey, model);
      } catch (err: any) {
        const msg = err?.message || String(err);
        const isRetryable =
          msg.includes("timeout") ||
          msg.includes("aborted") ||
          msg.includes("AbortError") ||
          /\b5\d{2}\b/.test(msg) ||
          /\b429\b/.test(msg);

        if (isRetryable && attempt < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 4000);
          logEvent("llm_retry", { attempt: String(attempt), maxRetries: String(maxRetries), delay: String(delay), error: msg.slice(0, 100) });
          await new Promise((resolve) => setTimeout(resolve, delay));
          return callLLMWithRetry(url, apiKey, model, attempt + 1);
        }
        throw err;
      }
    };

    let content: string;
    
    if (isDemoMode) {
      // 🧪 DEMO MODE — return realistic mock data
      content = generateDemoResponse(cv, jobDescription, toneMode, freshGraduateMode);
    } else {
      try {
        // Primary: DeepSeek with retry
        const res = await callLLMWithRetry(DEEPSEEK_URL, DEEPSEEK_API_KEY!, MODEL);
        content = res.content;
      } catch (deepseekErr: any) {
        const msg = deepseekErr?.message || String(deepseekErr);
        const isRetryable =
          msg.includes("timeout") ||
          msg.includes("aborted") ||
          msg.includes("AbortError") ||
          /\b5\d{2}\b/.test(msg);

        if (isRetryable && OPENAI_API_KEY) {
          logEvent("deepseek_exhausted_fallback", { error: msg.slice(0, 200) });
          try {
            const fb = await callLLMWithRetry(OPENAI_URL, OPENAI_API_KEY, OPENAI_MODEL);
            content = fb.content;
          } catch (openaiErr: any) {
            logEvent("openai_fallback_failed", { error: (openaiErr?.message || String(openaiErr)).slice(0, 200) });
            return NextResponse.json(
              { success: false, error: "AI service temporarily unavailable. Please try again later." },
              { status: 502 }
            );
          }
        } else {
          logEvent("deepseek_error", { error: msg.slice(0, 300) });
          return NextResponse.json(
            { success: false, error: "AI service error. Please try again." },
            { status: 502 }
          );
        }
      }
    }

    let parsed: any;
    try {
      const cleaned = content.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      logEvent("parse_error", { content_preview: content.slice(0, 200) });
      return NextResponse.json({ success: false, error: "Invalid AI output format" }, { status: 500 });
    }

    // Only consume credit AFTER successful generation
    if (creditCheck._consumeKey && creditCheck._consumeType) {
      await consumeCredit(creditCheck._consumeKey, creditCheck._consumeType);
    }

    // Post-generation validation: add confidence flags based on CV evidence
    const validated = addConfidenceFlags(parsed, cv, jobDescription);

    const latency = ((Date.now() - startTime) / 1000).toFixed(1);
    logEvent("generate_ok", { latency });

    return NextResponse.json({
      success: true,
      data: validated,
      latency: `${latency}s`,
      remaining: creditCheck.remaining,
    });
  } catch (error: any) {
    logEvent("generate_internal_error", { error: (error?.message || String(error)).slice(0, 300) });
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * 🧪 DEMO MODE — generates realistic mock data when no API key is configured.
 * Allows the full UI flow to work without any external services.
 */
function generateDemoResponse(cv: string, jd: string, toneMode: string, freshGraduateMode: boolean): string {
  const cvFirstLine = cv.split("\n")[0]?.trim() || "Professional";
  const hasArabic = /[\u0621-\u064a]/.test(cv) || /[\u0621-\u064a]/.test(jd);

  return JSON.stringify({
    fullName: cvFirstLine.length > 50 ? "محمد عبدالله" : cvFirstLine,
    email: "candidate@example.com",
    phone: "+966 5X XXX XXXX",
    location: "الرياض، المملكة العربية السعودية",
    currentTitle: "مهندس برمجيات",
    yearsOfExperience: freshGraduateMode ? 0 : 4,
    education: "بكالوريوس علوم حاسب — جامعة الملك سعود",
    skills: ["React", "Node.js", "TypeScript", "Python", "Docker", "AWS"],
    whyThisRole: "With 4 years of full-stack development experience building SaaS platforms, I bring proven ability to deliver scalable solutions. My recent work migrating legacy systems to cloud-native architecture directly aligns with your digital transformation goals, and I am excited to contribute to innovative projects in this role.",
    coverLetterSnippet: "Dear hiring team,\n\nI am writing to express my strong interest in this position. With 4 years of hands-on software engineering experience, I have successfully delivered production systems serving thousands of users. I am particularly drawn to your company's focus on innovation and would welcome the opportunity to contribute.",
    strengths: ["Full-stack development", "System architecture", "Team leadership", "Agile delivery", "Bilingual (Arabic/English)"],
    companyName: "",
    roleTitle: "",
    atsAnalysis: {
      matchScore: freshGraduateMode ? 62 : 74,
      matchedKeywords: ["JavaScript", "API", "Cloud", "Agile", "Git"],
      missingKeywords: [
        { keyword: "Kubernetes", reframeSuggestion: "Docker experience provides strong containerization foundation — consider SDAIA Kubernetes bootcamp at Tuwaiq Academy" },
        { keyword: "CI/CD pipelines", reframeSuggestion: "Exposure through Agile delivery — recommend GitHub Actions certification path" }
      ],
      saudiMarket: {
        nitaqatCompatible: true,
        saudization: "high",
        localCertifications: ["SCE membership recommended"],
        vision2030Alignment: "Directly supports the digital transformation pillar through building scalable cloud-native Saudi platforms"
      }
    },
    jobAnalysis: {
      salaryRange: "SAR 18,000 - 25,000/month",
      companySize: "Mid-size (50-200 employees)",
      techStack: ["React", "Node.js", "PostgreSQL", "AWS", "Docker"],
      workMode: "hybrid"
    },
    companyDeepDive: "• Leading Saudi tech company focused on B2B SaaS solutions\n• Backed by STV and Raed Ventures\n• Growing team of 80+ engineers\n• Strong Vision 2030 alignment in digital government",
    sniperBullets: [
      "4 years React/Node.js production → Full-stack role → Faster feature delivery from day one",
      "Led 3-person team shipping SaaS → Team ownership → Ready for technical leadership growth",
      "Bilingual Arabic/English → Saudi client communication → Seamless stakeholder engagement"
    ],
    quantifiedAchievements: [
      "Built and deployed 3 production SaaS applications serving 5,000+ users",
      "Reduced page load time by 60% through React optimization and code splitting",
      "Led migration of legacy monolith to microservices architecture"
    ],
    experienceMapping: [
      { cvExperience: "Senior Full-Stack Developer at TechCo (2021-Present)", jobRequirement: "Full-stack engineering experience", connection: "Direct match — 3+ years of relevant full-stack delivery experience" },
      { cvExperience: "Built RESTful APIs serving 50K+ daily requests", jobRequirement: "API design and development", connection: "Proven experience building high-traffic APIs at scale" },
      { cvExperience: "Led migration from monolith to microservices", jobRequirement: "System architecture", connection: "Hands-on architecture transformation experience directly applicable" }
    ],
    skillGaps: [
      { skill: "Kubernetes", criticality: "medium", learningPath: "SDAIA-accredited Tuwaiq Academy Cloud Native bootcamp (3 months)" },
      { skill: "GraphQL", criticality: "low", learningPath: "Frontend Masters GraphQL course + personal project" }
    ],
    interviewPrep: [
      { question: "Tell us about a time you led a technical migration.", hint: "Reference the monolith-to-microservices project — highlight planning, team coordination, and measurable outcomes" },
      { question: "How do you approach working with Arabic-speaking stakeholders?", hint: "Mention bilingual capability and experience communicating technical concepts in Arabic" },
      { question: "What excites you about Vision 2030 and this role?", hint: "Connect digital transformation experience with Saudi national goals — mention specific tech initiatives" },
      { question: "How do you handle production incidents?", hint: "Describe your debugging approach, monitoring setup, and post-mortem process" },
      { question: "Where do you see yourself in 3 years?", hint: "Growth into technical leadership — mentoring juniors, system architecture decisions, contributing to Saudi tech ecosystem" }
    ],
    customQuestions: [
      { question: "Describe your experience with cloud-native architecture.", answer: "I led a migration from traditional VPS hosting to AWS ECS with auto-scaling, reducing infrastructure costs by 40% while improving reliability to 99.9% uptime." },
      { question: "How do you ensure code quality in a fast-paced environment?", answer: "I implement automated testing (Jest + Cypress), enforce code review standards, and use TypeScript for type safety — catching bugs at compile time rather than production." },
      { question: "What is your approach to mentoring junior developers?", answer: "I pair-program weekly, conduct structured code reviews with educational feedback, and created onboarding documentation that reduced ramp-up time from 6 weeks to 3." },
      { question: "How do you stay updated with technology trends?", answer: "I follow Saudi tech communities on Twitter, contribute to open source, and regularly attend Riyadh tech meetups. I also complete 1-2 certifications annually." }
    ],
    starStories: [
      { title: "SaaS Platform Launch", situation: "Company needed a new customer-facing dashboard for 200+ enterprise clients", task: "Design and deliver the full frontend within 8 weeks", action: "Led 2 developers, chose React + TypeScript stack, implemented design system, conducted weekly demos with stakeholders", result: "Delivered on time with zero production bugs. Client satisfaction scores improved 35%" },
      { title: "Performance Crisis", situation: "Legacy API was taking 8+ seconds to respond during peak traffic", task: "Diagnose and fix performance bottleneck within 48 hours", action: "Profiled database queries, identified N+1 issues, added Redis caching layer, optimized SQL indexes", result: "Response time dropped from 8s to 400ms. System handled 3x traffic without additional infrastructure" },
      { title: "Team Onboarding Revamp", situation: "New hires took 6 weeks to become productive — team was growing fast", task: "Create comprehensive onboarding system to cut ramp-up time in half", action: "Built internal wiki, recorded architecture walkthroughs, set up standardized dev environment with Docker, implemented buddy system", result: "Ramp-up reduced to 3 weeks. New hire satisfaction improved from 6/10 to 9/10" }
    ],
    followUpEmail: {
      subject: "Following Up — Full-Stack Developer Application",
      body: "Dear Hiring Team,\n\nI wanted to follow up on my application and reiterate my enthusiasm for this opportunity. With 4 years of full-stack development experience and a track record of delivering production systems, I am confident I can contribute meaningfully from day one.\n\nI am particularly excited about your company's role in Saudi digital transformation and would welcome the chance to discuss how my experience aligns with your goals.\n\nBest regards"
    },
    whyThisRoleAr: "بخبرة ٤ سنوات في تطوير تطبيقات الويب الشاملة، أقدم قدرة مثبتة على بناء حلول تقنية قابلة للتوسع. مشروعي الأخير في نقل الأنظمة التقليدية إلى السحابة يتماشى مباشرة مع أهداف التحول الرقمي لديكم، وأنا متحمس للمساهمة في هذا المجال المبتكر.",
    coverLetterSnippetAr: "السادة فريق التوظيف،\n\nأكتب إليكم معربًا عن اهتمامي الشديد بهذه الفرصة. بخبرة ٤ سنوات في تطوير البرمجيات، قمت بتسليم أنظمة إنتاجية تخدم آلاف المستخدمين. أنا معجب بتركيز شركتكم على الابتكار وأرحب بفرصة مناقشة كيفية مساهمتي في فريقكم.",
    strengthsAr: ["تطوير الواجهات والخوادم", "تصميم الأنظمة", "قيادة الفريق", "التسليم السريع", "ثنائي اللغة (عربي/إنجليزي)"]
  });
}

/**
 * Add confidence flags to AI-generated content based on CV/JD evidence.
 * This helps users identify what the AI invented vs. what's actually in their CV.
 */
function addConfidenceFlags(data: any, cv: string, jd: string): any {
  const cvLower = (cv || "").toLowerCase();
  const jdLower = (jd || "").toLowerCase();

  // Split CV into tokens for matching
  const cvWords = new Set(cvLower.split(/[^a-z0-9\u0621-\u064a]+/).filter(Boolean));

  function evidenceInCV(...terms: string[]): boolean {
    return terms.some((t) => cvLower.includes(t.toLowerCase()));
  }

  function evidenceInEither(...terms: string[]): boolean {
    return terms.some(
      (t) => cvLower.includes(t.toLowerCase()) || jdLower.includes(t.toLowerCase())
    );
  }

  // Check education claims against CV
  const eduConfidence = Array.isArray(data.education) ? data.education.map((entry: any) => {
    const degree = (entry.degree || "").toLowerCase();
    const school = (entry.school || "").toLowerCase();
    const hasEvidence = evidenceInCV(degree, school, entry.school, entry.degree);
    return {
      ...entry,
      _confidence: hasEvidence ? "high" : "low",
      _fabricated: !hasEvidence,
    };
  }) : [];

  // Check certifications
  const certConfidence = Array.isArray(data.certifications) ? data.certifications.map((c: any) => {
    const name = (typeof c === "string" ? c : c.name || "").toLowerCase();
    const hasEvidence = evidenceInCV(name);
    return typeof c === "string"
      ? { name: c, _confidence: hasEvidence ? "high" : "low", _fabricated: !hasEvidence }
      : { ...c, _confidence: hasEvidence ? "high" : "low", _fabricated: !hasEvidence };
  }) : [];

  // Check name
  const nameConfidence = (() => {
    if (!data.name || data.name === "unknown" || data.name === "[Name]") return "low";
    // Names are hard to verify, but flag obviously fabricated ones
    if (data.name.length < 2 || /^(dear|hello|to whom)/i.test(data.name)) return "low";
    // Check if the name appears somewhere in the CV
    return evidenceInCV(data.name) ? "high" : "medium";
  })();

  // Check email
  const emailConfidence = (() => {
    if (!data.email || data.email === "unknown" || data.email === "[Email]") return "low";
    return evidenceInCV(data.email) ? "high" : "medium";
  })();

  // Check company deep dive facts
  const deepDiveConfidence = (() => {
    const text = Array.isArray(data.companyDeepDive)
      ? data.companyDeepDive.join(" ")
      : data.companyDeepDive || "";
    // These should come from the JD, so check against JD
    const jdWords = text.split(/[^a-z0-9]+/).filter((w: string) => w.length > 3);
    const matchCount = jdWords.filter((w: string) => jdLower.includes(w.toLowerCase())).length;
    if (matchCount === 0) return "low";
    if (matchCount / jdWords.length > 0.3) return "high";
    return "medium";
  })();

  // Check match score sanity
  const matchScoreSanity = (() => {
    const score = data.matchScore;
    if (typeof score !== "number") return "unverified";
    if (score < 0 || score > 100) return "invalid_range";
    return "ok";
  })();

  // Check salary field
  const salaryConfidence = (() => {
    if (!data.salary || data.salary === "N/A" || data.salary === "Not provided") return "none";
    // Salary should come from JD, not invented
    return jdLower.includes("salary") || jdLower.includes("SAR") || jdLower.includes("$")
      ? "medium"
      : "low";
  })();

  return {
    ...data,
    education: eduConfidence,
    certifications: certConfidence,
    _meta: {
      confidence: {
        name: nameConfidence,
        email: emailConfidence,
        companyDeepDive: deepDiveConfidence,
        salary: salaryConfidence,
        matchScoreSanity,
      },
      note:
        "_confidence: 'high' = found in your CV/JD, 'medium' = partially verified, 'low' = AI generated — verify before using",
      fabricatedFields: [
        ...(nameConfidence === "low" ? ["name"] : []),
        ...(emailConfidence === "low" ? ["email"] : []),
        ...(deepDiveConfidence === "low" ? ["companyDeepDive"] : []),
      ],
    },
  };
}
