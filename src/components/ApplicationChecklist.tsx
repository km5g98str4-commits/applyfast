"use client";

import { useState } from "react";

type Props = {
  locale?: "en" | "ar";
};

const ITEMS = [
  { id: "review_cover",    en: "Review cover letter",        ar: "مراجعة رسالة التقديم" },
  { id: "check_keywords",  en: "Check for missing keywords", ar: "التحقق من الكلمات المفتاحية المفقودة" },
  { id: "verify_contact",  en: "Verify contact info",        ar: "التحقق من معلومات الاتصال" },
  { id: "save_pdf",        en: "Save as PDF",                ar: "الحفظ كملف PDF" },
  { id: "apply_website",   en: "Apply on company website",   ar: "التقديم على موقع الشركة" },
] as const;

export default function ApplicationChecklist({ locale = "en" }: Props) {
  const [checked, setChecked] = useState<Partial<Record<string, boolean>>>({});

  const toggle = (id: string) =>
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));

  const doneCount = Object.values(checked).filter(Boolean).length;

  return (
    <div className="glass-card rounded-2xl p-6" dir={locale === "ar" ? "rtl" : "ltr"}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wider">
          {locale === "ar" ? "قائمة مراجعة التقديم" : "Application Checklist"}
        </h3>
        <span className="text-xs text-white/30">
          {locale === "ar"
            ? `${doneCount} من ${ITEMS.length} مكتمل`
            : `${doneCount} of ${ITEMS.length} complete`}
        </span>
      </div>

      <div className="space-y-1">
        {ITEMS.map((item) => {
          const isChecked = !!checked[item.id];
          return (
            <button
              key={item.id}
              onClick={() => toggle(item.id)}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.02] transition-colors text-start group"
            >
              <div
                className={`w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 transition-colors ${
                  isChecked
                    ? "bg-emerald-500 border-emerald-500"
                    : "border-white/20 group-hover:border-emerald-500/40"
                }`}
              >
                {isChecked && (
                  <svg className="w-3 h-3 text-[#0a0f0e]" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M2 6l3 3 5-5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
              <span
                className={`text-sm transition-colors ${
                  isChecked ? "text-white/30 line-through" : "text-white/60"
                }`}
              >
                {locale === "ar" ? item.ar : item.en}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
