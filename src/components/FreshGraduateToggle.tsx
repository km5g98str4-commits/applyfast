"use client";

type Props = {
  value: boolean;
  onChange: (v: boolean) => void;
  locale?: "en" | "ar";
};

export default function FreshGraduateToggle({ value, onChange, locale = "en" }: Props) {
  return (
    <div
      dir={locale === "ar" ? "rtl" : "ltr"}
      className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] cursor-pointer select-none"
      onClick={() => onChange(!value)}
    >
      <div
        className={`relative flex-shrink-0 w-10 h-6 rounded-full transition-colors mt-0.5 ${value ? "bg-emerald-500" : "bg-white/10"}`}
      >
        <div
          className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${value ? "translate-x-5" : "translate-x-1"}`}
        />
      </div>
      <div>
        <p className="text-sm font-medium text-white">
          {locale === "ar" ? "أنا حديث/ة تخرج" : "I'm a Fresh Graduate"}
        </p>
        <p className="text-xs text-white/40 mt-0.5">
          {locale === "ar"
            ? "سيُركّز الذكاء الاصطناعي على مشاريعك الأكاديمية وتدريبك وإمكاناتك"
            : "AI will focus on academic projects, internships, and potential over years of experience"}
        </p>
      </div>
    </div>
  );
}
