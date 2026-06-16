"use client";

import { useState } from "react";
import { Copy, CheckCircle2 } from "lucide-react";

type Props = {
  text: string;
  textAr?: string;
  companyName: string;
  locale?: "en" | "ar";
};

export default function CoverLetter({ text, textAr, companyName: _companyName, locale = "en" }: Props) {
  const [copied, setCopied] = useState(false);
  const [showAr, setShowAr] = useState(locale === "ar" && !!textAr);

  const displayText = showAr && textAr ? textAr : text;
  const dir = showAr ? "rtl" : "ltr";

  const copy = () => {
    navigator.clipboard.writeText(displayText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="glass-card rounded-2xl p-6" dir={dir}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wider">
          {locale === "ar" ? "رسالة التقديم" : "Cover Letter"}
        </h3>
        <div className="flex items-center gap-2">
          {textAr && (
            <div className="flex rounded-lg overflow-hidden border border-white/10 text-xs">
              <button
                onClick={() => setShowAr(false)}
                className={`px-2 py-1 transition-colors ${!showAr ? "bg-emerald-500/20 text-emerald-400" : "text-white/40 hover:text-white/60"}`}
              >
                EN
              </button>
              <button
                onClick={() => setShowAr(true)}
                className={`px-2 py-1 transition-colors ${showAr ? "bg-emerald-500/20 text-emerald-400" : "text-white/40 hover:text-white/60"}`}
              >
                AR
              </button>
            </div>
          )}
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
      </div>
      <p className="text-white/60 text-sm leading-relaxed whitespace-pre-wrap">{displayText}</p>
    </div>
  );
}
