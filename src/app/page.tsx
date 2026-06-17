"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Loader2,
  Copy,
  Sparkles,
  CheckCircle2,
  Zap,
  Target,
  Gauge,
  Building2,
  ArrowRight,
  HelpCircle,
  Globe,
  Layers,
  FileText,
  Link,
  SendHorizonal,
  ChevronDown,
  X,
  Star,
} from "lucide-react";
import ApplicationPack, { ApplicationPackData } from "@/components/ApplicationPack";
import FreshGraduateToggle from "@/components/FreshGraduateToggle";
import CvReviewStep from "@/components/CvReviewStep";
import PricingSection from "@/components/PricingSection";

export default function Home() {
  const [cv, setCv] = useState("");
  const [jobLink, setJobLink] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ApplicationPackData | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [licenseKey, setLicenseKey] = useState<string>("");
  const [licenseValid, setLicenseValid] = useState(false);
  const [licenseChecking, setLicenseChecking] = useState(false);
  const [locale, setLocale] = useState<"en" | "ar">("en");
  const [freshGraduateMode, setFreshGraduateMode] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const loadDemo = () => {
    setCv(
      "Senior Software Engineer with 6 years of experience building scalable web applications. Proficient in React, TypeScript, Node.js, and PostgreSQL. Led a team of 5 engineers to deliver a customer-facing platform serving 2M+ users. Reduced latency by 40% through API optimization. AWS certified. B.Sc. Computer Science from Stanford University."
    );
    setJobLink("https://careers.stripe.com/positions/senior-fullstack-engineer/6834713");
    setJobDescription(
      "Stripe is looking for a Senior Fullstack Engineer to join our Payments team. You'll design and build APIs and UIs that power millions of businesses. Requirements: 5+ years experience, React, TypeScript, Node.js, PostgreSQL. Nice to have: AWS, leadership experience. We value clear communication and user empathy."
    );
    toast.success("Demo CV + job loaded! Scroll down and click Generate.");
  };

  const handleValidateLicense = async () => {
    if (!licenseKey.trim()) return;
    setLicenseChecking(true);
    try {
      const res = await fetch("/api/license/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ license_key: licenseKey.trim() }),
      });
      const data = await res.json();
      if (data.valid) {
        setLicenseValid(true);
        setRemaining(data.credits);
        toast.success(`License activated! ${data.credits} credits available.`);
      } else {
        setLicenseValid(false);
        toast.error(data.error || "Invalid license key");
      }
    } catch {
      toast.error("Failed to validate license");
    } finally {
      setLicenseChecking(false);
    }
  };

  const handleGenerate = async () => {
    if (!cv.trim()) {
      toast.error("Please paste your CV/resume");
      return;
    }
    if (!jobLink.trim() && !jobDescription.trim()) {
      toast.error("Please enter a job link or description");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const body = JSON.stringify({
        cv,
        jobDescription,
        licenseKey: licenseValid ? licenseKey.trim() : undefined,
        freshGraduateMode,
      });
      let res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });

      if (!res.ok && res.status !== 402) {
        try {
          const localRes = await fetch("http://localhost:3456/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body,
          });
          if (localRes.ok || localRes.status === 402) {
            res = localRes;
          }
        } catch {
          // Local API not running, continue with original response
        }
      }

      // Safe JSON parse – Safari throws "string did not match expected pattern" if body isn't JSON
      let data: any;
      try {
        const text = await res.text();
        data = JSON.parse(text);
      } catch {
        toast.error("Service temporarily unavailable. Please try again in a moment.");
        return;
      }

      if (res.status === 402) {
        const msg = data?.error || data?.message;
        toast.error(msg || "No credits remaining", {
          action: {
            label: "Upgrade $3",
            onClick: () =>
              document.getElementById("payment")?.scrollIntoView({ behavior: "smooth" }),
          },
        });
        setRemaining(0);
        return;
      }

      if (!res.ok) {
        toast.error(data?.error || data?.message || "Something went wrong");
        return;
      }

      if (!data?.data) {
        toast.error("Invalid response from server. Please try again.");
        return;
      }

      setResult(data.data);
      setRemaining(data.remaining);
      if (data.remaining === 0) {
        toast("Last free application used! Next ones are $3 each.", {
          icon: <Sparkles className="h-4 w-4" />,
        });
      } else {
        toast.success(`Generated! ${data.remaining} free applications left.`);
      }
    } catch (err: any) {
      // Safari DOMException doesn't always have .message
      const msg = err?.message || (err?.name === "SyntaxError" ? "Connection error. Please try again." : String(err || "Network error"));
      console.error("Generate error:", msg, err);
      toast.error(msg || "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "ApplyFast",
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            offers: { "@type": "Offer", price: "0", priceCurrency: "SAR" },
            description:
              "AI-powered job application generator for the Saudi and Gulf market. Bilingual Arabic/English, ATS-optimized, fills cover letters, custom questions, LinkedIn messages, and interview prep.",
            url: "https://applyfast-chi.vercel.app",
            inLanguage: ["ar-SA", "en-US"],
            author: { "@type": "Organization", name: "ApplyFast" },
          }),
        }}
      />
      <main className="min-h-screen bg-[#0a0f0e]">
      {/* Floating skip-to-form button — always visible */}
      <div className="fixed bottom-6 right-6 z-50 animate-fade-in-up" dir="ltr">
        <Button
          onClick={() =>
            document.getElementById("form-anchor")?.scrollIntoView({ behavior: "smooth" })
          }
          className="bg-emerald-500 hover:bg-emerald-400 text-[#0a0f0e] font-semibold px-5 py-3 rounded-xl shadow-lg shadow-emerald-500/30 transition-all hover:-translate-y-0.5"
        >
          <Zap className="h-4 w-4 mr-2" />
          {locale === 'ar' ? 'ابدأ التقديم' : 'Start Building'}
        </Button>
      </div>
      {/* ═══════════════════════════════════════════════ */}
      {/* SECTION 1: HERO */}
      {/* ═══════════════════════════════════════════════ */}
      <section className="relative overflow-hidden pt-24 pb-32 md:pt-32 md:pb-44">
        {/* Animated background blurs */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(16,185,129,0.10),transparent_60%)]" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-emerald-500/5 rounded-full blur-3xl animate-glow-pulse" />
        <div className="absolute top-40 right-[12%] w-80 h-80 bg-teal-500/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 left-[6%] w-56 h-56 bg-emerald-400/4 rounded-full blur-2xl animate-float" style={{ animationDelay: "2s" }} />

        <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
          {/* Badge */}
          <div className="animate-fade-in-up inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card border-emerald-500/20 text-emerald-400 text-sm mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            <span>{locale === "ar" ? "مساعد تقديم ذكي للوظائف — مصمم للسوق السعودي والخليجي 🇸🇦" : "AI Job Application Copilot — Built for Saudi & Gulf 🇸🇦"}</span>
          </div>
          {/* Anti-ChatGPT differentiator */}
          <p className="animate-fade-in-up delay-50 text-xs text-white/30 mb-8 max-w-xl mx-auto leading-relaxed">
            {locale === "ar"
              ? "ليس مجرد ChatGPT. يقرأ سيرتك الذاتية، يحلل متطلبات الوظيفة، يملأ كل حقل بدقة — غلاف وظيفي، أسئلة مخصصة، رسالة LinkedIn، تحضير مقابلة. كله بالعربي والإنجليزي."
              : "Not ChatGPT. Reads your CV, analyzes the job, fills every field. Cover letter, custom questions, LinkedIn message, interview prep — all in Arabic & English."}
          </p>

          {/* Headline */}
          <h1 className="animate-fade-in-up delay-100 text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.08]">
            {locale === "ar" ? (
              <>
                <span className="text-white">سيرتك الذاتية + رابط الوظيفة</span>
                <br />
                <span className="text-gradient-hero">= تقديم مخصص واحترافي</span>
              </>
            ) : (
              <>
                <span className="text-white">Fill Every Job Application</span>
                <br />
                <span className="text-gradient-hero">in 30 Seconds</span>
              </>
            )}
          </h1>

          {/* Subheadline */}
          <p className="animate-fade-in-up delay-200 text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-6 leading-relaxed">
            {locale === "ar"
              ? "لا تنسخ وتلصق إجابات عامة. اقرأ سيرتك الذاتية، ويحلّل الوظيفة، ويملأ كل الحقول بدقة — مما يوفر عليك "
              : "Stop copy-pasting generic answers. ApplyFast reads your CV, analyzes the job, and fills every field with precision \u2014 saving you "}
            <span className="text-emerald-400 font-semibold">
              {locale === "ar" ? "+٣٠ دقيقة لكل تقديم" : "30+ minutes per application"}
            </span>
            {locale === "ar" ? "." : "."}
          </p>

          {/* Quick value props — what gets generated */}
          <div className="animate-fade-in-up delay-250 flex flex-wrap items-center justify-center gap-2 mb-8">
            {[
              locale === "ar" ? "رسالة تغطية" : "Cover Letter",
              locale === "ar" ? "إجابات الأسئلة المخصصة" : "Custom Questions",
              locale === "ar" ? "رسالة لينكدإن" : "LinkedIn Message",
              locale === "ar" ? "تحضير المقابلة" : "Interview Prep",
            ].map((label, i) => (
              <span key={i} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/50">
                <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                {label}
              </span>
            ))}
          </div>

          {/* Trust badges */}
          <div className="animate-fade-in-up delay-300 flex items-center justify-center gap-6 mb-8 text-xs text-white/40">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />3 free/day
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />No signup
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />ATS-optimized
            </span>
          </div>

          {/* CTAs */}
          <div className="animate-fade-in-up delay-400 flex items-center justify-center gap-4">
            <Button
              onClick={() =>
                document.getElementById("form-anchor")?.scrollIntoView({ behavior: "smooth" })
              }
              className="bg-emerald-500 hover:bg-emerald-400 text-[#0a0f0e] font-semibold px-8 py-6 text-base rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:shadow-emerald-500/40 hover:-translate-y-0.5"
            >
              <Zap className="h-4 w-4 mr-2" />{locale === 'ar' ? 'ابدأ مجاناً' : 'Generate My Application'}
            </Button>
            <Button
              onClick={() => {
                loadDemo();
                setTimeout(
                  () =>
                    document
                      .getElementById("form-anchor")
                      ?.scrollIntoView({ behavior: "smooth" }),
                  300
                );
              }}
              variant="outline"
              className="border-white/10 bg-white/5 backdrop-blur-xl text-white hover:bg-white/10 hover:border-emerald-500/30 px-8 py-6 text-base rounded-xl transition-all"
            >
              <Sparkles className="h-4 w-4 mr-2" />{locale === 'ar' ? 'جرب العرض التجريبي' : 'Try Demo First'}
            </Button>
          </div>

          {/* Mini stats */}
          <div className="animate-fade-in-up delay-500 grid grid-cols-3 gap-4 max-w-md mx-auto mt-14">
            {[
              { value: locale === "ar" ? "+٣٠" : "30+", label: locale === "ar" ? "دقيقة موفرة" : "Minutes Saved" },
              { value: locale === "ar" ? "٣ مجاناً" : "3 Free", label: locale === "ar" ? "كل يوم" : "Every Day" },
              { value: locale === "ar" ? "١٠٠٪" : "100%", label: locale === "ar" ? "متوافقة مع ATS" : "ATS Compatible" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-white/40 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* SECTION 2: PROBLEM / SOLUTION */}
      {/* ═══════════════════════════════════════════════ */}
      <section className="py-20 md:py-28 border-t border-white/[0.04]">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {locale === "ar" ? (
                <>توقف عن الرفض بسبب <span className="text-gradient">التقديمات العامة</span></>
              ) : (
                <>Stop Getting Rejected for{" "}
              <span className="text-gradient">Generic Applications</span></>
              )}
            </h2>
            <p className="text-white/50 max-w-xl mx-auto">
              {locale === "ar"
                ? "مسؤولو التوظيف يميزون تقديم ChatGPT في ثوانٍ. لهذا ApplyFast يجلب لك المقابلات."
                : "Recruiters can spot a ChatGPT application in seconds. Here's why ApplyFast gets you interviews."}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Generic ChatGPT */}
            <div className="glass-card rounded-2xl p-6 border-red-500/10">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center mb-4">
                <X className="h-5 w-5 text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {locale === "ar" ? "ChatGPT العام" : "Generic ChatGPT"}
              </h3>
              <p className="text-sm text-white/40 mb-4">
                {locale === "ar" ? "انسخ وألصق الوصف الوظيفي في ChatGPT وادعُ." : "Copy-paste the JD into ChatGPT and pray."}
              </p>
              <ul className="space-y-2 text-sm text-white/50">
                {[
                  { en: "Sounds robotic", ar: "صوته آلي" },
                  { en: "No ATS keywords", ar: "بدون كلمات ATS" },
                  { en: "Fails screening", ar: "يفشل في الفلترة" },
                  { en: "Generic answers", ar: "إجابات عامة" },
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <X className="h-3.5 w-3.5 text-red-400 mt-0.5 flex-shrink-0" />
                    {locale === "ar" ? item.ar : item.en}
                  </li>
                ))}
              </ul>
            </div>

            {/* ApplyFast - highlighted */}
            <div className="glass-card rounded-2xl p-6 border-emerald-500/30 relative overflow-hidden scale-[1.03]">
              <div className="absolute top-0 right-0 bg-emerald-500 text-[#0a0f0e] text-xs font-bold px-3 py-1 rounded-bl-xl">
                {locale === "ar" ? "الأفضل" : "BEST"}
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center mb-4">
                <Sparkles className="h-5 w-5 text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">ApplyFast AI</h3>
              <p className="text-sm text-white/50 mb-4">
                {locale === "ar" ? "سيرة ذاتية + وصف وظيفي → كل الحقول، مخصصة ومتوافقة مع ATS." : "CV + JD → every field, personalized and ATS-optimized."}
              </p>
              <ul className="space-y-2 text-sm text-white/70">
                {[
                  { en: "Matches CV to JD", ar: "يطابق السيرة مع الوظيفة" },
                  { en: "ATS keyword scan", ar: "مسح كلمات ATS" },
                  { en: "Personalized tone", ar: "نغمة مخصصة" },
                  { en: "Interview prep included", ar: "تحضير مقابلة مضمّن" },
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                    {locale === "ar" ? item.ar : item.en}
                  </li>
                ))}
              </ul>
            </div>

            {/* Result */}
            <div className="glass-card rounded-2xl p-6 border-teal-500/10">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center mb-4">
                <Target className="h-5 w-5 text-teal-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {locale === "ar" ? "مقابلات عمل" : "Interview Calls"}
              </h3>
              <p className="text-sm text-white/40 mb-4">
                {locale === "ar" ? "تميز عن مئات المتقدمين." : "Stand out from hundreds of applicants."}
              </p>
              <ul className="space-y-2 text-sm text-white/50">
                {[
                  { en: "Recruiters notice you", ar: "مسؤولو التوظيف يلاحظونك" },
                  { en: "ATS passes your app", ar: "نظام ATS يمرر طلبك" },
                  { en: "More 1st round calls", ar: "مكالمات مقابلة أولى أكثر" },
                  { en: "Less ghosting", ar: "تجاهل أقل" },
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-teal-400 mt-0.5 flex-shrink-0" />
                    {locale === "ar" ? item.ar : item.en}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}

      {/* ═══════════════════════════════════════════════ */}
      {/* SECTION 3: BEFORE / AFTER */}
      {/* ═══════════════════════════════════════════════ */}
      <section className="py-20 md:py-28 border-t border-white/[0.04]">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              See the <span className="text-gradient">Difference</span>
            </h2>
            <p className="text-white/40 text-sm max-w-xl mx-auto">
              A real comparison — the same candidate, two different approaches.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Before */}
            <div className="glass-card rounded-2xl p-8 border-red-500/10 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500/40 to-red-500/10" />
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-semibold mb-6">
                <X className="w-3 h-3" /> Before ApplyFast
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-white/30 mb-1">Typical application:</p>
                  <p className="text-sm text-white/50 leading-relaxed">
                    &ldquo;I am applying for the software engineer position. I have experience with React and Node.js. I worked on several projects at my previous company. I am a hard worker and fast learner.&rdquo;
                  </p>
                </div>
                <div className="border-t border-white/5 pt-4">
                  <p className="text-xs text-white/30 mb-2">Problems:</p>
                  <ul className="space-y-1.5">
                    {["Generic — looks like everyone else","No ATS keywords matched","Skills not mapped to job requirements","Zero personalization"].map((p, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-white/40">
                        <X className="w-3 h-3 text-red-400 mt-0.5 flex-shrink-0" />{p}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* After */}
            <div className="glass-card rounded-2xl p-8 border-emerald-500/20 relative overflow-hidden bg-emerald-500/[0.02]">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-emerald-500/30" />
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold mb-6">
                <Sparkles className="w-3 h-3" /> After ApplyFast
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-white/30 mb-1">AI-tailored application:</p>
                  <p className="text-sm text-white/70 leading-relaxed">
                    &ldquo;Senior engineer with 6 years scaling web platforms to 2M+ users. Reduced API latency 40% at [Previous Co] using Redis caching and query optimization — directly applicable to Stripe&apos;s performance-critical payments infrastructure. Led 5-engineer migration from monolith to microservices, shipping ahead of schedule.&rdquo;
                  </p>
                </div>
                <div className="border-t border-emerald-500/10 pt-4">
                  <p className="text-xs text-emerald-400/70 mb-2">Results:</p>
                  <ul className="space-y-1.5">
                    {["ATS keywords from the actual job post","Skills mapped to each requirement","Real metrics (40% latency, 2M users)","Personalized to company & role"].map((p, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-emerald-300/60">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400 mt-0.5 flex-shrink-0" />{p}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: HOW IT WORKS */}
      {/* ═══════════════════════════════════════════════ */}
      <section className="py-20 md:py-28 border-t border-white/[0.04]">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {locale === 'ar' ? (
                <>كيف <span className="text-gradient">يعمل؟</span></>
              ) : (
                <>How It <span className="text-gradient">Works</span></>
              )}
            </h2>
            <p className="text-white/50 max-w-xl mx-auto">
              {locale === 'ar'
                ? 'ثلاث خطوات بسيطة. بدون تسجيل. بدون بطاقة ائتمان.'
                : 'Three simple steps. No signup. No credit card.'}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: FileText,
                title: locale === 'ar' ? 'ألصق سيرتك الذاتية' : 'Paste Your CV',
                desc: locale === 'ar'
                  ? 'ضع سيرتك الذاتية أو ملفك على لينكدإن. نحلل كل شيء — المهارات، الخبرات، التعليم، الإنجازات.'
                  : 'Drop in your resume or LinkedIn profile. We parse everything — skills, experience, education, achievements.',
              },
              {
                step: "02",
                icon: Link,
                title: locale === 'ar' ? 'أضف رابط الوظيفة' : 'Add Job Link',
                desc: locale === 'ar'
                  ? 'ألصق أي رابط وظيفة أو وصف. نحلل الدور، الشركة، المتطلبات، والكلمات المفتاحية لنظام ATS.'
                  : 'Paste any job URL or description. We analyze the role, company, requirements, and ATS keywords.',
              },
              {
                step: "03",
                icon: SendHorizonal,
                title: locale === 'ar' ? 'احصل على كل الحقول' : 'Get Every Field',
                desc: locale === 'ar'
                  ? 'الذكاء الاصطناعي يملأ كل حقل في التقديم. انسخ وألصق في Workday أو Greenhouse أو Lever — أي منصة.'
                  : 'AI fills in every application field. Copy-paste into Workday, Greenhouse, Lever — any ATS.',
              },
            ].map((item, i) => {
              const IconComp = item.icon;
              return (
                <div key={i} className="glass-card-hover rounded-2xl p-8 text-center group">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-6 group-hover:bg-emerald-500/15 transition-colors">
                    <IconComp className="h-6 w-6 text-emerald-400" />
                  </div>
                  <p className="text-xs font-bold text-white/20 mb-2">{item.step}</p>
                  <h3 className="text-lg font-semibold text-white mb-3">{item.title}</h3>
                  <p className="text-sm text-white/50 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* SOCIAL PROOF */}
      {/* ═══════════════════════════════════════════════ */}
      <section className="py-20 md:py-28 border-t border-white/[0.04]">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold text-emerald-400 uppercase tracking-widest mb-3">
              Trusted by job seekers
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Across <span className="text-gradient">Saudi Arabia & the Gulf</span>
            </h2>
            <p className="text-white/50 max-w-xl mx-auto text-sm">
              From Aramco to NEOM — job seekers across the Kingdom are landing interviews faster.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-14">
            {[
              { value: "2,400+", label: "Applications Generated" },
              { value: "3 Free", label: "Every Single Day" },
              { value: "30 min", label: "Saved per Application" },
            ].map((stat, i) => (
              <div key={i} className="glass-card rounded-xl p-6 text-center">
                <p className="text-2xl md:text-3xl font-bold text-gradient mb-1">{stat.value}</p>
                <p className="text-xs text-white/40">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Testimonials */}
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote:
                  "Got my first interview call from Aramco within a week. ApplyFast helped me tailor my answers to every requirement in the JD — something I never had time to do manually.",
                name: "محمد الشمري",
                role: "Mechanical Engineer · Riyadh",
                stars: 5,
              },
              {
                quote:
                  "I applied to STC, stc pay, and NEOM in one afternoon. The ATS keyword analysis alone is worth every riyal. My application pass rate jumped immediately.",
                name: "Fatima Al-Zahrani",
                role: "Data Analyst · Jeddah",
                stars: 5,
              },
              {
                quote:
                  "The Arabic CV support is seamless. It understands Gulf market requirements in a way no other tool does. The cover letter output was genuinely impressive.",
                name: "Ahmed Al-Qahtani",
                role: "Project Manager · Al Khobar",
                stars: 5,
              },
            ].map((t, i) => (
              <div key={i} className="glass-card rounded-2xl p-6 flex flex-col">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <Star key={j} className="h-3.5 w-3.5 text-emerald-400 fill-emerald-400" />
                  ))}
                </div>
                <p className="text-sm text-white/60 leading-relaxed mb-5 flex-1">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div>
                  <p className="text-sm font-semibold text-white">{t.name}</p>
                  <p className="text-xs text-white/30 mt-0.5">{t.role}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Trust badges */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-white/30">
            {[
              { label: "No CV stored", ar: "لا نحفظ السيرة الذاتية" },
              { label: "No account required", ar: "لا حساب مطلوب" },
              { label: "Arabic & English", ar: "عربي وإنجليزي" },
              { label: "PDPL compliant", ar: "متوافق مع PDPL" },
              { label: "Halal & ethical — no interest, honest AI", ar: "حلال وأخلاقي — لا ربا، ذكاء اصطناعي صادق" },
            ].map((badge, i) => (
              <span key={i} className="flex items-center gap-1.5" title={badge.label}>
                <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                {locale === "ar" && badge.ar ? badge.ar : badge.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* SECTION 5: WHAT MAKES US DIFFERENT */}
      {/* ═══════════════════════════════════════════════ */}
      <section className="py-20 md:py-28 border-t border-white/[0.04]">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {locale === "ar" ? (
                <>ما يميزنا عن <span className="text-gradient">البقية</span></>
              ) : (
                <>What Makes Us <span className="text-gradient">Different</span></>
              )}
            </h2>
            <p className="text-white/50 max-w-xl mx-auto">
              {locale === "ar"
                ? "ChatGPT غير متخصص. ApplyFast مبني لشيء واحد: حصولك على الوظيفة."
                : "ChatGPT is generic. ApplyFast is built for one thing: getting you hired."}
            </p>
          </div>

          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="grid grid-cols-3 border-b border-white/5">
              <div className="p-5">
                <p className="text-xs text-white/30 uppercase tracking-wider font-semibold">
                  {locale === "ar" ? "الميزة" : "Feature"}
                </p>
              </div>
              <div className="p-5 text-center">
                <p className="text-xs text-white/30 uppercase tracking-wider font-semibold">
                  {locale === "ar" ? "ChatGPT مجاني" : "ChatGPT Free"}
                </p>
              </div>
              <div className="p-5 text-center bg-emerald-500/[0.04]">
                <p className="text-xs text-emerald-400 uppercase tracking-wider font-semibold">ApplyFast</p>
              </div>
            </div>

            {[
              { en: "ATS Score Analysis", ar: "تحليل نقاط ATS" },
              { en: "Company Deep Research", ar: "بحث معمق عن الشركة" },
              { en: "Sniper Bullets", ar: "نقاط سريعة تجذب" },
              { en: "Arabic Support", ar: "دعم اللغة العربية" },
              { en: "4 Output Tones", ar: "٤ أنماط للإخراج" },
              { en: "Interview Prep", ar: "تحضير المقابلة" },
              { en: "Experience Mapping", ar: "مطابقة الخبرات" },
              { en: "Multi-CV Manager", ar: "إدارة سير متعددة" },
            ].map((feature, i) => (
              <div key={i} className={`grid grid-cols-3 ${i % 2 === 0 ? "bg-white/[0.01]" : ""}`}>
                <div className="p-4 text-sm text-white/70">
                  {locale === "ar" ? feature.ar : feature.en}
                </div>
                <div className="p-4 flex justify-center items-center">
                  <X className="h-4 w-4 text-red-400/40" />
                </div>
                <div className="p-4 flex justify-center items-center bg-emerald-500/[0.03]">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* SECTION 6: FEATURES GRID */}
      {/* ═══════════════════════════════════════════════ */}
      <section className="py-20 md:py-28 border-t border-white/[0.04]">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {locale === "ar" ? (
                <>قدرات <span className="text-gradient">تقديمك الخارقة</span></>
              ) : (
                <>Your Application <span className="text-gradient">Superpowers</span></>
              )}
            </h2>
            <p className="text-white/50 max-w-xl mx-auto">
              {locale === "ar"
                ? "كل ما تحتاجه للتغلب على نظام ATS وإبهار مسؤولي التوظيف."
                : "Everything you need to beat the ATS and impress recruiters."}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Target, en: "ATS Keywords", ar: "كلمات ATS المفتاحية", descEn: "Extract and match keywords that ATS systems scan for.", descAr: "استخرج وطابق الكلمات المفتاحية التي تبحث عنها أنظمة ATS." },
              { icon: Gauge, en: "Match Score", ar: "نسبة التطابق", descEn: "See exactly how well your CV matches the job before applying.", descAr: "اعرف بالضبط مدى تطابق سيرتك الذاتية مع الوظيفة قبل التقديم." },
              { icon: Building2, en: "Company Deep Dive", ar: "بحث معمق عن الشركة", descEn: "Get company size, tech stack, funding, culture insights.", descAr: "احصل على حجم الشركة، التقنيات، التمويل، والثقافة." },
              { icon: ArrowRight, en: "Experience Mapper", ar: "مطابقة الخبرات", descEn: "Your experience automatically mapped to each requirement.", descAr: "خبراتك تُطابق تلقائياً مع كل متطلب." },
              { icon: Target, en: "Sniper Bullets", ar: "نقاط سريعة", descEn: "Recruiters scan in 5 seconds — make them stop and read.", descAr: "مسؤولو التوظيف يمسحون في ٥ ثوانٍ — اجعلهم يتوقفون ويقرؤون." },
              { icon: HelpCircle, en: "Interview Prep", ar: "تحضير المقابلة", descEn: "Role-specific questions with hints built from your CV.", descAr: "أسئلة مخصصة للدور مع تلميحات من سيرتك الذاتية." },
              { icon: Globe, en: "Arabic Support", ar: "دعم اللغة العربية", descEn: "Full bilingual output — English and Arabic, same quality.", descAr: "إخراج ثنائي اللغة كامل — إنجليزي وعربي، نفس الجودة." },
              { icon: Layers, en: "Multi-CV Manager", ar: "إدارة سير متعددة", descEn: "Save multiple CVs, switch between them instantly.", descAr: "احفظ سيراً ذاتية متعددة وتنقل بينها فوراً." },
            ].map((feat, i) => {
              const Icon = feat.icon;
              return (
                <div key={i} className="glass-card-hover rounded-xl p-6">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-4">
                    <Icon className="h-[18px] w-[18px] text-emerald-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-white mb-2">
                    {locale === "ar" ? feat.ar : feat.en}
                  </h3>
                  <p className="text-xs text-white/40 leading-relaxed">
                    {locale === "ar" ? feat.descAr : feat.descEn}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* SECTION 7: DEMO */}
      {/* ═══════════════════════════════════════════════ */}
      <section className="py-20 md:py-28 border-t border-white/[0.04]">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="glass-card rounded-3xl p-10 md:p-14 border-emerald-500/10">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
              <Sparkles className="h-7 w-7 text-emerald-400" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              {locale === "ar" ? (
                <>شاهدها <span className="text-gradient">بالفيديو</span></>
              ) : (
                <>See It In <span className="text-gradient">Action</span></>
              )}
            </h2>
            <p className="text-white/50 mb-8 max-w-md mx-auto">
              {locale === "ar"
                ? "سنملأ سيرة ذاتية حقيقية ووصف وظيفي مسبقاً لتشاهد المخرجات الكاملة في ثوانٍ."
                : "We'll prefill a real CV and job description so you can see the full output in seconds."}
            </p>
            <Button
              onClick={() => {
                loadDemo();
                setTimeout(
                  () =>
                    document
                      .getElementById("form-anchor")
                      ?.scrollIntoView({ behavior: "smooth" }),
                  300
                );
              }}
              className="bg-emerald-500 hover:bg-emerald-400 text-[#0a0f0e] font-semibold px-8 py-6 text-base rounded-xl shadow-lg shadow-emerald-500/20"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {locale === "ar" ? "جرب العرض التجريبي — مجاناً" : "Try Demo — It's Free"}
            </Button>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      
      {/* ═══════════════════════════════════════════════ */}
      {/* PRIVACY SHIELD */}
      {/* ═══════════════════════════════════════════════ */}
      <section className="py-20 md:py-28 border-t border-white/[0.04]">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
              <svg className="w-7 h-7 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Your Data is <span className="text-gradient">Safe</span>
            </h2>
            <p className="text-white/40 text-sm max-w-xl mx-auto">
              We take privacy seriously. Here&apos;s exactly how we handle your information.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                title: "CV is Never Stored",
                desc: "Your CV is sent to AI for processing and discarded immediately. We don't save it, archive it, or train on it. It passes through and is gone.",
                icon: "🗑️",
              },
              {
                title: "No Account Required",
                desc: "Use ApplyFast without creating an account. No signup, no email required, no password to remember. Just paste and generate.",
                icon: "🔓",
              },
              {
                title: "No Data Sharing",
                desc: "We never sell, share, or monetize your data. Not to recruiters, not to third parties, not to anyone. Your job search is your business.",
                icon: "🔒",
              },
              {
                title: "Secure Processing",
                desc: "All CV-to-AI requests are encrypted in transit (HTTPS). API keys are never exposed to the browser. Processing happens server-side only.",
                icon: "🛡️",
              },
            ].map((item, i) => (
              <div key={i} className="glass-card rounded-xl p-5 flex gap-4">
                <div className="text-2xl flex-shrink-0 mt-0.5">{item.icon}</div>
                <div>
                  <h3 className="text-sm font-semibold text-white mb-1">{item.title}</h3>
                  <p className="text-xs text-white/40 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

{/* SECTION 8: PRICING (SAR — Saudi Riyal) */}
      {/* ═══════════════════════════════════════════════ */}
      <PricingSection locale={locale} />

      {/* ═══════════════════════════════════════════════ */}
      {/* SECTION 9: FAQ */}
      {/* ═══════════════════════════════════════════════ */}
      <section className="py-20 md:py-28 border-t border-white/[0.04]">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {locale === "ar" ? (
                <>أسئلة <span className="text-gradient">شائعة</span></>
              ) : (
                <>Frequently Asked <span className="text-gradient">Questions</span></>
              )}
            </h2>
          </div>

          <div className="space-y-3">
            {[
              {
                q: "How does ApplyFast work?",
                qAr: "كيف يعمل ApplyFast؟",
                a: "Paste your CV and job link (or description). Our AI reads both, extracts your info, and generates every application field — from basic info to cover letter intro and strengths. Then just copy-paste each field into any job portal.",
                aAr: "ألصق سيرتك الذاتية ورابط الوظيفة (أو وصفها). الذكاء الاصطناعي يقرأ كلاهما، يستخرج معلوماتك، وينتج كل حقل تقديم — من المعلومات الأساسية إلى مقدمة رسالة التغطية ونقاط القوة. بعدها انسخ وألصق كل حقل في أي بوابة توظيف.",
              },
              {
                q: "Is my CV stored or saved?",
                qAr: "هل تُحفظ سيرتي الذاتية؟",
                a: "No. Your CV is sent to the AI provider for processing and discarded immediately after the response is generated. We don't store, archive, log, or train on your CV data. It passes through and is gone.",
                aAr: "لا. سيرتك الذاتية تُرسل لمزود الذكاء الاصطناعي للمعالجة وتُحذف فوراً بعد توليد الرد. لا نخزن، لا نؤرشف، لا نسجل، ولا ندرب على بيانات سيرتك الذاتية. تمر وتنتهي.",
              },
              {
                q: "Does ApplyFast guarantee I'll get the job?",
                qAr: "هل يضمن ApplyFast حصولي على الوظيفة؟",
                a: "No — and anyone who promises that is being dishonest. ApplyFast creates tailored, professional applications that significantly improve your chances, but hiring decisions depend on many factors: your actual experience, the competition, the interviewer, and timing.",
                aAr: "لا — وأي شخص يعد بذلك غير صادق. ApplyFast ينشئ تقديمات مخصصة واحترافية تحسن فرصك بشكل كبير، لكن قرارات التوظيف تعتمد على عوامل كثيرة: خبراتك الفعلية، المنافسة، الشخص الذي يجري المقابلة، والتوقيت.",
              },
              {
                q: "Does it work in Arabic and English?",
                qAr: "هل يعمل بالعربي والإنجليزي؟",
                a: "Yes! ApplyFast is Arabic-first — you can paste an Arabic CV and get output in both English and Arabic. Built specifically for the Saudi and Gulf job market, with full bilingual support.",
                aAr: "نعم! ApplyFast عربي أولاً — يمكنك لصق سيرة ذاتية بالعربي والحصول على مخرجات بالإنجليزي والعربي. مبني خصيصاً لسوق العمل السعودي والخليجي، مع دعم ثنائي اللغة كامل.",
              },
              {
                q: "Is ApplyFast suitable for the Saudi/Gulf market?",
                qAr: "هل ApplyFast مناسب للسوق السعودي والخليجي؟",
                a: "Absolutely. We built ApplyFast specifically for this region. It understands Saudi companies, job titles common in the Gulf, bilingual CVs, and ATS systems used by employers here like SAP SuccessFactors, Oracle, and Bayt.com.",
                aAr: "بالتأكيد. بنينا ApplyFast خصيصاً لهذه المنطقة. يفهم الشركات السعودية، المسميات الوظيفية الشائعة في الخليج، السير الذاتية ثنائية اللغة، وأنظمة ATS المستخدمة هنا مثل SAP SuccessFactors وOracle وبيت.كوم.",
              },
              {
                q: "What happens if the AI fails or is slow?",
                qAr: "ماذا يحدث إذا فشل الذكاء الاصطناعي أو كان بطيئاً؟",
                a: "We use multiple AI providers for reliability. If the primary provider is unavailable, we automatically fall back to a backup provider. If all providers are down, we show a clear message — never a raw error. Your credits are never consumed on failed attempts.",
                aAr: "نستخدم عدة مزودي ذكاء اصطناعي للموثوقية. إذا كان المزود الرئيسي غير متاح، ننتقل تلقائياً لمزود احتياطي. إذا تعطل الجميع، نعرض رسالة واضحة — لا نعرض أخطاء تقنية. رصيدك لا يُستهلك في المحاولات الفاشلة.",
              },
              {
                q: "How many free applications do I get?",
                qAr: "كم طلب مجاني أحصل عليه؟",
                a: "3 completely free applications per day. No signup, no credit card required. After your daily limit, it's 9 SAR for a 5-pack (save 40%) or 79 SAR/month for unlimited applications.",
                aAr: "٣ طلبات مجانية بالكامل يومياً. بدون تسجيل، بدون بطاقة ائتمانية. بعد الحد اليومي، الباقة ٩ ر.س لـ ٥ طلبات (وفر 40%) أو ٧٩ ر.س شهرياً لطلبات غير محدودة.",
              },
              {
                q: "How do I pay?",
                qAr: "كيف أدفع؟",
                a: "Send the amount to our IBAN (STC Bank). Once we receive your payment, we'll email you credits. We're working on automated payment — this is a one-person project, so bear with us!",
                aAr: "حوّل المبلغ إلى رقم الآيبان (بنك STC). بمجرد استلام دفعتك، سنرسل لك الرصيد عبر البريد الإلكتروني. نعمل على الدفع الآلي — هذا مشروع شخص واحد، فتحملونا!",
              },
              {
                q: "Can I get a refund?",
                a: "If the AI output doesn't match your CV or you're unsatisfied, reply to the payment email and we'll refund within 24 hours. No questions asked.",
              },
              {
                q: "How is this different from ChatGPT?",
                a: "ChatGPT gives you generic text. ApplyFast is purpose-built — it extracts ATS keywords, scores your match, maps your experience to each job requirement, and gives you interview prep. It's a specialized tool, not a general chatbot.",
              },
              {
                q: "What platforms does this work with?",
                a: "All of them. ApplyFast generates text answers you manually paste — no browser automation. That means it works with Workday, Greenhouse, Lever, BambooHR, and any custom ATS without violating any terms of service.",
              },
            ].map((item, i) => (
              <details key={i} className="glass-card rounded-xl group">
                <summary className="p-5 cursor-pointer list-none flex items-center justify-between text-white font-medium text-sm">
                  {locale === "ar" && item.qAr ? item.qAr : item.q}
                  <ChevronDown className="h-4 w-4 text-white/30 group-open:rotate-180 transition-transform flex-shrink-0 ml-2" />
                </summary>
                <div className="px-5 pb-5">
                  <p className="text-sm text-white/50 leading-relaxed">
                    {locale === "ar" && item.aAr ? item.aAr : item.a}
                  </p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* FOOTER */}
      {/* ═══════════════════════════════════════════════ */}
      <footer className="border-t border-white/[0.04] py-8">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/30">
            &copy; {new Date().getFullYear()} ApplyFast AI · {locale === "ar" ? "مبني للباحثين عن عمل" : "Built for job seekers"} ·
            {locale === "ar" ? "حلال وأخلاقي — لا ربا، تسعير شفاف، ذكاء اصطناعي صادق" : "Halal & ethical — no interest, transparent pricing, honest AI"}
          </p>
          <div className="flex items-center gap-6 text-xs text-white/30">
            <a href="/privacy" className="hover:text-emerald-400 transition-colors">
              Privacy
            </a>
            <a href="/terms" className="hover:text-emerald-400 transition-colors">
              Terms
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-emerald-400 transition-colors"
            >
              Twitter
            </a>
          </div>
        </div>
      </footer>

      {/* ═══════════════════════════════════════════════ */}
      {/* DIVIDER */}
      {/* ═══════════════════════════════════════════════ */}
      <div className="max-w-5xl mx-auto px-4 pb-8">
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
          <span className="text-xs text-white/20 flex-shrink-0">Start Building Your Application Below</span>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
        </div>
      </div>

      {/* ═══════════════════════════════════════════════ */}
      {/* FORM ANCHOR */}
      {/* ═══════════════════════════════════════════════ */}
      <div id="form-anchor" />

      {/* ═══════════════════════════════════════════════ */}
      {/* FORM */}
      {/* ═══════════════════════════════════════════════ */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card className="p-6 glass-card rounded-2xl">
          {/* Locale toggle */}
          <div className="flex justify-end mb-4">
            <div className="flex rounded-lg overflow-hidden border border-white/10 text-xs">
              <button
                onClick={() => setLocale("en")}
                className={`px-3 py-1.5 transition-colors ${locale === "en" ? "bg-emerald-500/20 text-emerald-400" : "text-white/40 hover:text-white/60"}`}
              >
                EN
              </button>
              <button
                onClick={() => setLocale("ar")}
                className={`px-3 py-1.5 transition-colors ${locale === "ar" ? "bg-emerald-500/20 text-emerald-400" : "text-white/40 hover:text-white/60"}`}
              >
                AR
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                {locale === "ar" ? "سيرتك الذاتية" : "Your CV / Resume"}
              </label>
              <Textarea
                placeholder={locale === "ar" ? "الصق سيرتك الذاتية هنا..." : "Paste your full CV here..."}
                className="min-h-[250px] bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl resize-y"
                value={cv}
                onChange={(e) => setCv(e.target.value)}
              />
              <p className="text-xs text-white/30 mt-1.5 flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                بياناتك تُرسل للمعالجة فقط ولا تُخزّن أبداً
              </p>
              {cv.trim().length > 50 && (
                <CvReviewStep cvText={cv} onCvChange={setCv} locale={locale} />
              )}
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  {locale === "ar" ? "رابط الوظيفة" : "Job Posting URL"}
                </label>
                <Input
                  placeholder="https://jobs.lever.co/company/..."
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl"
                  value={jobLink}
                  onChange={(e) => setJobLink(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  {locale === "ar" ? "أو الصق وصف الوظيفة" : "Or paste job description"}
                </label>
                <Textarea
                  placeholder={locale === "ar" ? "الصق وصف الوظيفة مباشرة..." : "Paste the job description directly..."}
                  className="min-h-[150px] bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl resize-y"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                />
              </div>
              <FreshGraduateToggle
                value={freshGraduateMode}
                onChange={setFreshGraduateMode}
                locale={locale}
              />
              <Button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-[#0a0f0e] font-semibold py-6 text-base mt-auto rounded-xl transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    {locale === "ar" ? "جارٍ الإنشاء..." : "Generating..."}
                  </>
                ) : (
                  <>
                    <Zap className="h-5 w-5 mr-2" />
                    {locale === "ar" ? "أنشئ حزمة تقديمي" : "Fill My Application"}
                  </>
                )}
              </Button>
              <div className="flex items-center justify-between">
                <Button
                  onClick={() => {
                    loadDemo();
                  }}
                  variant="ghost"
                  className="text-white/40 hover:text-emerald-400 text-sm"
                >
                  <Sparkles className="h-3.5 w-3.5 mr-1" />{locale === "ar" ? "جرّب العرض" : "Try Demo"}
                </Button>
                {remaining !== null && (
                  <span className="text-xs">
                    {remaining > 0 ? (
                      <span className="text-emerald-400">
                        {locale === "ar" ? `${remaining} مجاني متبقٍ اليوم` : `${remaining} free left today`}
                      </span>
                    ) : (
                      <span className="text-amber-400">
                        {locale === "ar" ? "انتهت المجانية — ادفع للمتابعة" : "0 free today — pay per use"}
                      </span>
                    )}
                  </span>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* ═══════════════════════════════════════════════ */}
      {/* RESULTS */}
      {/* ═══════════════════════════════════════════════ */}
      {loading && (
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <Loader2 className="h-10 w-10 text-emerald-400 animate-spin mx-auto mb-6" />
          <p className="text-white text-lg font-semibold mb-3">
            {locale === 'ar' ? 'جارٍ إنشاء حزمة تقديمك...' : 'Building Your Application Pack...'}
          </p>
          <div className="max-w-sm mx-auto space-y-3">
            {[
              { step: locale === 'ar' ? 'تحليل الوظيفة واستخراج الكلمات المفتاحية' : 'Analyzing job & extracting ATS keywords', status: 'active' },
              { step: locale === 'ar' ? 'مطابقة خبراتك مع متطلبات الوظيفة' : 'Mapping your experience to job requirements', status: 'pending' },
              { step: locale === 'ar' ? 'إنشاء رسالة تغطية وأجوبة مخصصة' : 'Crafting cover letter & custom answers', status: 'pending' },
              { step: locale === 'ar' ? 'تحضير أسئلة المقابلة' : 'Preparing interview questions', status: 'pending' },
            ].map((item, i) => (
              <div key={i} className={`flex items-center gap-3 text-sm ${i === 0 ? 'text-white/60' : 'text-white/25'}`}>
                {i === 0 ? (
                  <Loader2 className="h-3.5 w-3.5 text-emerald-400 animate-spin flex-shrink-0" />
                ) : (
                  <div className="h-3.5 w-3.5 rounded-full border border-white/10 flex-shrink-0" />
                )}
                <span className="text-left">{item.step}</span>
              </div>
            ))}
          </div>
          <p className="text-white/20 text-xs mt-8">
            {locale === 'ar' ? 'يستغرق عادةً ١٥-٣٠ ثانية' : 'Usually takes 15-30 seconds'}
          </p>
        </div>
      )}

      {result && (
        <div
          ref={resultRef}
          className="max-w-4xl mx-auto px-4 pb-12 animate-fade-in-up"
        >
          <h2 className="text-2xl font-bold text-white mb-6">
            {locale === "ar" ? "حزمة تقديمك" : "Your Application Pack"}
          </h2>
          <ApplicationPack data={result} locale={locale} />
        </div>
      )}

      {/* ═══════════════════════════════════════════════ */}
      {/* PAYMENT SECTION */}
      {/* ═══════════════════════════════════════════════ */}
      <div id="payment" className="max-w-2xl mx-auto px-4 pb-24 pt-8 border-t border-white/[0.04]">
        <Card className="p-8 glass-card rounded-2xl text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm mb-4">
            ⚡ {locale === "ar" ? "برو" : "Pro"}
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">
            {locale === "ar" ? "طلبات غير محدودة" : "Unlimited Applications"}
          </h3>
          <p className="text-white/50 mb-2">
            {locale === "ar" ? "٣ ر.س للطلب الواحد. ادفع مرة، استخدم مرة." : "SAR 3 per application. Pay once, use once."}
          </p>
          <p className="text-sm text-white/40 mb-6">
            {locale === "ar" ? "أو ٩ ر.س لـ ٥ طلبات (وفر 40%)" : "Or SAR 9 for 5 applications (save 40%)"}
          </p>

          <div className="space-y-3 max-w-md mx-auto">
            <a
              href={`https://applyfast.lemonsqueezy.com/checkout?embed=1`}
              className="lemonsqueezy-button block p-4 glass-card rounded-xl cursor-pointer hover:border-emerald-500/30 transition-colors no-underline"
            >
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <p className="text-white font-semibold">
                    {locale === "ar" ? "طلب واحد" : "1 Application"}
                  </p>
                  <p className="text-sm text-white/40">SAR 3.00</p>
                </div>
                <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  {locale === "ar" ? "مرة واحدة" : "One-time"}
                </span>
              </div>
            </a>

            <a
              href="https://applyfast.lemonsqueezy.com/checkout?embed=1"
              className="lemonsqueezy-button block p-4 glass-card rounded-xl cursor-pointer hover:border-emerald-500/30 transition-colors relative overflow-hidden no-underline"
            >
              <div className="absolute top-0 right-0 bg-emerald-500 text-[#0a0f0e] text-xs font-bold px-2 py-0.5 rounded-bl-lg">
                {locale === "ar" ? "الأفضل قيمة" : "Best Value"}
              </div>
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <p className="text-white font-semibold">
                    {locale === "ar" ? "٥ طلبات" : "5 Applications"}
                  </p>
                  <p className="text-sm text-white/40">
                    <span className="text-emerald-400 font-semibold">SAR 9.00</span>{" "}
                    <span className="line-through text-white/30">SAR 15.00</span>
                  </p>
                </div>
                <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  {locale === "ar" ? "وفر 40%" : "Save 40%"}
                </span>
              </div>
            </a>
          </div>

          <div className="mt-8 p-4 bg-white/[0.03] rounded-xl border border-white/5">
            <p className="text-sm text-white/40 mb-3">
              {locale === "ar" ? "اشتريت مسبقاً؟ ألصق رمز الترخيص:" : "Already purchased? Paste your license key:"}
            </p>
            <div className="flex gap-2">
              <Input
                value={licenseKey}
                onChange={(e) => {
                  setLicenseKey(e.target.value);
                  setLicenseValid(false);
                }}
                onKeyDown={(e) => { if (e.key === "Enter") handleValidateLicense(); }}
                placeholder="Paste license key here..."
                className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-white/20"
              />
              <Button
                onClick={handleValidateLicense}
                disabled={licenseChecking || !licenseKey.trim()}
                className="bg-emerald-600 hover:bg-emerald-500 text-white"
              >
                {licenseChecking ? <Loader2 className="w-4 h-4 animate-spin" /> : "Activate"}
              </Button>
            </div>
            {licenseValid && (
              <p className="text-sm text-emerald-400 mt-2 flex items-center gap-1 justify-center">
                <CheckCircle2 className="w-3 h-3" />
                {locale === "ar"
                  ? `الترخيص مفعّل — ${remaining !== null ? `${remaining} رصيد متبقي` : "غير محدود"}`
                  : `License active — ${remaining !== null ? `${remaining} credits remaining` : "Unlimited"}`}
              </p>
            )}
          </div>

          <p className="text-xs text-white/25 mt-4">
            Powered by Lemon Squeezy · Secure checkout · Instant delivery
          </p>
        </Card>
      </div>
    </main>
    </>
  );
}
