# ApplyFast Audit Report

Date: 2026-06-07  
Auditor: Codex subagent QA/security pass  
Target: `http://localhost:3000`

## Scope

Tested:

- `POST /api/extract`
- `POST /api/fetch-job`
- `POST /api/generate`
- `POST /api/ats-check`
- `POST /api/custom-questions`
- `POST /api/license/validate`

Reviewed source:

- `src/app/api/generate/route.ts`
- `src/app/api/extract/route.ts`
- `src/app/api/fetch-job/route.ts`
- `src/app/api/ats-check/route.ts`
- `src/app/api/custom-questions/route.ts`
- `src/app/api/license/validate/route.ts`
- `src/lib/redis.ts`

Test coverage included:

- happy paths
- empty payloads
- malformed JSON
- wrong content types
- very large inputs
- Arabic text
- XSS-style payloads
- SSRF attempts
- rate limiting behavior
- CORS / method handling

## 1. Feature Testing Results

### `/api/extract`

| Case | Result | Notes |
| --- | --- | --- |
| Valid `.txt` CV | `200` | Extracted text correctly from a bilingual sample CV. |
| No file | `400` | Correct error: `No file provided`. |
| Wrong extension (`.exe`) | `400` | Correctly rejected unsupported type. |
| Large file (`6 MB`) | `400` | Correctly enforced 5 MB limit. |
| Fake `.pdf` (not real PDF bytes) | `500` | Parser exception becomes generic server error instead of validation failure. |

Observations:

- Basic TXT extraction works.
- Validation is based on filename extension only, not MIME type or file signature.
- Bad PDFs are handled as server errors, which is user-hostile and easy to trigger.

### `/api/fetch-job`

| Case | Result | Notes |
| --- | --- | --- |
| Real job URL: DiDi Greenhouse posting | `200` | Extracted meaningful job text successfully. |
| Non-job URL: `https://www.example.com` | `200` | Extracted text successfully. |
| Real modern job URL: Notion Ashby posting | `422` | Could not extract meaningful content; extractor struggles on JS-heavy pages. |
| Invalid URL string | `400` | Correct. |
| Missing `url` | `400` | Correct. |
| `file:///etc/passwd` | `400` | Correctly blocked non-HTTP(S). |
| `http://localhost:3000` | `400` | Correctly blocked. |
| `http://169.254.169.254/latest/meta-data/` | `400` | Correctly blocked. |
| `http://192.168.1.10` | `400` | Correctly blocked. |
| Non-existent domain | `502` | Returns fetch failure string. |
| Upstream `404` page | `502` | Returns upstream status text. |
| `http://[::ffff:127.0.0.1]:3000` | `200` | SSRF bypass succeeded; app fetched its own homepage. |

Observations:

- Route works on some server-rendered pages.
- Route is unreliable on modern JS-heavy job boards.
- SSRF protection is incomplete and bypassable.

### `/api/generate`

| Case | Result | Notes |
| --- | --- | --- |
| Valid English/Arabic sample CV + JD | `200` | Returned structured JSON with bilingual output. |
| Missing `jobDescription` | `400` | Correct. |
| Large `cv` (`5200 chars`) + large JD | `400` | Correctly enforced hard limits. |
| Malformed JSON | `500` | Should be `400`; currently falls into generic catch. |
| `Content-Type: text/plain` with JSON body | `200` | Accepted and processed anyway. |
| Minimal nonsense body `{cv:\"a\", jobDescription:\"b\"}` | `200` | Generated fabricated-looking content instead of rejecting poor input. |
| XSS-like CV payload with `<script>` | `200` | Route did not crash; output still contained fabricated claims not grounded in CV. |
| 4 requests from same spoofed IP without license | 3 x `200`, then `402` | Free limit enforced after 3/day. |

Observations:

- Happy path works.
- Output quality is not trustworthy: the generator invented education, certifications, funding, salary ranges, metrics, and company details despite prompt instructions not to do so.
- No schema/fact validation exists after model output is parsed.
- Request parsing is too permissive; wrong `Content-Type` is still accepted.

