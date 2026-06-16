"use client";

type Breakdown = {
  skills: number;
  experience: number;
  education: number;
  language: number;
};

type Props = {
  score: number;
  breakdown?: Breakdown;
  locale?: "en" | "ar";
};

function getScoreColor(score: number) {
  if (score < 40) return { ring: "#ef4444", text: "text-red-400", bg: "bg-red-400" };
  if (score < 65) return { ring: "#eab308", text: "text-yellow-400", bg: "bg-yellow-400" };
  if (score < 85) return { ring: "#22c55e", text: "text-green-400", bg: "bg-green-400" };
  return { ring: "#10b981", text: "text-emerald-400", bg: "bg-emerald-400" };
}

export default function JobMatchScore({ score, breakdown, locale = "en" }: Props) {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const color = getScoreColor(clamped);
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  const labels: Record<keyof Breakdown, { en: string; ar: string }> = {
    skills:     { en: "Skills Match",     ar: "مطابقة المهارات" },
    experience: { en: "Experience Match", ar: "مطابقة الخبرة" },
    education:  { en: "Education Match",  ar: "مطابقة التعليم" },
    language:   { en: "Language Match",   ar: "مطابقة اللغة" },
  };

  return (
    <div className="glass-card rounded-2xl p-6" dir={locale === "ar" ? "rtl" : "ltr"}>
      <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wider mb-6">
        {locale === "ar" ? "نسبة التطابق مع الوظيفة" : "Job Match Score"}
      </h3>

      <div className="flex flex-col sm:flex-row items-center gap-8">
        {/* Circular score */}
        <div className="relative flex-shrink-0 w-36 h-36">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
            <circle
              cx="64" cy="64" r={radius}
              fill="none"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="12"
            />
            <circle
              cx="64" cy="64" r={radius}
              fill="none"
              stroke={color.ring}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              style={{ transition: "stroke-dashoffset 0.8s ease" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-3xl font-bold ${color.text}`}>{clamped}</span>
            <span className="text-xs text-white/40">/ 100</span>
          </div>
        </div>

        {/* Breakdown bars */}
        {breakdown && (
          <div className="flex-1 w-full space-y-3">
            {(Object.keys(labels) as (keyof Breakdown)[]).map((key) => {
              const val = Math.max(0, Math.min(100, breakdown[key]));
              const c = getScoreColor(val);
              return (
                <div key={key}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-white/50">
                      {locale === "ar" ? labels[key].ar : labels[key].en}
                    </span>
                    <span className={c.text}>{val}%</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${c.bg} rounded-full transition-all duration-700`}
                      style={{ width: `${val}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <p className="text-xs text-white/25 mt-6 italic">
        {locale === "ar"
          ? "تقدير بالذكاء الاصطناعي — ليس نتيجة ATS رسمية. استخدمه كمرشد."
          : "AI-generated estimate — not an official ATS score. Use as a guide."}
      </p>
    </div>
  );
}
