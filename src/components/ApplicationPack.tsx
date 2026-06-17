"use client";

import { useState, useCallback } from "react";
import { Copy, CheckCircle2 } from "lucide-react";
import JobMatchScore from "./JobMatchScore";
import CoverLetter from "./CoverLetter";
import InterviewPrep from "./InterviewPrep";
import MissingKeywords from "./MissingKeywords";
import CvImprovements from "./CvImprovements";
import LinkedInMessage from "./LinkedInMessage";
import ApplicationChecklist from "./ApplicationChecklist";
import ConfidenceBadge from "./ConfidenceBadge";

type SkillGap = { skill: string; criticality: string; learningPath: string };
type MissingKw = { keyword: string; reframeSuggestion?: string };
type InterviewQuestion = { question: string; hint: string };

export type ApplicationPackData = {
  fullName?: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  currentTitle?: string;
  yearsOfExperience?: number;
  education?: unknown;
  skills?: string[];
  whyThisRole?: string;
  whyThisRoleAr?: string;
  coverLetterSnippet?: string;
  coverLetterSnippetAr?: string;
  strengths?: string[];
  strengthsAr?: string[];
  salaryExpectation?: string;
  availableStartDate?: string;
  workAuthorization?: string;
  companyName?: string;
  roleTitle?: string;
  atsAnalysis?: {
    matchScore?: number;
    matchedKeywords?: string[];
    missingKeywords?: MissingKw[];
  };
  skillGaps?: SkillGap[];
  interviewPrep?: InterviewQuestion[];
  followUpEmail?: { subject: string; body: string };
  sniperBullets?: string[];
  _meta?: {
    confidence: Record<string, string>;
    fabricatedFields: string[];
  };
};

type Props = {
  data: ApplicationPackData;
  locale?: "en" | "ar";
};

function normalizeConfidence(val: unknown): "high" | "medium" | "low" {
  if (val === "high") return "high";
  if (val === "medium") return "medium";
  return "low";
}

function educationString(edu: unknown): string {
  if (!edu) return "";
  if (typeof edu === "string") return edu;
  if (Array.isArray(edu)) {
    return edu
      .map((e: Record<string, unknown>) =>
        [e.degree, e.school ? (typeof e.school === "string" ? e.school : "") : ""].filter(Boolean).join(" — ")
      )
      .filter(Boolean)
      .join(", ");
  }
  return "";
}

