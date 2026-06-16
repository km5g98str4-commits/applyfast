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
 * POST /api/custom-questions
 *
 * Generates 5-7 tailored Saudi/Gulf-specific application questions
 * based on CV, job description, and optional sector.
 * Returns questions in both Arabic and English with suggested answers.
 */
export async function POST(req: NextRequest) {
  const startTime = Date.now();

  const isDemoMode = !DEEPSEEK_API_KEY;

  try {
    // IP-based rate limiting (5/day) — check only, don't increment yet
    const ip = getClientIP(req);
    const dailyKey = getDailyKey(`questions:${ip}`);
    const r = getRedis();

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
        logEvent("redis_rate_limit_warn", { endpoint: "custom-questions", error: (redisErr?.message || String(redisErr)).slice(0, 200) });
      }
    }

    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 });
    }
    const { cv, jobDescription, sector } = body as {
      cv?: string;
      jobDescription?: string;
      sector?: string;
    };

    if (!cv || typeof cv !== "string") {
      return NextResponse.json(
        { success: false, error: "CV text is required" },
        { status: 400 }
      );
    }

    if (!jobDescription || typeof jobDescription !== "string") {
      return NextResponse.json(
        { success: false, error: "Job description is required" },
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
      ? `The position is in the **${sectorTemplate.nameEn} (${sectorTemplate.nameAr})** sector in Saudi Arabia/Gulf.`
      : "The position is in Saudi Arabia or the Gulf region.";

    const systemPrompt = `You are a Saudi/Gulf region hiring expert generating culturally-aware application questions.

Generate 5-7 tailored interview/application questions that a candidate in Saudi Arabia or the Gulf would realistically face.

Question categories to include (mix across your 5-7 questions):
1. Role-specific technical/behavioral — standard competency questions
2. Vision 2030 awareness — how does the candidate's work align with Saudi national transformation?
3. Multicultural teamwork — Gulf workplaces typically have 10+ nationalities. How do they handle it?
4. Arabic communication — Gulf roles often require Arabic competency. Assess language fit.
5. Saudization/nationalization — understanding of Nitaqat and skill transfer expectations
6. Local market knowledge — familiarity with Saudi/Gulf business culture and stakeholders
7. Adaptability — working in a rapidly transforming economy (Vision 2030 pace of change)

Return ONLY valid JSON. No markdown, no code blocks.

{
  "questions": [
    {
      "questionEn": "question in English",
      "questionAr": "السؤال بالعربية (Gulf Arabic, not literal translation)",
      "category": "technical|behavioral|vision2030|multicultural|arabic_communication|nationalization|local_knowledge|adaptability",
      "suggestedAnswerEn": "tailored answer using CV and JD context — 3-5 sentences",
      "suggestedAnswerAr": "الإجابة المقترحة بالعربية (professional Gulf Arabic)",
      "keyPointsEn": ["bullet point 1", "bullet point 2"],
      "keyPointsAr": ["نقطة رئيسية ١", "نقطة رئيسية ٢"]
    }
  ]
}

RULES:
1. All Arabic text MUST be professional Gulf Arabic — warm, natural, not Google Translate.
2. Every suggested answer should reference SPECIFIC details from the candidate's CV and the job description.
3. At least 1 Vision 2030 question, 1 multicultural teamwork question, and 1 Arabic communication question.
4. Each question needs key points so the candidate knows what to emphasize.
5. Questions should feel like real Saudi/Gulf interview questions, not generic interview prompts.
6. If the job description implies Saudization requirements, include a nationalization/skill transfer question.

Vision 2030 topics to weave in:
- Digital transformation and e-government
- Economic diversification beyond oil
- Quality of life and livability
- Human capability development
- Private sector growth and SME enablement
- Sustainability and green initiatives
- Tourism and entertainment sector growth

Gulf workplace culture notes:
- Hierarchical but relationship-driven
- Wasta (connections) awareness — tactfully asked as "stakeholder management"
- Ramadan working hours understanding
- Weekend: Friday-Saturday (Saudi) or Saturday-Sunday (UAE)
- Conservative dress code awareness
- Prayer time accommodation

Return EXACTLY 5-7 questions. Ensure all string arrays have content.`;

    const userPrompt = `Candidate CV:\n${cv.slice(0, 2500)}\n\n---\n\nJob Description:\n${jobDescription.slice(0, 2000)}\n\n---\n\n${sectorContext}\n\nGenerate 5-7 culturally-appropriate Gulf interview questions with Arabic translations and suggested answers. Return ONLY the JSON object.`;

    let parsed: any;

    if (isDemoMode) {
      // 🧪 DEMO MODE
      await new Promise((r) => setTimeout(r, 500));
      parsed = {
        questions: [
          {
            questionEn: "How does your technical background align with Saudi Vision 2030's digital transformation goals?",
            questionAr: "كيف تتماشى خلفيتك التقنية مع أهداف التحول الرقمي في رؤية المملكة ٢٠٣٠؟",
            category: "vision2030",
            suggestedAnswerEn: "My experience building scalable cloud platforms directly supports Vision 2030's digital transformation pillar. I've worked on projects that mirror the e-government initiatives and am passionate about contributing to Saudi Arabia's journey toward a diversified digital economy.",
            suggestedAnswerAr: "خبرتي في بناء منصات سحابية قابلة للتوسع تدعم بشكل مباشر ركيزة التحول الرقمي في رؤية ٢٠٣٠. عملت على مشاريع تحاكي مبادرات الحكومة الإلكترونية وأنا شغوف بالمساهمة في مسيرة المملكة نحو اقتصاد رقمي متنوع.",
            keyPointsEn: ["Mention specific Vision 2030 programs", "Connect personal projects to national goals", "Show awareness of Saudi digital initiatives"],
            keyPointsAr: ["اذكر برامج رؤية 2030 المحددة", "اربط مشاريعك الشخصية بالأهداف الوطنية", "أظهر وعيك بالمبادرات الرقمية السعودية"]
          },
          {
            questionEn: "Tell us about a time you worked with a multicultural team. How did you adapt your communication style?",
            questionAr: "حدثنا عن تجربتك في العمل مع فريق متعدد الثقافات. كيف تكيّفت مع أساليب التواصل المختلفة؟",
            category: "multicultural",
            suggestedAnswerEn: "In my last role, I collaborated daily with colleagues from 8 nationalities. I learned that direct communication styles vary significantly — some cultures prefer written async communication while others thrive in verbal discussions. I adapted by establishing clear communication norms upfront, respecting prayer times, and being mindful of different weekend schedules.",
            suggestedAnswerAr: "في عملي السابق، تعاونت يوميًا مع زملاء من ٨ جنسيات مختلفة. تعلمت أن أساليب التواصل المباشر تختلف بشكل كبير — بعض الثقافات تفضل التواصل الكتابي غير المتزامن بينما تزدهر أخرى في النقاشات الشفهية. تكيفت بوضع قواعد تواصل واضحة مسبقًا، واحترام أوقات الصلاة، ومراعاة اختلاف أيام العطل الأسبوعية.",
            keyPointsEn: ["Give a specific multinational example", "Show adaptability, not just awareness", "Mention practical adaptations you made"],
            keyPointsAr: ["أعط مثالاً محددًا متعدد الجنسيات", "أظهر قدرتك على التكيف وليس فقط الوعي", "اذكر تعديلات عملية قمت بها"]
          },
          {
            questionEn: "How comfortable are you communicating technical concepts in Arabic to non-technical stakeholders?",
            questionAr: "ما مدى ارتياحك في شرح المفاهيم التقنية باللغة العربية لأصحاب المصلحة غير التقنيين؟",
            category: "arabic_communication",
            suggestedAnswerEn: "I'm fully bilingual and regularly present technical roadmaps to Arabic-speaking executives. I focus on business outcomes rather than technical jargon, using analogies relevant to the Saudi market. For example, I once explained microservices architecture to a ministry stakeholder using the analogy of specialized government departments — each handling its domain independently but coordinating through clear protocols.",
            suggestedAnswerAr: "أنا ثنائي اللغة بشكل كامل وأقدم بانتظام عروضًا تقنية للمدراء التنفيذيين الناطقين بالعربية. أركز على نتائج الأعمال بدلاً من المصطلحات التقنية، مستخدمًا تشبيهات ذات صلة بالسوق السعودي. على سبيل المثال، شرحت بنية الخدمات المصغرة لأحد المسؤولين باستخدام تشبيه الإدارات الحكومية المتخصصة.",
            keyPointsEn: ["Demonstrate bilingual capability", "Give a concrete example", "Show you can translate tech to business value"],
            keyPointsAr: ["أظهر قدرتك على التواصل بلغتين", "أعط مثالاً واقعياً", "أظهر قدرتك على ترجمة التقنية إلى قيمة أعمال"]
          },
          {
            questionEn: "What is your understanding of Saudization (Nitaqat) and how would you contribute to knowledge transfer in your role?",
            questionAr: "ما هو فهمك للسعودة (نطاقات) وكيف ستساهم في نقل المعرفة في دورك؟",
            category: "nationalization",
            suggestedAnswerEn: "Nitaqat is Saudi Arabia's framework for increasing national workforce participation. I understand that beyond meeting quotas, real impact comes from genuine knowledge transfer — mentoring Saudi graduates, documenting processes, and building internal capability. In previous roles, I've mentored junior developers and created onboarding programs that helped local talent grow into senior positions.",
            suggestedAnswerAr: "نطاقات هو إطار عمل المملكة لزيادة مشاركة القوى العاملة الوطنية. أفهم أن الأثر الحقيقي يتجاوز تحقيق النسب إلى النقل الحقيقي للمعرفة — توجيه الخريجين السعوديين، توثيق العمليات، وبناء القدرات الداخلية. في أدواري السابقة، وجهت مطورين مبتدئين وأنشأت برامج تأهيل ساعدت المواهب المحلية على النمو إلى مناصب عليا.",
            keyPointsEn: ["Show genuine understanding beyond quotas", "Give examples of knowledge transfer", "Align with Saudi talent development goals"],
            keyPointsAr: ["أظهر فهمًا حقيقيًا يتجاوز النسب", "أعط أمثلة على نقل المعرفة", "انسجم مع أهداف تطوير المواهب السعودية"]
          },
          {
            questionEn: "Describe a challenging technical problem you solved. What was your approach and what did you learn?",
            questionAr: "صف مشكلة تقنية صعبة قمت بحلها. ما هو منهجك وماذا تعلمت؟",
            category: "technical",
            suggestedAnswerEn: "Our production API was experiencing cascading timeouts during peak traffic. I systematically profiled the request chain, identified a database connection pool exhaustion issue, and implemented connection pooling with circuit breakers. The fix reduced 95th percentile latency from 8 seconds to under 400ms. Key learning: always instrument before optimizing.",
            suggestedAnswerAr: "كانت واجهة برمجة التطبيقات لدينا تعاني من انقطاعات متتالية خلال ذروة الاستخدام. قمت بتحليل منهجي لسلسلة الطلبات، وحددت مشكلة استنزاف تجمع اتصالات قاعدة البيانات، وطبقت تجمع اتصالات مع قواطع دوائر. خفض الإصلاح زمن الاستجابة من ٨ ثوانٍ إلى أقل من ٤٠٠ مللي ثانية.",
            keyPointsEn: ["Use the STAR method", "Include specific metrics", "Share what you learned"],
            keyPointsAr: ["استخدم طريقة STAR", "ضمن مقاييس محددة", "شارك ما تعلمته"]
          },
          {
            questionEn: "How do you stay current with technology trends in the Saudi and Gulf market?",
            questionAr: "كيف تبقى على اطلاع بأحدث التوجهات التقنية في السوق السعودي والخليجي؟",
            category: "local_knowledge",
            suggestedAnswerEn: "I follow Saudi tech communities on Twitter and LinkedIn, attend LEAP and Biban conferences when possible, and track initiatives from SDAIA, MCIT, and Monsha'at. I've also completed courses from Tuwaiq Academy and participate in local hackathons. The Saudi tech ecosystem is evolving rapidly — staying connected locally is essential.",
            suggestedAnswerAr: "أتابع مجتمعات التقنية السعودية على تويتر ولينكدإن، وأحضر مؤتمرات LEAP وبيبان عندما تسنح الفرصة، وأتابع مبادرات سدايا ووزارة الاتصالات ومنشآت. أكملت أيضًا دورات من أكاديمية طويق وأشارك في هاكاثونات محلية. النظام التقني السعودي يتطور بسرعة — البقاء على اتصال محليًا أمر أساسي.",
            keyPointsEn: ["Name specific Saudi tech events/initiatives", "Show local ecosystem engagement", "Mention continuous learning"],
            keyPointsAr: ["اذكر فعاليات ومبادرات تقنية سعودية محددة", "أظهر تفاعلك مع النظام المحلي", "اذكر التعلم المستمر"]
          },
          {
            questionEn: "Where do you see yourself in 3 years within the Saudi tech ecosystem?",
            questionAr: "أين ترى نفسك بعد ٣ سنوات في منظومة التقنية السعودية؟",
            category: "adaptability",
            suggestedAnswerEn: "In 3 years, I aim to grow into a technical leadership role where I can drive Saudi digital products from concept to market. I want to contribute to the growing SaaS ecosystem, mentor the next generation of Saudi engineers, and potentially launch a tech initiative that addresses a local market gap. The timing is right — Saudi Arabia's tech sector is at an inflection point.",
            suggestedAnswerAr: "خلال ٣ سنوات، أهدف إلى النمو إلى دور قيادي تقني حيث يمكنني دفع المنتجات الرقمية السعودية من الفكرة إلى السوق. أريد المساهمة في منظومة SaaS المتنامية، وتوجيه الجيل القادم من المهندسين السعوديين، وربما إطلاق مبادرة تقنية تعالج فجوة في السوق المحلي. التوقيت مناسب — قطاع التقنية السعودي في نقطة تحول.",
            keyPointsEn: ["Be ambitious but realistic", "Connect to Saudi market growth", "Show long-term commitment to the region"],
            keyPointsAr: ["كن طموحًا لكن واقعيًا", "اربط بنمو السوق السعودي", "أظهر التزامًا طويل المدى بالمنطقة"]
          }
        ]
      };
    } else {
      // Live mode: try DeepSeek first, fallback to OpenAI
      const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
      const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
      const OPENAI_MODEL = "gpt-4o-mini";

      const callLLM = async (url: string, apiKey: string, model: string, attempt: number): Promise<string> => {
        const retryNote = attempt > 0 ? "\n\nIMPORTANT: Your previous response was not valid JSON. Output ONLY the JSON object this time, no markdown, no explanation." : "";

        const res = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: "system", content: systemPrompt + retryNote },
              { role: "user", content: userPrompt },
            ],
            temperature: attempt === 0 ? 0.4 : 0.2,
            max_tokens: 2500,
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

      const parseWithRetry = async (provider: string, url: string, apiKey: string, model: string): Promise<any> => {
        for (let attempt = 0; attempt <= 2; attempt++) {
          try {
            const raw = await callLLM(url, apiKey, model, attempt);
            const cleaned = raw.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
            return JSON.parse(cleaned);
          } catch (err: any) {
            const msg = err?.message || String(err);
            if (attempt < 2 && (msg.includes("Invalid AI") || msg.includes("JSON") || msg.includes("parse"))) {
              continue; // Retry parse failures
            }
            throw err;
          }
        }
        throw new Error("Failed to generate valid JSON after retries");
      };

      let provider = "deepseek";

      try {
        parsed = await parseWithRetry("deepseek", DEEPSEEK_URL, DEEPSEEK_API_KEY!, MODEL);
        logEvent("custom_questions_ok", { provider, latency: ((Date.now() - startTime) / 1000).toFixed(1) });
      } catch (deepseekErr: any) {
        const msg = deepseekErr?.message || String(deepseekErr);
        logEvent("custom_questions_provider_error", { provider: "deepseek", error: msg.slice(0, 200) });

        if (OPENAI_API_KEY) {
          try {
            parsed = await parseWithRetry("openai", OPENAI_URL, OPENAI_API_KEY, OPENAI_MODEL);
            provider = "openai";
            logEvent("custom_questions_fallback_ok", { provider: "openai" });
          } catch (openaiErr: any) {
            logEvent("custom_questions_all_providers_failed", {
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
      } catch (redisErr: any) {
        // Non-fatal — credit was already delivered, just couldn't count it
        logEvent("redis_consume_warn", { endpoint: "custom-questions", error: (redisErr?.message || String(redisErr)).slice(0, 200) });
      }
    }

    const latency = ((Date.now() - startTime) / 1000).toFixed(1);

    return NextResponse.json({
      success: true,
      data: {
        questions: parsed.questions || [],
        sector: sectorTemplate
          ? { id: sectorTemplate.id, nameAr: sectorTemplate.nameAr, nameEn: sectorTemplate.nameEn }
          : null,
      },
      latency: `${latency}s`,
    });
  } catch (error: any) {
    logEvent("custom_questions_internal_error", { error: (error?.message || String(error)).slice(0, 300) });
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
