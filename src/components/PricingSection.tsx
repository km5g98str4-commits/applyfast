"use client";

/**
 * PricingSection — SAR pricing with locale awareness
 * Phase 3C: Replace USD pricing with SAR (19/39/79)
 * Updated: graceful payment disable when Lemon Squeezy not configured
 */

import { Check, Clock, Copy, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface PricingSectionProps {
  locale?: "en" | "ar";
}

// Feature flag — set to true once Lemon Squeezy is fully configured
const PAYMENT_LIVE = false;

const IBAN = "SA6478000000001065324365";
const IBAN_BANK = "STC Bank";

export default function PricingSection({ locale = "en" }: PricingSectionProps) {
  const isAr = locale === "ar";
  const [ibanCopied, setIbanCopied] = useState(false);

  const copyIban = async () => {
    try {
      await navigator.clipboard.writeText(IBAN);
      setIbanCopied(true);
      setTimeout(() => setIbanCopied(false), 2500);
    } catch {
      // fallback — user can manually copy
    }
  };

  const content = {
    title: isAr ? "أسعار بسيطة وشفافة" : "Simple, Transparent Pricing",
    subtitle: isAr
      ? "ابدأ مجاناً. ادفع فقط لما تحتاج أكثر."
      : "Start free. Pay only when you need more.",
    free: {
      title: isAr ? "مجاني" : "Free",
      price: "0",
      period: isAr ? "للأبد" : "forever",
      features: [
        isAr ? "3 طلبات مجانية يومياً" : "3 free applications daily",
        isAr ? "تحليل ATS كامل" : "Full ATS analysis",
        isAr ? "Cover letter بالعربي والإنجليزي" : "Bilingual cover letters",
        isAr ? "أسئلة مقابلات مخصصة" : "Custom interview questions",
        isAr ? "تحليل السوق السعودي" : "Saudi market analysis",
      ],
      cta: isAr ? "ابدأ مجاناً" : "Start Free",
    },
    pack: {
      title: isAr ? "باقة 5 طلبات" : "5-Pack",
      price: "9",
      period: isAr ? "مرة وحدة" : "one-time",
      savings: isAr ? "وفر 40%" : "Save 40%",
      features: [
        isAr ? "كل شي في الباقة المجانية" : "Everything in Free",
        isAr ? "5 طلبات كاملة" : "5 complete applications",
        isAr ? "بدون حد يومي" : "No daily limit",
        isAr ? "الرصيد ما ينتهي" : "Credits never expire",
        isAr ? "دعم بالعربي" : "Arabic support",
      ],
      cta: isAr ? "9.00 ر.س" : "SAR 9.00",
    },
    monthly: {
      title: isAr ? "شهري غير محدود" : "Monthly Unlimited",
      price: "79",
      period: isAr ? "شهرياً" : "/month",
      badge: isAr ? "الأكثر قيمة" : "Best Value",
      features: [
        isAr ? "كل شي في باقة 5 طلبات" : "Everything in 5-Pack",
        isAr ? "طلبات غير محدودة" : "Unlimited applications",
        isAr ? "تعديل السيرة الذاتية" : "CV editing & optimization",
        isAr ? "حفظ سير متعددة" : "Multi-CV manager",
        isAr ? "دعم شخصي بالعربي" : "Personal Arabic support",
        isAr ? "الوصول المبكر للمزايا الجديدة" : "Early access to new features",
      ],
      cta: isAr ? "79.00 ر.س / شهرياً" : "SAR 79.00/month",
    },
    comingSoonLabel: isAr ? "الدفع الإلكتروني قريباً" : "Online Payments Coming Soon",
    comingSoonDesc: isAr
      ? "نعمل على تجهيز الدفع الإلكتروني عبر مدى و Apple Pay. حالياً، التقبل الدفع عبر التحويل البنكي."
      : "We're setting up online payments via Mada & Apple Pay. Currently accepting bank transfers.",
    ibanLabel: isAr ? "رقم الآيبان" : "IBAN",
    ibanHint: isAr
      ? "حوّل المبلغ وأرسل تأكيد التحويل. بنرسل لك رصيدك خلال ساعة."
      : "Transfer the amount and send us the confirmation. We'll credit you within an hour.",
    copied: isAr ? "تم النسخ ✓" : "Copied ✓",
    clickToCopy: isAr ? "اضغط للنسخ" : "Click to copy",
    footer: isAr
      ? "🔒 جميع الأسعار بالريال السعودي. الدفع عبر مدى، Apple Pay، والبطاقات الائتمانية. إلغاء في أي وقت."
      : "🔒 All prices in Saudi Riyal. Pay with Mada, Apple Pay, or credit cards. Cancel anytime.",
    trustNote: isAr
      ? "٣ طلبات مجانية يومياً. بدون تسجيل، بدون بطاقة ائتمانية."
      : "3 free applications every day. No signup. No credit card.",
  };

  return (
    <section id="pricing" className="py-20 md:py-28 border-t border-white/[0.04]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8" dir={isAr ? "rtl" : "ltr"}>
        <div className="text-center mb-12">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-4">
            {content.trustNote}
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            {content.title.split(" ").map((word, i) => (
              <span key={i} className={i >= 2 ? "text-gradient" : ""}>
                {word}{i < content.title.split(" ").length - 1 ? " " : ""}
              </span>
            ))}
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            {content.subtitle}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {/* Free Tier */}
          <PricingCard
            {...content.free}
            cta={
              <Button
                variant="outline"
                className="w-full"
                size="lg"
                onClick={() => {
                  document.getElementById("generate")?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                {content.free.cta}
              </Button>
            }
          />

          {/* 5-Pack */}
          <PricingCard
            {...content.pack}
            highlight
            cta={
              PAYMENT_LIVE ? (
                <Button className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600" size="lg">
                  {content.pack.cta}
                </Button>
              ) : (
                <ComingSoonButton locale={locale} />
              )
            }
          />

          {/* Monthly */}
          <PricingCard
            {...content.monthly}
            cta={
              PAYMENT_LIVE ? (
                <Button variant="outline" className="w-full" size="lg">
                  {content.monthly.cta}
                </Button>
              ) : (
                <ComingSoonButton locale={locale} />
              )
            }
          />
        </div>

        {/* IBAN Section — show when payments aren't live yet */}
        {!PAYMENT_LIVE && (
          <div className="mt-10 max-w-lg mx-auto">
            <div className="glass-card rounded-xl p-5 border-amber-500/10">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-semibold text-amber-400">
                  {content.comingSoonLabel}
                </span>
              </div>
              <p className="text-xs text-white/50 mb-4">
                {content.comingSoonDesc}
              </p>
              <div className="flex items-center gap-3">
                <span className="text-xs text-white/30">{content.ibanLabel}:</span>
                <button
                  onClick={copyIban}
                  className="flex items-center gap-2 text-sm font-mono text-white/80 bg-white/5 hover:bg-white/10 rounded-lg px-3 py-2 transition-colors"
                  title={content.clickToCopy}
                >
                  {IBAN}
                  {ibanCopied ? (
                    <CheckCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-white/30 flex-shrink-0" />
                  )}
                </button>
              </div>
              <p className="text-xs text-white/30 mt-3">{content.ibanHint}</p>
            </div>
          </div>
        )}

        <p className="text-center text-sm text-muted-foreground mt-10">
          {content.footer}
        </p>
      </div>
    </section>
  );
}

function ComingSoonButton({ locale }: { locale?: "en" | "ar" }) {
  const isAr = locale === "ar";
  return (
    <Button
      disabled
      variant="outline"
      className="w-full opacity-60 cursor-not-allowed"
      size="lg"
    >
      <Clock className="w-4 h-4 mr-2" />
      {isAr ? "الدفع قريباً" : "Payments Coming Soon"}
    </Button>
  );
}

function PricingCard({
  title,
  price,
  period,
  savings,
  badge,
  features,
  cta,
  highlight = false,
}: {
  title: string;
  price: string;
  period: string;
  savings?: string;
  badge?: string;
  features: string[];
  cta: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div
      className={`relative rounded-2xl p-6 flex flex-col ${
        highlight
          ? "border-2 border-emerald-500/30 bg-emerald-500/[0.03] shadow-lg shadow-emerald-500/5"
          : "border border-white/[0.06] bg-white/[0.02]"
      }`}
    >
      {badge && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500 text-white">
          {badge}
        </span>
      )}

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-1">{title}</h3>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold">{price}</span>
          <span className="text-sm text-muted-foreground">ر.س</span>
          <span className="text-sm text-muted-foreground ml-1">{period}</span>
        </div>
        {savings && (
          <p className="text-xs text-emerald-400 mt-1">{savings}</p>
        )}
      </div>

      <ul className="space-y-3 mb-8 flex-1">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
            <Check className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
            {f}
          </li>
        ))}
      </ul>

      {cta}
    </div>
  );
}
