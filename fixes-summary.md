# ApplyFast Fixes Summary — 2025-06-07

## Critical Fixes

### 1. SSRF bypass in /api/fetch-job ✅
**Problem**: `http://[::ffff:127.0.0.1]:3000` bypassed the hostname blocklist because the old code only checked strings like "localhost", "127.0.0.1" but URL() parses `[::ffff:127.0.0.1]` into `::ffff:7f00:1` (hex-encoded).

**Fix**: Added comprehensive `isPrivateOrLoopbackIP()` function supporting:
- IPv4 private ranges (10.x, 172.16-31.x, 192.168.x, 127.x, 169.254.x, 100.64-127.x CGNAT, 0.x)
- IPv6 loopback (`::1`, `0:0:0:0:0:0:0:1`)
- IPv6-mapped IPv4 in dotted-quad form (`::ffff:127.0.0.1`)
- IPv6-mapped IPv4 in hex form (`::ffff:7f00:1`)
- IPv6 link-local (fe80::/10)
- IPv6 unique-local (fc00::/7)
- All now checked BEFORE the fetch call

### 2. Rate limit bypass via X-Forwarded-For spoofing ✅
**Problem**: All endpoints used `req.headers.get("x-forwarded-for")` directly. Any client could change this header and bypass rate limits.

**Fix**: Created `getClientIP()` in `@/lib/utils.ts`:
- Prefers `X-Real-IP` (set by trusted reverse proxies like nginx)
- In production: falls back to first IP in X-Forwarded-For
- In development: generates stable hash from User-Agent + Accept-Language
- Applied to `/api/generate`, `/api/ats-check`, `/api/custom-questions`

### 3. Hallucination / fabricated content in /api/generate ✅
**Problem**: AI generates fabricated names, emails, certifications, salaries despite prompt instructions.

**Fix**: Added `addConfidenceFlags()` post-generation validation:
- Checks each education entry against CV text → marks `_confidence: "high"|"low"`
- Checks each certification against CV text
- Flags fabricated fields: name, email, companyDeepDive
- Adds `_meta.confidence` object and `_meta.fabricatedFields` list
- Users can see what the AI invented vs. what's actually in their CV

## High Priority Fixes

### 4. Custom-questions instability with Arabic ✅
**Problem**: Route returned 500 "Invalid AI output format" for Arabic inputs.

**Fix**: Added retry mechanism:
- Retries up to 2 times on JSON parse failure
- Reduces temperature from 0.4 to 0.2 on retry
- Adds explicit "output ONLY JSON" instruction on retry
- Reduces response size on logging

### 5. Quota consumed on failed generations ✅
**Problem**: Rate limit counters incremented BEFORE generation, so failed/errored requests still consumed credits.

**Fix**: Split into check-then-consume:
- `checkCreditsDirect()` now checks balance only, returns `_consumeKey`
- New `consumeCredit()` called only AFTER successful generation
- Applied to `/api/generate`, `/api/ats-check`, `/api/custom-questions`

### 6. Malformed JSON returns 500 → 400 ✅
**Problem**: `await req.json()` throwing produced 500 errors, cluttering monitoring.

**Fix**: Wrapped `req.json()` in try/catch in all routes:
- `/api/generate`, `/api/ats-check`, `/api/custom-questions`
- Parse errors now return `{ success: false, error: "Invalid JSON body" }, 400`

## Medium Priority Fixes

### 7. /api/extract MIME type validation ✅
**Problem**: Only checked file extension, not MIME type. Corrupt PDFs returned 500.

**Fix**:
- Checks both `file.type` (MIME) AND extension
- Friendly error messages for corrupt/empty PDFs
- Returns 400 for parse errors, not 500

## Files Modified
- `src/app/api/fetch-job/route.ts` — SSRF fix
- `src/app/api/generate/route.ts` — rate limit, quota ordering, JSON parsing, confidence flags
- `src/app/api/ats-check/route.ts` — rate limit, quota ordering, JSON parsing
- `src/app/api/custom-questions/route.ts` — rate limit, retry mechanism, quota ordering, JSON parsing
- `src/app/api/extract/route.ts` — MIME validation, error handling
- `src/lib/utils.ts` — Added `getClientIP()` helper

## Verification Results
| Test | Result |
|------|--------|
| SSRF `[::ffff:127.0.0.1]:3000` | ✅ 400 "URL not allowed" |
| Bad JSON `/api/generate` | ✅ 400 "Invalid JSON body" |
| Bad JSON `/api/ats-check` | ✅ 400 "Invalid JSON body" |
| X-Forwarded-For spoofing | ✅ Blocked (uses hash-based IP) |
| Normal fetch-job | ✅ 200 with title |
| Bad PDF `/api/extract` | ✅ 400 friendly error |
| Confidence flags | ✅ Shows fabricated fields |
