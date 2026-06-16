# How I Built and Launched an AI SaaS in One Night (And $0)

> A technical walkthrough of building ApplyFast — from empty folder to live product on Vercel in under 8 hours.

---

## The Problem

Job hunting is broken. The average applicant spends 30-45 minutes tailoring a single application — reading the JD, adjusting their CV, writing a cover letter, and checking keywords. Multiply that by 50 applications and you're looking at 25+ hours of work.

The MENA market is even worse. LinkedIn job posts in Saudi regularly hit 1000+ applicants within 24 hours. Standing out means tailoring every. single. application.

I decided to build a solution. In one night.

## The Stack (and Why)

### Next.js 16 App Router
The newest Next.js with React Server Components, streaming, and the App Router. I went with client-side rendering for the main page since it's an interactive SPA-like experience, but used server-side API routes for all AI calls.

### DeepSeek AI (Primary)
Here's the economics:
- DeepSeek API: ~$0.14 per 1M input tokens
- GPT-4o: ~$2.50 per 1M input tokens

That's an **18x cost difference**. For a free-tier product, this matters.

Quality-wise, DeepSeek's Arabic output is surprisingly good — often better than GPT-4 for Gulf dialect understanding. One unexpected win.

### OpenAI (Fallback)
No single AI provider is 100% reliable. Every API route follows the same pattern:

```typescript
// 1. Try DeepSeek
try {
  return await callDeepSeek(prompt);
} catch (deepseekError) {
  console.warn("DeepSeek failed, falling back to OpenAI", deepseekError);
}

// 2. Try OpenAI
try {
  return await callOpenAI(prompt);
} catch (openaiError) {
  console.error("Both providers failed", openaiError);
  return NextResponse.json(
    { error: "Service temporarily unavailable. Please try again." },
    { status: 502 }
  );
}
```

This pattern saved me during testing when DeepSeek had a 2-minute outage. Users never noticed.

### Upstash Redis
For rate limiting and credit management. Server-side authority (never trust localStorage for credits — learned this the hard way on another project).

### Lemon Squeezy
The most underrated payment platform. Merchant of Record (handles all VAT/tax), solid API, and generous free tier. Way faster to integrate than Stripe for solo devs.

### Vercel
Obvious choice for Next.js. Zero-config deploy. Edge functions for API routes.

## Architecture Decisions

### 1. No Browser Automation

Some job application tools use Playwright/Puppeteer to automate form-filling. I deliberately avoided this. Reasons:
- ToS violations on job boards
- High infrastructure costs (headless browsers aren't cheap)
- Fragile (one UI change on LinkedIn breaks everything)

Instead, ApplyFast *generates* the application text. The user copy-pastes it. Less magical, but sustainable and legal.

### 2. Arabic-First Design

Most AI tools treat Arabic as an afterthought (if at all). ApplyFast was designed Arabic-first:
- RTL layout with Cairo font
- Arabic UI, Arabic prompts, Arabic templates
- Sector templates that understand Saudi market context

The 400M+ Arabic speakers are an underserved market for AI tools.

### 3. Single-File Core Page

Controversial, but `page.tsx` is ~1100 lines. Why?

Because it's a single-page app where everything is visible at once — no tabs, no complex routing. The user's entire journey (paste URL → upload CV → select template → view results) happens on one screen.

When this grows, I'll extract components. For v1, the monolith was faster to ship.

## The "One Night" Timeline

- **8 PM**: `npx create-next-app@latest`
- **9 PM**: Core form UI + file upload working
- **10 PM**: DeepSeek API integration for job description analysis
- **11 PM**: CV extraction endpoint
- **12 AM**: ATS check + custom questions endpoints
- **1 AM**: ApplicationPack component (the "deliverable")  
- **2 AM**: Error handling, fallback chain, loading states
- **3 AM**: i18n, sector templates, Arabic prompts
- **4 AM**: UI polish — dark emerald theme, animations, responsive
- **5 AM**: Rate limiting, security hardening
- **6 AM**: Build, test, fix TypeScript errors
- **7 AM**: Deploy to Vercel, test production
- **8 AM**: Live at https://applyfast-chi.vercel.app

## Launch Numbers (First 24 Hours)

*Still collecting data — will update.*

## Lessons Learned

1. **DeepSeek is criminally underrated.** 18x cheaper than GPT-4, Arabic quality is solid. The API is stable.

2. **Always have a fallback.** AI APIs go down. Plan for it.

3. **Ship the monolith first.** Don't over-engineer. One file is fine for v1.

4. **Free tier is a growth hack.** No signup + 3/day removed all friction. First users came from word of mouth.

5. **Security matters from day one.** Found and fixed 7 vulnerabilities in the first 48 hours (SSRF, rate limiting, input sanitization). Fix them early before they bite.

## What's Next

- Multi-language CV support  
- Job board integrations (LinkedIn, Indeed, Bayt)
- Interview question generation
- Open-source the core engine

---

**Try it:** https://applyfast-chi.vercel.app
**GitHub:** https://github.com/km5g98str4-commits/applyfast

---

*Built by a solo dev in Riyadh who wanted to spend less time applying to jobs and more time building things.* 🇸🇦