export default function ApplicationPack({ data, locale = "en" }: Props) {
  const [copied, setCopied] = useState<string | null>(null);
  const [allCopied, setAllCopied] = useState(false);

  const copyField = (key: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  const copyAllFields = useCallback(() => {
    const label = (en: string, ar: string) => (locale === "ar" ? ar : en);
    const parts: string[] = [];

    // Basic info
    BASIC_FIELDS.forEach(({ key, en, ar }) => {
      const val = data[key];
      const display = val != null ? String(val) : "";
      if (!display || ["N/A", "undefined", "unknown"].includes(display)) return;
      parts.push(`${label(en, ar)}: ${display}`);
    });

    // Education
    const eduStr = educationString(data.education);
    if (eduStr) parts.push(`${label("Education", "التعليم")}: ${eduStr}`);

    // Skills
    if (data.skills?.length) {
      parts.push(`${label("Skills", "المهارات")}: ${data.skills.join(", ")}`);
    }

    // Why this role
    const why = locale === "ar" && data.whyThisRoleAr ? data.whyThisRoleAr : data.whyThisRole;
    if (why) parts.push(`${label("Why This Role", "لماذا هذا الدور")}: ${why}`);

    // Strengths
    const strengths = locale === "ar" && data.strengthsAr?.length ? data.strengthsAr : (data.strengths ?? []);
    if (strengths.length) {
      parts.push(`${label("Strengths", "نقاط القوة")}:
${strengths.map((s) => `• ${s}`).join("\n")}`);
    }

    // Cover letter
    if (data.coverLetterSnippet) {
      const cvText = locale === "ar" && data.coverLetterSnippetAr ? data.coverLetterSnippetAr : data.coverLetterSnippet;
      parts.push(`${label("Cover Letter", "رسالة تغطية")}:
${cvText}`);
    }

    // LinkedIn
    if (data.followUpEmail?.body) {
      parts.push(`${label("LinkedIn Message", "رسالة لينكدإن")}:
${data.followUpEmail.body}`);
    }

    navigator.clipboard.writeText(parts.join("\n\n---\n\n"));
    setAllCopied(true);
    setTimeout(() => setAllCopied(false), 2000);
  }, [data, locale]);

  const matchScore = data.atsAnalysis?.matchScore ?? 0;

  const missingKeywords = (data.atsAnalysis?.missingKeywords ?? []).map((k) => ({
    keyword: k.keyword,
    importance: "medium",
    reframeSuggestion: k.reframeSuggestion,
  }));

  const cvImprovements = (data.skillGaps ?? []).slice(0, 5).map((g) =>
    locale === "ar"
      ? `طوّر مهارة: ${g.skill}${g.learningPath ? ` — ${g.learningPath}` : ""}`
      : `Develop skill: ${g.skill}${g.learningPath ? ` — ${g.learningPath}` : ""}`
  );

  const linkedInMessage =
    data.followUpEmail?.body ??
    (locale === "ar"
      ? `مرحباً،\n\nأنا ${data.fullName || ""} وأعمل كـ${data.currentTitle || ""}. اطلعت على فرصة ${data.roleTitle || ""} في ${data.companyName || ""} وأنا مهتم جداً بها.\n\nأودّ التواصل معكم للحديث عن الفرصة.\n\nمع التحية`
      : `Hi,\n\nI'm ${data.fullName || ""}, currently working as ${data.currentTitle || ""}. I came across the ${data.roleTitle || ""} opportunity at ${data.companyName || ""} and I'm very interested.\n\nI'd love to connect and discuss the role.\n\nBest regards`);

  const strengths =
    locale === "ar" && data.strengthsAr?.length ? data.strengthsAr : (data.strengths ?? []);

  const eduStr = educationString(data.education);
  const confidence = data._meta?.confidence ?? {};

  const BASIC_FIELDS: { key: keyof ApplicationPackData; en: string; ar: string }[] = [
    { key: "fullName",           en: "Full Name",            ar: "الاسم الكامل" },
    { key: "email",              en: "Email",                ar: "البريد الإلكتروني" },
    { key: "phone",              en: "Phone",                ar: "رقم الجوال" },
    { key: "location",           en: "Location",             ar: "الموقع" },
    { key: "linkedin",           en: "LinkedIn",             ar: "لينكدإن" },
    { key: "currentTitle",       en: "Current Title",        ar: "المسمى الوظيفي" },
    { key: "yearsOfExperience",  en: "Years of Experience",  ar: "سنوات الخبرة" },
    { key: "workAuthorization",  en: "Work Authorization",   ar: "تصريح العمل" },
    { key: "availableStartDate", en: "Available Start Date", ar: "تاريخ الانضمام" },
    { key: "salaryExpectation",  en: "Salary Expectation",   ar: "التوقعات المالية" },
  ];

  return (
    <div dir={locale === "ar" ? "rtl" : "ltr"} className="space-y-4">
      {/* Top Actions Bar */}
      <div className="flex justify-end gap-3">
        <button
          onClick={copyAllFields}
          className={`flex items-center gap-2 text-sm transition-all px-4 py-2 rounded-xl ${
            allCopied
              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
              : "text-white/80 hover:text-white bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 hover:border-emerald-500/40"
          }`}
        >
          {allCopied
            ? <CheckCircle2 className="h-4 w-4" />
            : <Copy className="h-4 w-4" />}
          {allCopied
            ? (locale === "ar" ? "تم نسخ الكل!" : "All Copied!")
            : (locale === "ar" ? "نسخ الكل" : "Copy All Fields")}
        </button>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 text-sm text-white/60 hover:text-emerald-400 border border-white/10 hover:border-emerald-500/30 px-4 py-2 rounded-xl transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 15V3m0 12l-4-4m4 4l4-4M2 17l.621 2.485A2 2 0 004.561 21h14.878a2 2 0 001.94-1.515L22 17" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {locale === "ar" ? "تنزيل PDF" : "Download PDF"}
        </button>
      </div>

      {/* Basic Information */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wider mb-4">
          {locale === "ar" ? "المعلومات الأساسية" : "Basic Information"}
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          {BASIC_FIELDS.map(({ key, en, ar }) => {
            const val = data[key];
            const display = val != null ? String(val) : "";
            if (!display || display === "N/A" || display === "undefined" || display === "unknown") return null;
            const fieldConf = normalizeConfidence(confidence[key === "fullName" ? "name" : key]);
            const isFlagged = data._meta?.fabricatedFields?.includes(key === "fullName" ? "name" : key);
            return (
              <div key={key} className="group">
                <label className="block text-xs text-white/30 mb-1">
                  {locale === "ar" ? ar : en}
                </label>
                <div className="flex items-center gap-2">
                  <p className="text-white/80 text-sm">{display}</p>
                  {isFlagged && (
                    <ConfidenceBadge confidence={fieldConf} locale={locale} />
                  )}
                  <button
                    onClick={() => copyField(key, display)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-white/30 hover:text-emerald-400"
                  >
                    {copied === key
                      ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
            );
          })}

          {/* Education (special handling) */}
          {eduStr && (
            <div className="group md:col-span-2">
              <label className="block text-xs text-white/30 mb-1">
                {locale === "ar" ? "التعليم" : "Education"}
              </label>
              <div className="flex items-center gap-2">
                <p className="text-white/80 text-sm">{eduStr}</p>
                <button
                  onClick={() => copyField("education", eduStr)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-white/30 hover:text-emerald-400"
                >
                  {copied === "education"
                    ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Skills */}
        {data.skills?.length ? (
          <div className="mt-4 pt-4 border-t border-white/[0.06]">
            <label className="block text-xs text-white/30 mb-2">
              {locale === "ar" ? "المهارات" : "Skills"}
            </label>
            <div className="flex flex-wrap gap-2">
              {data.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {/* Job Match Score */}
      <JobMatchScore score={matchScore} locale={locale} />

      {/* Why This Role */}
      {data.whyThisRole && (
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wider">
              {locale === "ar" ? "لماذا هذا الدور" : "Why This Role"}
            </h3>
            <button
              onClick={() => copyField("whyThisRole", locale === "ar" && data.whyThisRoleAr ? data.whyThisRoleAr : (data.whyThisRole ?? ""))}
              className="flex items-center gap-1 text-xs text-white/40 hover:text-emerald-400 transition-colors"
            >
              {copied === "whyThisRole"
                ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                : <Copy className="h-3.5 w-3.5" />}
              {locale === "ar" ? "نسخ" : "Copy"}
            </button>
          </div>
          <p className="text-white/60 leading-relaxed text-sm" dir={locale === "ar" && data.whyThisRoleAr ? "rtl" : "ltr"}>
            {locale === "ar" && data.whyThisRoleAr ? data.whyThisRoleAr : data.whyThisRole}
          </p>
        </div>
      )}

      {/* Strengths */}
      {strengths.length > 0 && (
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wider mb-4">
            {locale === "ar" ? "نقاط القوة لهذا الدور" : "Strengths for This Role"}
          </h3>
          <ul className="space-y-2">
            {strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-white/60 text-sm">
                <span className="text-emerald-400 mt-1 flex-shrink-0">•</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Missing Keywords */}
      {missingKeywords.length > 0 && (
        <MissingKeywords keywords={missingKeywords} locale={locale} />
      )}

      {/* Cover Letter */}
      {data.coverLetterSnippet && (
        <CoverLetter
          text={data.coverLetterSnippet}
          textAr={data.coverLetterSnippetAr}
          companyName={data.companyName ?? ""}
          locale={locale}
        />
      )}

      {/* CV Improvements */}
      {cvImprovements.length > 0 && (
        <CvImprovements suggestions={cvImprovements} locale={locale} />
      )}

      {/* Interview Prep */}
      {data.interviewPrep?.length ? (
        <InterviewPrep questions={data.interviewPrep} locale={locale} />
      ) : null}

      {/* LinkedIn Message */}
      <LinkedInMessage message={linkedInMessage} locale={locale} />

      {/* Application Checklist */}
      <ApplicationChecklist locale={locale} />
    </div>
  );
}
