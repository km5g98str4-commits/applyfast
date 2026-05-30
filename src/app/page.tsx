"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, Copy, Download, Sparkles, CheckCircle2 } from "lucide-react";

type GeneratedData = {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  currentTitle: string;
  yearsOfExperience: number;
  education: string;
  skills: string[];
  whyThisRole: string;
  coverLetterSnippet: string;
  strengths: string[];
  salaryExpectation: string;
  availableStartDate: string;
  workAuthorization: string;
};

const FIELDS: { key: keyof GeneratedData; label: string; icon?: string }[] = [
  { key: "fullName", label: "Full Name" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "location", label: "Location" },
  { key: "linkedin", label: "LinkedIn" },
  { key: "currentTitle", label: "Current Title" },
  { key: "yearsOfExperience", label: "Years of Experience" },
  { key: "education", label: "Education" },
  { key: "workAuthorization", label: "Work Authorization" },
  { key: "availableStartDate", label: "Available Start Date" },
  { key: "salaryExpectation", label: "Salary Expectation" },
];

export default function Home() {
  const [cv, setCv] = useState("");
  const [jobLink, setJobLink] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GeneratedData | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const handleGenerate = async () => {
    if (!cv.trim()) {
      toast.error("Please paste your CV/resume");
      return;
    }
    if (!jobLink.trim() && !jobDescription.trim()) {
      toast.error("Please enter a job link or description");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // Try Vercel API first, fallback to local API
      const body = JSON.stringify({ cv, jobLink, jobDescription });
      let res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });

      // If Vercel API fails (no keys), try local API
      if (!res.ok && res.status !== 402) {
        try {
          const localRes = await fetch("http://localhost:3456/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body,
          });
          if (localRes.ok || localRes.status === 402) {
            res = localRes;
          }
        } catch {
          // Local API not running, continue with original response
        }
      }

      const data = await res.json();

      if (res.status === 402) {
        toast.error(data.message, {
          action: {
            label: "Upgrade $3",
            onClick: () =>
              document.getElementById("payment")?.scrollIntoView({ behavior: "smooth" }),
          },
        });
        setRemaining(0);
        return;
      }

      if (!res.ok) {
        toast.error(data.error || "Something went wrong");
        return;
      }

      setResult(data.data);
      setRemaining(data.remaining);
      if (data.remaining === 0) {
        toast("Last free application used! Next ones are $3 each.", {
          icon: <Sparkles className="h-4 w-4" />,
        });
      } else {
        toast.success(`Generated! ${data.remaining} free applications left.`);
      }
    } catch (err) {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyAll = () => {
    if (!result) return;
    const text = FIELDS.map(
      (f) =>
        `${f.label}: ${
          Array.isArray(result[f.key])
            ? (result[f.key] as string[]).join(", ")
            : result[f.key]
        }`
    ).join("\n");
    navigator.clipboard.writeText(
      text +
        `\n\nWhy This Role: ${result.whyThisRole}\n\nCover Letter:\n${result.coverLetterSnippet}\n\nStrengths: ${result.strengths?.join(", ")}`
    );
    toast.success("Copied all fields!");
  };

  const copyField = (key: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent" />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            AI-Powered
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight">
            Apply<span className="text-emerald-400">Fast</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-xl mx-auto mb-2">
            Paste your CV + job link. Get every application field filled
            instantly.
          </p>
          <p className="text-sm text-slate-500 mb-8">
            Save 30+ minutes per job application. 3 free per day.
          </p>
          <div className="flex items-center justify-center gap-6 text-sm text-slate-500">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Workday
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Greenhouse
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Lever
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              All ATS
            </span>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 py-12" id="form">
        <Card className="p-6 bg-slate-900/50 border-slate-800 backdrop-blur">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                📄 Your CV / Resume
              </label>
              <Textarea
                placeholder="Paste your full CV or resume here..."
                className="min-h-[250px] bg-slate-950 border-slate-700 text-slate-200 placeholder:text-slate-600 resize-y"
                value={cv}
                onChange={(e) => setCv(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  🔗 Job Posting URL
                </label>
                <Input
                  placeholder="https://jobs.lever.co/company/..."
                  className="bg-slate-950 border-slate-700 text-slate-200 placeholder:text-slate-600"
                  value={jobLink}
                  onChange={(e) => setJobLink(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  📋 Or paste job description
                </label>
                <Textarea
                  placeholder="Paste the job description directly..."
                  className="min-h-[150px] bg-slate-950 border-slate-700 text-slate-200 placeholder:text-slate-600 resize-y"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                />
              </div>
              <Button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-6 text-lg mt-auto"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 mr-2" />
                    Fill My Application
                  </>
                )}
              </Button>
              {remaining !== null && remaining > 0 && (
                <p className="text-xs text-center text-slate-500">
                  {remaining} free generation{remaining !== 1 ? "s" : ""} left
                  today
                </p>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Results */}
      {result && (
        <div
          ref={resultRef}
          className="max-w-4xl mx-auto px-4 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">
              Your Auto-Filled Application
            </h2>
            <Button
              variant="outline"
              onClick={copyAll}
              className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy All
            </Button>
          </div>

          {/* Core fields */}
          <Card className="p-6 bg-slate-900/50 border-slate-800 mb-6">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
              Basic Information
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {FIELDS.map(({ key, label }) => {
                const val = result[key];
                const displayVal = Array.isArray(val) ? val.join(", ") : String(val ?? "");
                if (!displayVal || displayVal === "N/A") return null;
                return (
                  <div key={key} className="group relative">
                    <label className="block text-xs text-slate-500 mb-1">
                      {label}
                    </label>
                    <div className="flex items-center gap-2">
                      <p className="text-slate-200 text-sm">{displayVal}</p>
                      <button
                        onClick={() => copyField(key, displayVal)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-emerald-400"
                      >
                        {copied === key ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Skills */}
          <Card className="p-6 bg-slate-900/50 border-slate-800 mb-6">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
              Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {result.skills?.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </Card>

          {/* Why This Role */}
          <Card className="p-6 bg-slate-900/50 border-slate-800 mb-6">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
              Why This Role
            </h3>
            <p className="text-slate-200 leading-relaxed">{result.whyThisRole}</p>
            <button
              onClick={() => copyField("whyThisRole", result.whyThisRole)}
              className="mt-3 text-xs text-slate-500 hover:text-emerald-400 flex items-center gap-1"
            >
              {copied === "whyThisRole" ? (
                <CheckCircle2 className="h-3 w-3 text-emerald-400" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
              Copy
            </button>
          </Card>

          {/* Cover Letter Snippet */}
          <Card className="p-6 bg-slate-900/50 border-slate-800 mb-6">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
              Cover Letter Intro
            </h3>
            <p className="text-slate-200 leading-relaxed">
              {result.coverLetterSnippet}
            </p>
            <button
              onClick={() => copyField("coverLetter", result.coverLetterSnippet)}
              className="mt-3 text-xs text-slate-500 hover:text-emerald-400 flex items-center gap-1"
            >
              {copied === "coverLetter" ? (
                <CheckCircle2 className="h-3 w-3 text-emerald-400" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
              Copy
            </button>
          </Card>

          {/* Strengths */}
          <Card className="p-6 bg-slate-900/50 border-slate-800">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
              Top Strengths for This Role
            </h3>
            <ul className="space-y-2">
              {result.strengths?.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-slate-300">
                  <span className="text-emerald-400 mt-1">•</span>
                  {s}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}

      {/* Payment Section */}
      <div
        id="payment"
        className="max-w-2xl mx-auto px-4 pb-24 pt-8 border-t border-slate-800"
      >
        <Card className="p-8 bg-slate-900/50 border-slate-800 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm mb-4">
            ⚡ Pro
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">
            Unlimited Applications
          </h3>
          <p className="text-slate-400 mb-2">
            $3 per application. Pay once, use once.
          </p>
          <p className="text-sm text-slate-500 mb-6">
            Or $9 for 5 applications (save 40%)
          </p>

          <div className="space-y-3 max-w-md mx-auto">
            <Card className="p-4 bg-slate-800/50 border-slate-700 cursor-pointer hover:border-emerald-500/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <p className="text-white font-semibold">1 Application</p>
                  <p className="text-sm text-slate-400">$3.00</p>
                </div>
                <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  One-time
                </span>
              </div>
            </Card>

            <Card className="p-4 bg-slate-800/50 border-slate-700 cursor-pointer hover:border-emerald-500/50 transition-colors relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-emerald-600 text-white text-xs px-2 py-0.5 rounded-bl-lg">
                Best Value
              </div>
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <p className="text-white font-semibold">5 Applications</p>
                  <p className="text-sm text-slate-400">
                    <span className="text-emerald-400 font-semibold">$9.00</span>{" "}
                    <span className="line-through text-slate-600">$15.00</span>
                  </p>
                </div>
                <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  Save 40%
                </span>
              </div>
            </Card>
          </div>

          <div className="mt-8 p-4 bg-slate-800/30 rounded-lg border border-slate-700">
            <p className="text-sm text-slate-400 mb-2">To pay, send the amount via:</p>
            <div className="bg-slate-950 rounded-md p-3 font-mono text-slate-300 text-sm break-all select-all">
              IBAN: SA6478000000001065324365
            </div>
            <p className="text-xs text-slate-500 mt-2">
              STC Bank · After payment, email the receipt to activate your credits.
            </p>
          </div>
        </Card>

        {/* FAQ Section */}
        <div className="max-w-2xl mx-auto mt-16 pt-8 border-t border-slate-800">
          <h3 className="text-xl font-bold text-white text-center mb-8">
            Frequently Asked Questions
          </h3>
          <div className="space-y-4">
            {[
              {
                q: "How does this actually work?",
                a: "You paste your CV/resume and the job link or description. Our AI reads both, extracts your information, and fills every application field automatically — name, email, skills, 'Why this role?', cover letter intro, and more. You can copy-paste each field directly into any job portal.",
              },
              {
                q: "Which job platforms does this work with?",
                a: "All of them. ApplyFast generates text answers you manually paste into any form. Since it doesn't automate form filling (which could violate ToS), it works with Workday, Greenhouse, Lever, BambooHR, and any custom ATS.",
              },
              {
                q: "Is my CV data safe?",
                a: "Your CV is sent to DeepSeek AI for processing and never stored. We don't save, sell, or train on your data. Your information passes through and is gone immediately after generating your application fields.",
              },
              {
                q: "How many applications can I do for free?",
                a: "3 per day, completely free. No signup, no credit card. After that, it's $3 per application or $9 for 5 (save 40%).",
              },
              {
                q: "How do I pay?",
                a: "Send the amount to our IBAN (STC Bank). Once we receive your payment, we'll email you credits. We're working on automated payment — this is a one-person project, so bear with us!",
              },
              {
                q: "Can I get a refund?",
                a: "If the AI output doesn't match your CV or you're unsatisfied, reply to the payment email and we'll refund within 24 hours. No questions asked.",
              },
            ].map((item, i) => (
              <Card
                key={i}
                className="p-5 bg-slate-900/30 border-slate-800"
              >
                <h4 className="text-white font-medium mb-2 text-sm">
                  {item.q}
                </h4>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {item.a}
                </p>
              </Card>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div className="max-w-4xl mx-auto mt-16 pt-8 border-t border-slate-800">
          <h3 className="text-xl font-bold text-white text-center mb-8">
            How It Works
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: "1",
                title: "Paste Your CV",
                desc: "Copy your full resume or LinkedIn profile into the text area. The more detail, the better the output.",
                icon: "📄",
              },
              {
                step: "2",
                title: "Add Job Link",
                desc: "Paste the URL of the job posting (or the job description text). AI matches your skills to their requirements.",
                icon: "🔗",
              },
              {
                step: "3",
                title: "Get Fields",
                desc: "Click 'Fill My Application' and get every field generated instantly. Copy-paste into the form and submit!",
                icon: "⚡",
              },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl mb-3">{item.icon}</div>
                <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold mb-2">
                  {item.step}
                </div>
                <h4 className="text-white font-semibold mb-2">{item.title}</h4>
                <p className="text-slate-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-600 mt-16">
          © 2026 ApplyFast AI · Built for job seekers · Halal & ethical
        </p>
      </div>
    </main>
  );
}
