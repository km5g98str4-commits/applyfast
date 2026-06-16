import { NextRequest, NextResponse } from "next/server";
import { getSectorTemplate, SECTOR_SLUG_MAP, type SectorTemplate } from "@/lib/sectorTemplates";
import { getRedis, getDailyKey } from "@/lib/redis";
import { getClientIP } from "@/lib/utils";

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_URL = "https://api.deepseek.com/v1/chat/completions";
const MODEL = "deepseek-chat";
const DAILY_LIMIT = 5;

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


/**
 * POST /api/ats-check
 *
 * Analyzes CV text against Saudi/Gulf ATS norms for a given sector.
 * Returns compatibility score, missing keywords, formatting issues,
 * and sector-specific recommendations in both Arabic and English.
 */
export async function POST(req: NextRequest) {
  const startTime = Date.now();

  const isDemoMode = !DEEPSEEK_API_KEY;

  try {
    // IP-based rate limiting (5/day) — check only, don't increment yet
    const ip = getClientIP(req);
    const dailyKey = getDailyKey(`ats:${ip}`);
    const r = getRedis();
    let rateLimitConsumed = false;

    if (!isDemoMode && r) {
      try {
        const used = await r.get<number>(dailyKey);
        if (used !== null && used >= DAILY_LIMIT) {
          return NextResponse.json(
            { success: false, error: "Daily limit reached (5/day). Try again tomorrow." },
            { status: 429 }
          );
        }
      } catch (redisErr: any) {
        // Redis error is non-fatal — log and continue without rate limiting
        logEvent("redis_rate_limit_warn", { endpoint: "ats-check", error: (redisErr?.message || String(redisErr)).slice(0, 200) });
      }
    }

    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 });
    }
    const { cv, sector } = body as { cv?: string; sector?: string };

    if (!cv || typeof cv !== "string") {
      return NextResponse.json(
        { success: false, error: "CV text is required" },
        { status: 400 }
      );
    }

    // Resolve sector template
    let sectorTemplate: SectorTemplate | null = null;
    if (sector) {
      const resolvedId = SECTOR_SLUG_MAP[sector] || sector;
      sectorTemplate = getSectorTemplate(resolvedId);
    }

    const sectorContext = sectorTemplate
      ? `
The target sector is **${sectorTemplate.nameEn} (${sectorTemplate.nameAr})**.
Relevant ATS keywords for this sector:
- English: ${sectorTemplate.keywordsEn.join(", ")}
- Arabic: ${sectorTemplate.keywordsAr.join(", ")}
Common certifications: ${sectorTemplate.commonCertifications.join(", ")}
Common tools: ${sectorTemplate.commonTools.join(", ")}
Industry phrases: ${sectorTemplate.industryPhrases.join(", ")}
`
      : "";

    const systemPrompt = `You are an ATS (Applicant Tracking System) compatibility expert specializing in Saudi Arabia and Gulf region job markets.

You analyze CVs against LOCAL ATS platforms prevalent in the region:
- Bayt.com — the largest Middle East job platform, Arabic-aware parsing
- Mihnati — Saudi-specific job portal with Arabic-first parsing
- Naukri Gulf — Gulf-focused with multi-language support
- Nitaqat/Saudization classification systems
- Company-specific portals (Aramco, SABIC, STC, SAMA, etc.)

Region-specific ATS quirks you must check:
1. Arabic-English bilingual parsing — many Gulf ATS expect both languages
2. Nationality/Iqama status fields — often required in Gulf applications
3. Phone number format: +966 for Saudi, +971 for UAE, etc.
4. Photo inclusion — common in Gulf CVs (unlike Western norms)
5. Date formats: Hijri vs Gregorian calendar awareness
6. Saudi-specific fields: nationality, marital status, driving license
7. Professional registration numbers: SCE (engineers), SCFHS (healthcare), SOCPA (accounting)
8. Wasta/referral indicators — some ATS track employee referrals

Return ONLY valid JSON. No markdown, no code blocks.

{
  "compatibilityScore": <0-100>,
  "missingKeywords": [
    { "keywordAr": "الكلمة العربية", "keywordEn": "english keyword", "importance": "high|medium|low", "suggestion": "how to integrate" }
  ],
  "formattingIssues": [
    { "issue": "description in English", "severity": "high|medium|low", "fix": "how to fix" }
  ],
  "sectorSpecificRecommendations": [
    { "ar": "توصية بالعربية", "en": "recommendation in English" }
  ]
}

COMPATIBILITY SCORE CALIBRATION:
• 0-30: Major gaps — missing critical Gulf formatting (nationality, Iqama status, no Arabic), missing >70% sector keywords
• 31-55: Below average — some formatting issues, missing 40-70% keywords, no local certifications
• 56-75: Average — basic formatting OK, missing 20-40% keywords, some certifications present
• 76-90: Good — proper Gulf formatting, most keywords present, relevant certifications
• 91-100: Excellent — GCC-optimized CV, bilingual, all formats correct, all key certifications

FORMATTING CHECKS:
• Phone number with country code (+966, +971, etc.)
• Nationality field present
• Professional registration numbers (SCE, SCFHS, SOCPA)
• Photo (common in Gulf, not required but noted)
• Arabic name transcription consistent
• Date format clarity (Gregorian preferred alongside Hijri if used)
• Email address professional (Gmail/Yahoo preferred over niche providers)
• LinkedIn profile link (increasingly checked by Gulf recruiters)

KEYWORD ANALYSIS:
• Check Arabic equivalents of every English keyword
• Many Gulf ATS search in BOTH languages independently
• Sector-specific certifications are weighted heavily
• Vision 2030 terminology is a bonus signal

Return at least 5 missingKeywords, 3 formattingIssues, and 4 sectorSpecificRecommendations.
If the CV already covers everything well, acknowledge that in the recommendations.
All Arabic text must be professional Gulf Arabic — not Google Translate.`;

    const userPrompt = `CV Text:\n${cv.slice(0, 3000)}\n\n${sectorContext}\n\nAnalyze this CV for Gulf ATS compatibility. Return ONLY the JSON object, no explanation.`;

    let parsed: any;

    if (isDemoMode) {
      // 🧪 DEMO MODE
      await new Promise((r) => setTimeout(r, 400));
      parsed = {
        compatibilityScore: 68,
        missingKeywords: [
          { keywordAr: "إدارة المشاريع", keywordEn: "Project Management", importance: "high", suggestion: "Add PMP or PRINCE2 certification if applicable. Mention any project leadership experience." },
          { keywordAr: "نظام التأمينات الاجتماعية", keywordEn: "GOSI/Social Insurance", importance: "medium", suggestion: "Gulf employers check GOSI registration. If you have prior Saudi employment, list your GOSI number." },
          { keywordAr: "اللغة العربية للأعمال", keywordEn: "Business Arabic", importance: "high", suggestion: "Add a dedicated 'Arabic Proficiency' section — specify whether you can write formal Arabic reports and emails." },
          { keywordAr: "الهيئة السعودية للمهندسين", keywordEn: "SCE Registration", importance: "medium", suggestion: "For engineering roles in Saudi, SCE professional registration is often mandatory. Add your membership number." },
          { keywordAr: "رؤية 2030", keywordEn: "Vision 2030", importance: "medium", suggestion: "Gulf employers value Vision 2030 awareness. Mention relevant initiatives or projects aligned with national transformation goals." },
        ],
        formattingIssues: [
          { issue: "Phone number missing country code +966", severity: "high", fix: "Gulf ATS expect international format: +966 5X XXX XXXX. Without country code, Bayt.com and Mihnati may classify the application as non-local." },
          { issue: "No Arabic CV version detected", severity: "high", fix: "Many Gulf ATS (especially Mihnati) parse Arabic CVs separately. Add a bilingual section or maintain separate Arabic/English CV versions." },
          { issue: "Nationality/Iqama status not clearly stated", severity: "high", fix: "Gulf employers need to know: Saudi national, resident with transferable Iqama, or requires sponsorship. Add a clear personal information section." },
          { issue: "Missing professional registration numbers", severity: "medium", fix: "If applicable, include SCE, SCFHS, SOCPA, or other Saudi professional body registration numbers." },
        ],
        sectorSpecificRecommendations: [
          { ar: "أضف قسم 'الجنسية والإقامة' في بداية السيرة الذاتية — هذه معلومة أساسية في سوق العمل الخليجي", en: "Add 'Nationality & Residency' section at the top of your CV — this is essential information in the Gulf job market" },
          { ar: "جهّز نسخة عربية من سيرتك الذاتية — منصات مثل مهنتي وبيت تتطلب ذلك", en: "Prepare an Arabic version of your CV — platforms like Mihnati and Bayt require this" },
          { ar: "أضف أرقام التسجيل المهني (الهيئة السعودية للمهندسين، التخصصات الصحية) إن وجدت", en: "Add professional registration numbers (SCE, SCFHS, etc.) if applicable" },
          { ar: "اذكر وعيك بمبادرات رؤية 2030 ذات الصلة بمجالك", en: "Demonstrate awareness of Vision 2030 initiatives relevant to your field" },
        ],
      };
    } else {
      // Live mode: try DeepSeek, fallback to OpenAI
      const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
      const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
      const OPENAI_MODEL = "gpt-4o-mini";

      const callLLM = async (url: string, apiKey: string, model: string): Promise<string> => {
        const res = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            temperature: 0.1,
            max_tokens: 2000,
            stream: false,
          }),
        });

        if (!res.ok) {
          const errText = await res.text().catch(() => "");
          throw new Error(`LLM returned ${res.status}: ${errText.slice(0, 200)}`);
        }

        const result = await res.json();
        const c = result.choices?.[0]?.message?.content;
        if (!c) throw new Error("Empty response from LLM");
        return c;
      };

      let rawContent: string;
      let provider = "deepseek";

      try {
        rawContent = await callLLM(DEEPSEEK_URL, DEEPSEEK_API_KEY!, MODEL);
        logEvent("ats_check_ok", { provider, latency: ((Date.now() - startTime) / 1000).toFixed(1) });
      } catch (deepseekErr: any) {
        const msg = deepseekErr?.message || String(deepseekErr);
        logEvent("ats_check_provider_error", { provider: "deepseek", error: msg.slice(0, 200) });

        if (OPENAI_API_KEY) {
          try {
            rawContent = await callLLM(OPENAI_URL, OPENAI_API_KEY, OPENAI_MODEL);
            provider = "openai";
            logEvent("ats_check_fallback_ok", { provider: "openai" });
          } catch (openaiErr: any) {
            logEvent("ats_check_all_providers_failed", {
              deepseek_error: msg.slice(0, 150),
              openai_error: (openaiErr?.message || String(openaiErr)).slice(0, 150),
            });
            return NextResponse.json(
              { success: false, error: "AI service temporarily unavailable. Please try again later." },
              { status: 502 }
            );
          }
        } else {
          return NextResponse.json(
            { success: false, error: "AI service error. Please try again." },
            { status: 502 }
          );
        }
      }

      try {
        const cleaned = rawContent
          .replace(/```json\s*/gi, "")
          .replace(/```\s*/g, "")
          .trim();
        parsed = JSON.parse(cleaned);
      } catch {
        logEvent("ats_check_parse_error", { content_preview: rawContent.slice(0, 200) });
        return NextResponse.json(
          { success: false, error: "Invalid AI output format" },
          { status: 500 }
        );
      }
    }

    // Only increment usage counter AFTER successful generation (skip in demo mode)
    if (!isDemoMode && r) {
      try {
        const used = await r.get<number>(dailyKey);
        const next = (used ?? 0) + 1;
        const now = new Date();
        const endOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
        const ttl = Math.ceil((endOfDay.getTime() - now.getTime()) / 1000);
        await r.set(dailyKey, next, { ex: ttl });
        rateLimitConsumed = true;
      } catch (redisErr: any) {
        // Non-fatal — credit was already delivered, just couldn't count it
        logEvent("redis_consume_warn", { endpoint: "ats-check", error: (redisErr?.message || String(redisErr)).slice(0, 200) });
      }
    }

    const latency = ((Date.now() - startTime) / 1000).toFixed(1);

    return NextResponse.json({
      success: true,
      data: {
        compatibilityScore: parsed.compatibilityScore,
        missingKeywords: parsed.missingKeywords || [],
        formattingIssues: parsed.formattingIssues || [],
        sectorSpecificRecommendations: parsed.sectorSpecificRecommendations || [],
        sector: sectorTemplate
          ? { id: sectorTemplate.id, nameAr: sectorTemplate.nameAr, nameEn: sectorTemplate.nameEn }
          : null,
      },
      latency: `${latency}s`,
    });
  } catch (error: any) {
    logEvent("ats_check_internal_error", { error: (error?.message || String(error)).slice(0, 300) });
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
