"use client";

type Keyword = {
  keyword: string;
  importance: string;
  reframeSuggestion?: string;
};

type Props = {
  keywords: Keyword[];
  locale?: "en" | "ar";
};

function ImportanceBadge({ importance, locale }: { importance: string; locale: "en" | "ar" }) {
  const key = importance.toLowerCase();
  const map: Record<string, { className: string; en: string; ar: string }> = {
    high:   { className: "bg-red-500/10 border-red-500/20 text-red-400",       en: "High",   ar: "عالٍ" },
    medium: { className: "bg-yellow-500/10 border-yellow-500/20 text-yellow-400", en: "Medium", ar: "متوسط" },
    low:    { className: "bg-white/5 border-white/10 text-white/40",            en: "Low",    ar: "منخفض" },
  };
  const { className, en, ar } = map[key] ?? map.low;
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border ${className}`}>
      {locale === "ar" ? ar : en}
    </span>
  );
}

export default function MissingKeywords({ keywords, locale = "en" }: Props) {
  if (!keywords.length) return null;

  return (
    <div className="glass-card rounded-2xl p-6" dir={locale === "ar" ? "rtl" : "ltr"}>
      <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wider mb-4">
        {locale === "ar" ? "الكلمات المفتاحية المفقودة" : "Missing Keywords"}
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06]">
              <th className="text-start pb-3 text-xs text-white/30 font-medium pe-4">
                {locale === "ar" ? "الكلمة" : "Keyword"}
              </th>
              <th className="text-start pb-3 text-xs text-white/30 font-medium pe-4">
                {locale === "ar" ? "الأهمية" : "Importance"}
              </th>
              <th className="text-start pb-3 text-xs text-white/30 font-medium">
                {locale === "ar" ? "كيف تسدّ الفجوة" : "Suggested Bridge"}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {keywords.map((k, i) => (
              <tr key={i}>
                <td className="py-3 pe-4 text-white/70 font-medium whitespace-nowrap">{k.keyword}</td>
                <td className="py-3 pe-4">
                  <ImportanceBadge importance={k.importance} locale={locale} />
                </td>
                <td className="py-3 text-white/40 text-xs leading-relaxed">
                  {k.reframeSuggestion || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