### `/api/ats-check`

| Case | Result | Notes |
| --- | --- | --- |
| Valid English CV | `200` | Returned bilingual Gulf ATS analysis. |
| Valid Arabic CV | `200` | Returned Arabic-focused analysis. |
| Missing `cv` | `400` | Correct. |
| Very large Arabic input | `200` | Accepted; route silently truncates to first 3000 chars before prompting. |
| XSS-like CV payload | `200` | Output explicitly flagged HTML/script tags as problematic. |
| Malformed JSON | `500` | Should be `400`. |
| 6 requests from same spoofed IP | 5 x `200`, then `429` | Daily limit enforced after 5/day. |

Observations:

- Endpoint is functional and more stable than `custom-questions`.
- No explicit max input size is enforced at API boundary.
- Failed/malformed requests still enter the broad error path instead of clean validation.

### `/api/custom-questions`

| Case | Result | Notes |
| --- | --- | --- |
| Valid English CV + JD | `200` | Returned 7 bilingual Gulf-style questions. |
| Valid Arabic CV + JD | `500` | Failed with `Invalid AI output format`. |
| Missing `jobDescription` | `400` | Correct. |
| XSS-like CV payload | `500` | Failed with `Invalid AI output format`. |
| Large JD | `500` | Failed with `Invalid AI output format`. |
| Malformed JSON | `500` | Should be `400`. |
| 6 requests from same spoofed IP | mix of `500` and `200`, then `429` | Failed generations still consumed quota. |

Observations:

- This route is materially unstable.
- The JSON contract with the model is brittle.
- Arabic and adversarial inputs are enough to trigger parse failures.

### `/api/license/validate`

| Case | Result | Notes |
| --- | --- | --- |
| Missing `license_key` | `400` | Correct. |
| Invalid test key | `502` | Route maps upstream non-OK response to generic validation failure. |
| Malformed JSON | `503` | Should be `400`; currently reported as service issue. |
| Valid key | Not tested | No valid license key was available in the environment. |

Observations:

- Negative-path behavior is inconsistent.
- Could not verify happy-path license redemption/credit seeding without a real key.

### CORS / method handling

| Check | Result | Notes |
| --- | --- | --- |
| `OPTIONS` on all tested endpoints | `204` | Route responds cleanly. |
| `Access-Control-*` headers | none observed | Browser cross-origin calls appear blocked by default; same-origin only. |

Interpretation:

- No obvious permissive CORS exposure was observed.
- If cross-origin embedding is intended later, explicit CORS policy will need to be added carefully.

### API key exposure / error leakage

- No API keys or secrets were exposed in JSON responses during this audit.
- Some routes echo upstream/network details more than necessary, especially `fetch-job` (`HTTP 404 Not Found`, raw fetch failure message).

## 2. Bugs Found

### Critical

#### 1. SSRF bypass in `/api/fetch-job`

Severity: Critical  
Code: `src/app/api/fetch-job/route.ts:25-53`

Impact:

- The app can be used to fetch internal services despite the SSRF blocklist.
- I successfully fetched the local ApplyFast homepage through `http://[::ffff:127.0.0.1]:3000`.

Steps to reproduce:

1. Send:
   ```bash
   curl -s -H 'Content-Type: application/json' \
     -d '{"url":"http://[::ffff:127.0.0.1]:3000"}' \
     http://localhost:3000/api/fetch-job
   ```
2. Observe `200 OK` and the homepage text in the response.

Root cause:

- Host blocking only covers a small literal list plus dotted IPv4 private ranges.
- IPv6-mapped IPv4 loopback is not normalized or blocked.

### High

#### 2. Rate limits are bypassable because they trust client-controlled `X-Forwarded-For`

Severity: High  
Code:

- `src/app/api/generate/route.ts:118-120`
- `src/app/api/ats-check/route.ts:30-45`
- `src/app/api/custom-questions/route.ts:30-45`

