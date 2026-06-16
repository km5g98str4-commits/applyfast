"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

type Question = {
  question: string;
  hint: string;
};

type Props = {
  questions: Question[];
  locale?: "en" | "ar";
};

export default function InterviewPrep({ questions, locale = "en" }: Props) {
  const [open, setOpen] = useState<number | null>(null);

  if (!questions.length) return null;

  return (
    <div className="glass-card rounded-2xl p-6" dir={locale === "ar" ? "rtl" : "ltr"}>
      <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wider mb-4">
        {locale === "ar" ? "التحضير للمقابلة" : "Interview Prep"}
      </h3>
      <div className="space-y-2">
        {questions.map((q, i) => (
          <div key={i} className="rounded-xl border border-white/[0.06] overflow-hidden">
            <button
              className="w-full text-start p-4 flex items-center justify-between gap-3 text-sm text-white/70 hover:text-white hover:bg-white/[0.02] transition-colors"
              onClick={() => setOpen(open === i ? null : i)}
            >
              <span className="flex-1">
                {i + 1}. {q.question}
              </span>
              <ChevronDown
                className={`h-4 w-4 flex-shrink-0 text-white/30 transition-transform ${open === i ? "rotate-180" : ""}`}
              />
            </button>
            {open === i && (
              <div className="px-4 pb-4">
                <p className="text-xs text-white/30 mb-1">
                  {locale === "ar" ? "تلميح:" : "Hint:"}
                </p>
                <p className="text-sm text-emerald-400/80 leading-relaxed">{q.hint}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
