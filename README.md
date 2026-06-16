# ApplyFast 🚀

AI-powered job application toolkit for the Saudi & Gulf market. Generate tailored CVs, cover letters, ATS analysis, and interview prep — all with bilingual Arabic/English support.

## Features

- **AI CV Generator** — Paste your CV + job description → get a complete optimized application
- **ATS Check** — Analyze your CV against Gulf ATS platforms (Bayt.com, Mihnati, Naukri Gulf)
- **Custom Interview Questions** — Culturally-appropriate questions with Arabic translations
- **CV Extraction** — Parse CV content from uploaded files
- **Job Description Fetcher** — Auto-fetch JD from LinkedIn/GulfTalent URLs
- **Knowledge Bank** — Access company research and market insights
- **Sector Templates** — Pre-built templates for 20+ Saudi/Gulf industries
- **Bilingual** — Full Arabic/English support (Vision 2030, Saudization, Nitaqat)
- **Credit System** — Pay-per-use via Lemon Squeezy licensing

## Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **AI:** DeepSeek (primary), OpenAI (fallback)
- **Rate Limiting:** Upstash Redis
- **Payments:** Lemon Squeezy (licensing + credit packs)
- **Runtime:** Edge (API routes), Node.js (webhooks)

## Prerequisites

- Node.js 18+
- npm (or pnpm/yarn)

## Quick Start

```bash
# 1. Clone & install
git clone <repo-url>
cd applyfast
npm install

# 2. Set up environment (see Environment Variables below)
cp .env.example .env.local

# 3. Run dev server
npm run dev
# → http://localhost:3000
```

## Local Development

```bash
npm run dev        # Dev server with Turbopack
npm run build      # Production build
npm run start      # Start production server
npm run lint       # Run ESLint
```

## Environment Variables

Copy `.env.example` to `.env.local` and configure:

| Variable | Required | Description |
|---|---|---|
| `DEEPSEEK_API_KEY` | Yes* | DeepSeek API key for AI generation |
| `OPENAI_API_KEY` | No | OpenAI fallback if DeepSeek fails |
| `UPSTASH_REDIS_REST_URL` | Yes* | Upstash Redis URL for rate limiting |
| `UPSTASH_REDIS_REST_TOKEN` | Yes* | Upstash Redis token |
| `LEMONSQUEEZY_STORE_ID` | Yes* | Lemon Squeezy store ID |
| `LEMONSQUEEZY_WEBHOOK_SECRET` | Yes* | Webhook HMAC secret |
| `LEMONSQUEEZY_PRODUCT_ID` | No | Product ID for checkout |
| `LEMONSQUEEZY_VARIANT_IDS` | No | Comma-separated variant IDs |
| `NEXT_PUBLIC_BASE_URL` | No | Base URL (defaults to localhost) |

\* **Not required for development** — the app runs in Demo Mode when these are missing.

## 🧪 Demo Mode

ApplyFast runs fully without any API keys. When environment variables are missing:

- **AI Generation** → Returns realistic Arabic/English mock data
- **ATS Check** → Returns sample ATS analysis with Gulf-specific recommendations
- **Custom Questions** → Returns 7 pre-built Saudi/Gulf interview questions
- **Rate Limiting** → Disabled (unlimited free usage)
- **Payments** → Webhook returns placeholder responses

All features work end-to-end. Replace mock data with real API keys before production launch.

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── ats-check/      # ATS compatibility analysis
│   │   ├── custom-questions/ # Interview question generation
│   │   ├── extract/         # CV text extraction
│   │   ├── fetch-job/       # Job description fetcher
│   │   ├── generate/        # Main CV/job analysis generator
│   │   ├── knowledge/       # Company research
│   │   ├── license/         # License validation + credit consumption
│   │   ├── payment/         # Payment processing
│   │   ├── track/           # Analytics tracking
│   │   └── webhooks/        # Lemon Squeezy webhooks
│   ├── before-after/        # Comparison page
│   ├── privacy/             # Privacy policy
│   ├── terms/               # Terms of service
│   ├── layout.tsx
│   └── page.tsx             # Main application page
├── components/              # React components
├── hooks/                   # Custom React hooks
└── lib/                     # Shared utilities
    ├── prompts.ts           # AI prompt templates
    ├── redis.ts             # Redis client with fallback
    ├── sectorTemplates.ts   # Industry templates
    └── utils.ts             # General utilities
```

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Or connect your repo at [vercel.com](https://vercel.com).

Build settings:
- **Framework:** Next.js
- **Build Command:** `next build`
- **Output Directory:** `.next`
- **Install Command:** `npm install`

Remember to add all environment variables in Vercel dashboard → Settings → Environment Variables.

## Production Checklist

- [ ] Set all environment variables in production
- [ ] Configure Lemon Squeezy webhook URL to `https://your-domain.com/api/webhooks/lemon-squeezy`
- [ ] Update `CREDIT_PACKS` variant IDs in `src/lib/redis.ts` to match your Lemon Squeezy products
- [ ] Replace demo responses with real API calls (already handled — just add keys)
- [ ] Test payment flow end-to-end
- [ ] Enable monitoring/error tracking (Sentry, Logflare, etc.)

## Known Limitations

- Credit system requires Redis + Lemon Squeezy integration
- CV extraction uses regex-based parsing (no OCR for images)
- No authentication system (public tool)
- No persistent user accounts or history

## License

Private — All rights reserved.

---

Built with ❤️ for the Saudi job market 🇸🇦