Impact:

- Any client can rotate `X-Forwarded-For` and reset free-tier / daily quota.
- This undermines usage controls and cost protection.

Steps to reproduce:

1. Send 3 generate requests with `X-Forwarded-For: 198.51.100.15`; the 4th returns `402`.
2. Change the header to a new IP.
3. Requests succeed again immediately.

Root cause:

- The app treats the request header as trusted origin identity.
- There is no verification that a trusted proxy inserted it.

#### 3. `/api/generate` returns fabricated facts despite explicit prompt bans

Severity: High  
Code:

- Prompt rules: `src/app/api/generate/route.ts:196-245`
- Unvalidated passthrough of model JSON: `src/app/api/generate/route.ts:313-330`

Impact:

- Users can receive made-up education, salary, funding, certifications, and achievements.
- This directly harms product trust and can cause applicants to submit false information.

Evidence from live test:

- Sample CV did not contain salary, funding, SCE/PMP, company funding totals, or extra quantified metrics.
- Response still invented them.

Steps to reproduce:

1. Send a simple CV with limited facts.
2. Observe returned `data` contains inferred/fabricated company research and achievements.

Root cause:

- Prompting alone is used as the safety/control mechanism.
- There is no post-generation factual validation against the input CV/JD.

### Medium

#### 4. `/api/custom-questions` is brittle and fails on valid Arabic / adversarial inputs

Severity: Medium  
Code: `src/app/api/custom-questions/route.ts:186-198`

Impact:

- Legitimate user requests fail with `500 Invalid AI output format`.
- Arabic-heavy inputs are not reliably supported even though the product is explicitly bilingual.

Steps to reproduce:

1. Submit a valid Arabic CV and normal English JD.
2. Observe `500` with `Invalid AI output format`.

Also reproduced with:

- XSS-like input
- oversized JD

#### 5. Failed AI generations still consume daily quota

Severity: Medium  
Code:

- `src/app/api/ats-check/route.ts:30-45`
- `src/app/api/custom-questions/route.ts:30-45`

Impact:

- Users can lose daily quota on server-side parse failures or malformed requests.
- This is especially bad on `custom-questions`, where failures are common.

Steps to reproduce:

1. Send repeated `custom-questions` requests that produce `500 Invalid AI output format`.
2. Continue until the 6th call.
3. Observe `429 Daily limit reached` even though earlier attempts failed.

Root cause:

- The rate-limit counter increments before request validation and before successful generation.

#### 6. JSON parsing errors are reported as server failures instead of client errors

Severity: Medium  
Code:

- `src/app/api/generate/route.ts:331-336`
- `src/app/api/ats-check/route.ts:212-217`
- `src/app/api/custom-questions/route.ts:213-218`
- `src/app/api/fetch-job/route.ts:103-108`
- `src/app/api/license/validate/route.ts:98-100`

Impact:

- Malformed JSON produces `500`/`503`, polluting monitoring and confusing clients.

Steps to reproduce:

1. Send `Content-Type: application/json` with body `{bad json`.
2. Observe server-side error response instead of `400 Bad Request`.

#### 7. `/api/generate` accepts wrong `Content-Type` and poor-quality payloads

Severity: Medium  
Code: `src/app/api/generate/route.ts:95-100`

Impact:

- `text/plain` bodies containing JSON are still processed.
- Extremely low-signal payloads like `cv:"a"` and `jobDescription:"b"` produce fabricated application data and consume quota.

Steps to reproduce:

1. Send:
   ```bash
   curl -s -H 'Content-Type: text/plain' \
     --data '{"cv":"a","jobDescription":"b"}' \
     http://localhost:3000/api/generate
   ```
2. Observe `200 OK` and generated JSON instead of validation failure.

#### 8. `/api/fetch-job` extractor is unreliable for modern JS-heavy job boards

