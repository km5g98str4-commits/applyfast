"use client";

type Props = {
  confidence: "high" | "medium" | "low";
  locale?: "en" | "ar";
};

const CONFIG = {
  high: {
    icon: "✅",
    en: "Verified in CV",
    ar: "موثّق في السيرة الذاتية",
    className: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
  },
  medium: {
    icon: "⚠️",
    en: "Partially verified",
    ar: "موثّق جزئياً",
    className: "bg-yellow-500/10 border-yellow-500/20 text-yellow-400",
  },
  low: {
    icon: "🚩",
    en: "AI-generated — verify before using",
    ar: "مولّد بالذكاء الاصطناعي — تحقق قبل الاستخدام",
    className: "bg-red-500/10 border-red-500/20 text-red-400",
  },
};

export default function ConfidenceBadge({ confidence, locale = "en" }: Props) {
  const { icon, en, ar, className } = CONFIG[confidence];
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${className}`}>
      {icon} {locale === "ar" ? ar : en}
    </span>
  );
}
