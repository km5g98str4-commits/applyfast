"use client";

/**
 * ConfidenceIndicator — Visual confidence badges for AI-generated content
 * Phase 3C: Show users what the AI verified vs. invented
 * 
 * Copy to: src/components/ConfidenceIndicator.tsx
 * Usage: <ConfidenceIndicator level="high" label="Email verified in CV" />
 */

import { Shield, ShieldAlert, ShieldCheck, ShieldQuestion } from "lucide-react";

type ConfidenceLevel = "high" | "medium" | "low" | "none" | null;

interface ConfidenceIndicatorProps {
  level: ConfidenceLevel;
  label?: string;
  compact?: boolean;
  className?: string;
}

const config: Record<string, { icon: React.ReactNode; color: string; bg: string; text: string; textAr: string }> = {
  high: {
    icon: <ShieldCheck className="w-3.5 h-3.5" />,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
    text: "Verified in CV",
    textAr: "موجود في السيرة",
  },
  medium: {
    icon: <Shield className="w-3.5 h-3.5" />,
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
    text: "Partially verified",
    textAr: "متحقق جزئياً",
  },
  low: {
    icon: <ShieldAlert className="w-3.5 h-3.5" />,
    color: "text-red-400",
    bg: "bg-red-500/10 border-red-500/20",
    text: "AI-generated — verify",
    textAr: "من الذكاء الاصطناعي — تأكد",
  },
  none: {
    icon: <ShieldQuestion className="w-3.5 h-3.5" />,
    color: "text-gray-400",
    bg: "bg-gray-500/10 border-gray-500/20",
    text: "Not verified",
    textAr: "غير متحقق",
  },
};

export default function ConfidenceIndicator({
  level,
  label,
  compact = false,
  className = "",
}: ConfidenceIndicatorProps) {
  // Allow passing a custom label or use default
  // Actually let's simplify and always use level-based labels
  // since this is for internal UI consistency
  
  if (!level || level === "none") {
    return null; // Don't show for unverified/none — reduce noise
  }

  const c = config[level];
  if (!c) return null;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${c.bg} ${c.color} ${className}`}
      title={label || c.text}
    >
      {c.icon}
      {!compact && <span className="hidden sm:inline">{c.text}</span>}
    </span>
  );
}

/**
 * ConfidenceBadgeRow — renders a row of badges for a section
 */
export function ConfidenceBadgeRow({
  confidence,
  locale = "en",
}: {
  confidence: Record<string, ConfidenceLevel>;
  locale?: "en" | "ar";
}) {
  const entries = Object.entries(confidence).filter(([, v]) => v && v !== "low");

  if (entries.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {entries.map(([key, level]) => (
        <ConfidenceIndicator key={key} level={level} compact />
      ))}
    </div>
  );
}

/**
 * FabricationWarning — shown when AI invented content
 */
export function FabricationWarning({
  fields,
  locale = "en",
}: {
  fields: string[];
  locale?: "en" | "ar";
}) {
  if (!fields || fields.length === 0) return null;

  const isAr = locale === "ar";

  return (
    <div className="rounded-lg border border-amber-500/20 bg-amber-500/[0.04] p-3 mt-3">
      <div className="flex items-start gap-2">
        <ShieldAlert className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
        <div className="text-xs">
          <p className="font-medium text-amber-400 mb-1">
            {isAr
              ? "⚠️ بعض المعلومات مولّدة آلياً — تأكد منها قبل الاستخدام:"
              : "⚠️ Some info was AI-generated — verify before using:"}
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-0.5">
            {fields.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