Severity: Medium  
Code: `src/app/api/fetch-job/route.ts:83-101` and `:115-158`

Impact:

- Real job links on modern platforms can fail with `422 Could not extract meaningful content`.
- This affects practical usability even when the URL is valid.

Evidence:

- DiDi Greenhouse job page worked.
- Notion Ashby job page returned `422`.

### Low

#### 9. `/api/extract` trusts file extension, not actual type/signature

Severity: Low  
Code: `src/app/api/extract/route.ts:21-45`

Impact:

- A fake `.pdf` triggers parser failure and returns `500`.
- Better type validation would reject earlier and more cleanly.

Steps to reproduce:

1. Upload a non-PDF file named `fake.pdf`.
2. Observe `500 Failed to extract text from file`.

#### 10. `license/validate` maps invalid upstream responses to infrastructure-style errors

Severity: Low  
Code: `src/app/api/license/validate/route.ts:47-49` and `:98-100`

Impact:

- Invalid keys can show `502 License validation failed`.
- Malformed JSON shows `503 Service temporarily unavailable`.
- This makes client-side handling and support debugging harder.

## 3. Security Issues

### SSRF

Status: Vulnerable

Confirmed blocked:

- `http://localhost:3000`
- `http://127.0.0.1:3000`
- `http://169.254.169.254/latest/meta-data/`
- `http://192.168.1.10`
- `file:///etc/passwd`

Confirmed bypass:

- `http://[::ffff:127.0.0.1]:3000`

Assessment:

- Current SSRF protection is not sufficient.
- The route should normalize and resolve hostnames/IPs before any fetch and reject all loopback, link-local, RFC1918, RFC4193, multicast, and unspecified ranges.

### XSS

Status: No immediate reflected-XSS exploit confirmed in API responses, but input handling is loose.

Findings:

- `generate`, `ats-check`, and `custom-questions` accepted XSS-style payloads without sanitization.
- `ats-check` explicitly surfaced the HTML/script-tag problem in its own analysis.
- Whether this becomes exploitable depends on how the frontend renders returned strings. This audit was API-focused and did not confirm `dangerouslySetInnerHTML` usage.

Recommendation:

- Treat all model/output strings as untrusted.
- Escape or render as plain text in the frontend.

### Rate limiting

Status: Present but weak

Findings:

- `generate`: 3/day free limit works mechanically.
- `ats-check`: 5/day works mechanically.
- `custom-questions`: 5/day works mechanically.
- All of them trust `X-Forwarded-For`, so they are bypassable.
- Failed requests can consume quota.

### Input validation

Status: Inconsistent

Findings:

- `generate` has hard length limits but weak semantic validation.
- `ats-check` and `custom-questions` have no explicit request size limits.
- Wrong `Content-Type` is accepted in `generate`.
- Malformed JSON usually returns `500`/`503` instead of `400`.
- `extract` uses extension-based validation only.

### CORS

Status: No permissive CORS issue observed

Findings:

- `OPTIONS` returns `204`.
- No `Access-Control-Allow-Origin` headers were observed.
- Browser access appears same-origin only.

### API key exposure

Status: None observed during audit

Findings:

- No secrets were exposed in route responses.
- The app did reveal some upstream fetch details in `fetch-job`, but not credentials.

### Error handling / infrastructure leakage

Status: Mixed

Findings:

- Positive: many routes avoid dumping raw stack traces.
- Negative: `fetch-job` leaks upstream status text and low-level fetch error strings.
- Negative: malformed client payloads are misclassified as server outages in several routes.

## 4. Social Media Research

Queries used:

- `AI job application tool problems reddit`
- `resume optimization tool issues common complaints`
- `ATS resume checker accuracy problems`
- `AI cover letter generator issues`
- `job application AI tool user complaints`

Note:

- The OpenClaw `web_search` provider hit bot-detection/challenge pages on several queries.
- I supplemented the successful search hits with `web_fetch` on the result pages that were reachable.

Sources reviewed:

