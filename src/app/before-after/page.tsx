"use client";

/**
 * Before/After Page — Showcase ApplyFast results
 * Phase 3C: Demonstrate real AI-powered CV improvement
 * 
 * Copy to: src/app/before-after/page.tsx
 */

import { useState } from "react";
import { ArrowRight, Sparkles, CheckCircle, FileText } from "lucide-react";

const demos = [
  {
    id: "ats-score",
    titleEn: "ATS Match Score",
    titleAr: "نتيجة تطابق ATS",
    before: {
      labelEn: "Generic CV",
      labelAr: "سيرة عامة",
      text: "Submitted CV to 30+ jobs with no response. No keyword matching, no tailoring.",
    },
    after: {
      labelEn: "ApplyFast Optimized",
      labelAr: "بعد ApplyFast",
      text: "88% match score. 12 matched keywords identified. CV tailored for Nitaqat/Saudization.",
    },
    metric: { labelEn: "Match Score", labelAr: "نسبة التطابق", before: "N/A", after: "88%" },
  },
  {
    id: "keywords",
    titleEn: "Keyword Gap Analysis",
    titleAr: "تحليل فجوة الكلمات المفتاحية",
    before: {
      labelEn: "Before Analysis",
      labelAr: "قبل التحليل",
      text: "No visibility into ATS requirements. Missing 7 critical keywords.",
    },
    after: {
      labelEn: "After ApplyFast",
      labelAr: "بعد ApplyFast",
      text: "All 15 required keywords identified. Reframing suggestions for 7 gaps with Saudi market alternatives.",
    },
    metric: { labelEn: "Keywords Covered", labelAr: "كلمات مغطاة", before: "8/15", after: "15/15" },
  },
  {
    id: "interview",
    titleEn: "Interview Ready",
    titleAr: "جاهز للمقابلة",
    before: {
      labelEn: "Unprepared",
      labelAr: "غير مستعد",
      text: "Generic interview prep. No role-specific questions or insights.",
    },
    after: {
      labelEn: "ApplyFast Prep",
      labelAr: "تحضير ApplyFast",
      text: "5 custom interview questions with STAR answers. Company deep-dive. Saudi market context.",
    },
    metric: { labelEn: "Prep Questions", labelAr: "أسئلة تحضير", before: "0", after: "5 custom" },
  },
];

export default function BeforeAfterPage() {
  const [locale, setLocale] = useState<"en" | "ar">("en");
  const isAr = locale === "ar";

  return (
    <div className="min-h-screen" dir={isAr ? "rtl" : "ltr"}>
      {/* Locale Toggle */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={() => setLocale(locale === "en" ? "ar" : "en")}
          className="px-3 py-1.5 rounded-full text-xs font-medium bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.1] transition-colors"
        >
          {isAr ? "English" : "العربية"}
        </button>
      </div>

      {/* Hero */}
      <section className="py-20 md:py-28 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            {isAr ? "شاهد الفرق بنفسك" : "See the difference"}
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold mb-6 leading-tight">
            {isAr ? (
              <>
                من سيرة <span className="text-gradient">عامة</span> إلى طلب{" "}
                <span className="text-gradient">احترافي</span>
              </>
            ) : (
              <>
                From <span className="text-gradient">Generic</span> to{" "}
                <span className="text-gradient">Professional</span>
              </>
            )}
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            {isAr
              ? "أمثلة حقيقية لكيف تحوّل ApplyFast سيرتك الذاتية من مهملة إلى مستهدفة، بتحليل ATS كامل ومحتوى مخصص لكل وظيفة."
              : "Real examples of how ApplyFast transforms your CV from ignored to targeted, with full ATS analysis and job-specific content."}
          </p>
        </div>
      </section>

      {/* Before/After Cards */}
      <section className="pb-20 md:pb-28">
        <div className="max-w-5xl mx-auto px-4 space-y-12">
          {demos.map((demo) => (
            <div
              key={demo.id}
              className="rounded-2xl border border-white/[0.06] bg-white/[0.01] overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-white/[0.04] flex items-center justify-between">
                <h3 className="font-semibold text-lg">
                  {isAr ? demo.titleAr : demo.titleEn}
                </h3>
                <span className="text-xs text-muted-foreground bg-white/[0.03] px-2 py-1 rounded-full">
                  {isAr ? "قبل ← بعد" : "Before → After"}
                </span>
              </div>

              <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/[0.04]">
                {/* Before */}
                <div className="p-6 bg-red-500/[0.02]">
                  <span className="inline-block text-xs font-medium text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full mb-3">
                    {isAr ? demo.before.labelAr : demo.before.labelEn}
                  </span>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                    {demo.before.text}
                  </p>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">
                      {isAr ? demo.metric.labelAr : demo.metric.labelEn}:
                    </span>
                    <span className="font-mono text-red-400">{demo.metric.before}</span>
                  </div>
                </div>

                {/* After */}
                <div className="p-6 bg-emerald-500/[0.02] relative">
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full mb-3">
                    <CheckCircle className="w-3 h-3" />
                    {isAr ? demo.after.labelAr : demo.after.labelEn}
                  </span>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                    {demo.after.text}
                  </p>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">
                      {isAr ? demo.metric.labelAr : demo.metric.labelEn}:
                    </span>
                    <span className="font-mono text-emerald-400">{demo.metric.after}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-emerald-400 ml-1" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="pb-20 text-center">
        <div className="max-w-lg mx-auto px-4">
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.03] p-8">
            <FileText className="w-8 h-8 text-emerald-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {isAr ? "جرّبها بنفسك — مجاناً" : "Try it yourself — free"}
            </h3>
            <p className="text-muted-foreground text-sm mb-6">
              {isAr
                ? "ارفع سيرتك وجرّب 3 طلبات مجانية اليوم. بدون تسجيل، بدون التزام."
                : "Upload your CV and try 3 free applications today. No signup, no commitment."}
            </p>
            <a
              href="/"
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium px-6 py-3 rounded-xl transition-colors"
            >
              {isAr ? "ابدأ الآن" : "Start Now"}
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
