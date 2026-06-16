"use client";

type Props = {
  suggestions: string[];
  locale?: "en" | "ar";
};

export default function CvImprovements({ suggestions, locale = "en" }: Props) {
  if (!suggestions.length) return null;

  return (
    <div className="glass-card rounded-2xl p-6" dir={locale === "ar" ? "rtl" : "ltr"}>
      <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wider mb-4">
        {locale === "ar" ? "تحسينات السيرة الذاتية" : "CV Improvements"}
      </h3>
      <ol className="space-y-3">
        {suggestions.slice(0, 5).map((s, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-400 text-xs flex items-center justify-center font-bold">
              {i + 1}
            </span>
            <p className="text-sm text-white/60 leading-relaxed">{s}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