- Reddit search hit: `r/GetEmployed` thread on whether AI job application tools are worth it
- Third-party summary: Qarera article on Reddit resume-builder complaints
- Third-party summary: AI Tool Discovery article on Reddit opinions for ATS/job-search tools
- Third-party review roundup: Toolworthy AI job application tools guide
- Opinion article: The Interview Guys on auto-apply bots

Common pain points that recur across those sources:

1. Mass auto-apply hurts application quality.
   Users complain that high-volume tools submit weak or irrelevant applications and increase ghosting.

2. Generated content often sounds generic or fabricated.
   Repeated concern: AI cover letters and resume rewrites lose the candidate's real voice and add claims they cannot defend.

3. ATS-match tools encourage keyword stuffing.
   Users like keyword hints, but complain that over-optimization produces unnatural resumes and may optimize for the scanner more than the recruiter.

4. Modern job tools hide costs or gate exports/features.
   Common complaint themes include export paywalls, weekly billing traps, credit expiration, and expensive subscriptions during long job searches.

5. Auto-apply tools can target poor-fit jobs.
   Several summaries highlight irrelevant submissions and mismatched applications as a recurring failure mode.

6. Resume formatting remains fragile.
   Users repeatedly warn that visually rich templates can break ATS parsing even when the builder markets itself as "ATS friendly."

7. Job seekers still value transparency and control.
   The more users feel the tool is silently deciding, fabricating, or spraying applications, the lower the trust.

Product implication for ApplyFast:

- The biggest market risk is not "missing more AI features."
- It is losing trust by generating polished but inaccurate output, or by making users feel they cannot verify what was created on their behalf.

## 5. Recommendations

### Priority 0

1. Fix the SSRF model in `/api/fetch-job`.
   Resolve the hostname to IPs before fetch, normalize IPv4/IPv6 representations, and deny all loopback/private/link-local/metadata ranges.

2. Stop trusting raw `X-Forwarded-For`.
   Only honor forwarding headers from a known proxy/CDN, or use provider-specific trusted IP extraction.

3. Add post-generation validation for `/api/generate`.
   Validate returned fields against the submitted CV/JD and reject hallucinated fields instead of returning them.

### Priority 1

4. Harden `custom-questions`.
   Use schema-constrained generation, JSON schema validation, retry-on-parse-failure, and possibly lower-complexity output format.

5. Move quota consumption to after request validation and successful generation.
   Failed parses and malformed payloads should not burn daily limits.

6. Return `400` for malformed JSON everywhere.
   Separate body-parse errors from internal failures.

### Priority 2

7. Enforce request `Content-Type` and minimum useful input quality.
   Reject `text/plain` JSON bodies and tiny nonsense payloads.

8. Improve upload validation.
   Check MIME type and file signature, not just filename extension.

9. Improve job-page extraction.
   Detect JS-heavy pages earlier and consider readable extraction fallback, DOM parsing, or vendor-specific adapters for Greenhouse/Ashby/Lever.

### Priority 3

10. Normalize error semantics.
    Use `429` for rate limits, `400` for bad client input, `422` for semantically invalid but parseable payloads, and `502` only for genuine upstream failures.

11. Add observability around model parse failures.
    Track per-route JSON parse failure rates, input characteristics, and retry outcomes.

12. Add regression tests for the exact cases above.
    Include SSRF payloads, malformed JSON, Arabic inputs, XSS strings, wrong content types, quota-consumption edge cases, and fake file-type uploads.

## Bottom Line

What works:

- Core happy paths for `extract`, `generate`, `ats-check`, and some `fetch-job` URLs.
- Basic rate limiting mechanics.
- No obvious secret leakage in responses.

What is most concerning:

- Confirmed SSRF bypass.
- Header-spoofable rate limits.
- Hallucinated application content in the main generation route.
- Unstable bilingual `custom-questions` behavior.

If this were a production launch gate, I would block release on the SSRF issue and on the trust/integrity issues in `generate`.
