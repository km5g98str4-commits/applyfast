"use client";

import { useState } from "react";
import { Copy, CheckCircle2 } from "lucide-react";

type Props = {
  message: string;
  locale?: "en" | "ar";
};

export default function LinkedInMessage({ message, locale = "en" }: Props) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="glass-card rounded-2xl p-6" dir={locale === "ar" ? "rtl" : "ltr"}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wider">
          {locale === "ar" ? "رسالة لينكدإن للمُجنّد" : "LinkedIn Recruiter Message"}
        </h3>
        <button
          onClick={copy}
          className="flex items-center gap-1 text-xs text-white/40 hover:text-emerald-400 transition-colors"
        >
          {copied
            ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            : <Copy className="h-3.5 w-3.5" />}
          {locale === "ar" ? (copied ? "تم النسخ" : "نسخ") : (copied ? "Copied!" : "Copy")}
        </button>
      </div>
      <p className="text-sm text-white/60 leading-relaxed whitespace-pre-wrap">{message}</p>
    </div>
  );
}
