"use client";

import { useState } from "react";

type Props = {
  cvText: string;
  onCvChange: (text: string) => void;
  locale?: "en" | "ar";
};

type Section = { label: string; labelAr: string; pattern: RegExp };

const SECTIONS: Section[] = [
  { label: "Education",   labelAr: "التعليم",   pattern: /education|degree|university|bachelor|master|phd|تعليم|جامعة|درجة|بكالوريوس|ماجستير/i },
  { label: "Experience",  labelAr: "الخبرة",    pattern: /experience|employment|work history|career|خبرة|عمل|مسيرة/i },
  { label: "Skills",      labelAr: "المهارات",  pattern: /skills|competencies|expertise|technologies|مهارات|كفاءات/i },
];

export default function CvReviewStep({ cvText, onCvChange, locale = "en" }: Props) {
  const [editing, setEditing] = useState(false);

  const wordCount = cvText.trim() ? cvText.trim().split(/\s+/).length : 0;
  const detected = SECTIONS.filter((s) => s.pattern.test(cvText));

  return (
    <div dir={locale === "ar" ? "rtl" : "ltr"} className="mt-3 rounded-xl bg-white/[0.03] border border-white/[0.06] p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-white/60">
          {locale === "ar" ? "مراجعة السيرة الذاتية" : "CV Review"}
        </h4>
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/30 bg-white/5 px-2 py-0.5 rounded-full">
            {wordCount} {locale === "ar" ? "كلمة" : "words"}
          </span>
          <button
            onClick={() => setEditing(!editing)}
            className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            {editing
              ? (locale === "ar" ? "تم" : "Done")
              : (locale === "ar" ? "تعديل النص" : "Edit CV Text")}
          </button>
        </div>
      </div>

      {detected.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          <span className="text-xs text-white/30">
            {locale === "ar" ? "الأقسام المكتشفة:" : "Sections detected:"}
          </span>
          {detected.map((s) => (
            <span
              key={s.label}
              className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
            >
              {locale === "ar" ? s.labelAr : s.label}
            </span>
          ))}
        </div>
      )}

      {wordCount > 0 && wordCount < 100 && (
        <p className="text-xs text-yellow-400/80 mb-2">
          ⚠️ {locale === "ar"
            ? "السيرة الذاتية قصيرة جداً — أضف المزيد للحصول على نتائج أفضل"
            : "CV is too short — add more content for better results"}
        </p>
      )}
      {wordCount > 2000 && (
        <p className="text-xs text-yellow-400/80 mb-2">
          ⚠️ {locale === "ar"
            ? "السيرة الذاتية طويلة جداً — قد يتم اقتطاع بعض المحتوى"
            : "CV is very long — some content may be truncated"}
        </p>
      )}

      {editing ? (
        <textarea
          value={cvText}
          onChange={(e) => onCvChange(e.target.value)}
          className="w-full h-48 bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white/80 resize-y focus:outline-none focus:border-emerald-500/50"
        />
      ) : (
        <div className="h-28 overflow-y-auto text-xs text-white/35 leading-relaxed whitespace-pre-wrap rounded-lg bg-white/[0.02] p-3 border border-white/[0.04]">
          {cvText.slice(0, 500)}{cvText.length > 500 ? "…" : ""}
        </div>
      )}
    </div>
  );
}
