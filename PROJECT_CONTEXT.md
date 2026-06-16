# ApplyFast — Project Context

> **Last updated:** 2026-06-07
> **Git HEAD:** 5dcde4e (order_refunded webhook handler)

## فكرة المشروع
منصة سعودية/خليجية SaaS لتجهيز طلبات التوظيف. المستخدم يرفع CV + يلصق وصف وظيفي → يطلع له:
- Cover letter مخصص
- ATS analysis + match score
- أسئلة مقابلة مخصصة
- تحسينات مقترحة للسيرة

## التقنيات
- **Frontend:** Next.js 16 + TypeScript + Tailwind CSS (single page app)
- **Hosting:** Vercel serverless
- **AI:** DeepSeek primary → OpenAI fallback
- **State/Limits:** Upstash Redis
- **Payment:** Lemon Squeezy (webhooks)
- **CV Parsing:** pdf-parse + mammoth (DOCX)

## هيكل الملفات المهم
```
src/
├── app/
│   ├── page.tsx              # Main SPA (1000+ lines)
│   ├── layout.tsx
│   ├── privacy/page.tsx      # Added P1-2
│   ├── terms/page.tsx        # Added P1-2
│   └── api/
│       ├── generate/route.ts  # Main generation endpoint
│       ├── ats-check/route.ts # ATS analysis
│       ├── custom-questions/route.ts
│       ├── extract/route.ts   # CV PDF/DOCX extraction
│       ├── fetch-job/route.ts # Auto-fetch JD from URL
│       ├── track/route.ts
│       ├── license/validate/route.ts
│       ├── license/consume/route.ts
│       └── webhooks/lemon-squeezy/route.ts
└── lib/
    ├── i18n.ts               # Arabic/English translations
    ├── sectorPrompt.ts       # Sector templates + keyword matching
    └── utils.ts
```

## القرارات التقنية المهمة
1. **Single page app** — no routing for main functionality (simpler, faster)
2. **DeepSeek primary, OpenAI fallback** — cost optimization
3. **No server-side CV storage** — all CV data is in-memory only
4. **Client-side localStorage** — output rating + application history
5. **IP-based free tier** — 3 free requests/day via Upstash Redis
6. **Pay-per-use $3** — not subscription (yet)
7. **PII masking deferred to Phase 4** — honest disclosure used instead

## المهام المنجزة (ما قبل Phase 0)
- [x] ATS matching with DeepSeek
- [x] Sector templates (Oil & Gas, Tech, Health, Finance, etc.)
- [x] Full i18n (AR/EN)
- [x] CV Upload + Extract PDF/DOCX/TXT
- [x] Auto-fetch Job Description
- [x] Custom Questions Generator
- [x] Legal pages stub (existed before)
- [x] Security audit (7 issues fixed)
- [x] Anti-fabrication guardrails
- [x] Confidence flags on AI output

## الحالة الحالية — Phase 0
- [x] P0-1: تشخيص blocker bug — لم يتم إعادة إنتاجه. كل APIs شغالة. Build ناجح صفر أخطاء.
- [ ] P0-2: اختبار end-to-end (على زياد)
- [ ] P0-3: Retry + graceful failure لـ DeepSeek (قيد العمل)

## TODO — Phase 1 (قيد العمل عبر Claude Code)
- [ ] P1-2: صفحات Privacy Policy + Terms (AR/EN, RTL)
- [ ] P1-3: Trust strip على الصفحة الرئيسية
- [ ] P1-5: Input hardening (max length, prompt injection, file validation)

## Next (بعد Phase 1)
- Phase 2: Feedback widget, analytics, beta launch preparations
- Phase 3: Paywall, subscription feature flag
- Phase 4: Smart CV editing, all payments, Sentry, tests
