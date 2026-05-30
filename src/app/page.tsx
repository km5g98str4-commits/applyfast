"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Loader2,
  Copy,
  Sparkles,
  CheckCircle2,
  Zap,
  Target,
  Gauge,
  Building2,
  ArrowRight,
  HelpCircle,
  Globe,
  Layers,
  FileText,
  Link,
  SendHorizonal,
  ChevronDown,
  X,
  TrendingUp,
  Star,
} from "lucide-react";

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

  const loadDemo = () => {
    setCv(
      "Senior Software Engineer with 6 years of experience building scalable web applications. Proficient in React, TypeScript, Node.js, and PostgreSQL. Led a team of 5 engineers to deliver a customer-facing platform serving 2M+ users. Reduced latency by 40% through API optimization. AWS certified. B.Sc. Computer Science from Stanford University."
    );
    setJobLink("https://careers.stripe.com/positions/senior-fullstack-engineer/6834713");
    setJobDescription(
      "Stripe is looking for a Senior Fullstack Engineer to join our Payments team. You'll design and build APIs and UIs that power millions of businesses. Requirements: 5+ years experience, React, TypeScript, Node.js, PostgreSQL. Nice to have: AWS, leadership experience. We value clear communication and user empathy."
    );
    toast.success("Demo CV + job loaded! Scroll down and click Generate.");
  };

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
      const body = JSON.stringify({ cv, jobLink, jobDescription });
      let res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });

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
    <main className="min-h-screen bg-[#0a0f0e]">
      {/* ═══════════════════════════════════════════════ */}
      {/* SECTION 1: HERO */}
      {/* ═══════════════════════════════════════════════ */}
      <section className="relative overflow-hidden pt-24 pb-32 md:pt-32 md:pb-44">
        {/* Animated background blurs */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(16,185,129,0.10),transparent_60%)]" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-emerald-500/5 rounded-full blur-3xl animate-glow-pulse" />
        <div className="absolute top-40 right-[12%] w-80 h-80 bg-teal-500/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 left-[6%] w-56 h-56 bg-emerald-400/4 rounded-full blur-2xl animate-float" style={{ animationDelay: "2s" }} />

        <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
          {/* Badge */}
          <div className="animate-fade-in-up inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card border-emerald-500/20 text-emerald-400 text-sm mb-8">
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI-Powered Application Assistant</span>
          </div>

          {/* Headline */}
          <h1 className="animate-fade-in-up delay-100 text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.08]">
            <span className="text-white">Your CV + Job Link</span>
            <br />
            <span className="text-gradient-hero">= Perfect Application</span>
          </h1>

          {/* Subheadline */}
          <p className="animate-fade-in-up delay-200 text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-6 leading-relaxed">
            Stop copy-pasting generic answers. ApplyFast reads your CV, analyzes the job,
            and fills every field with precision — saving you{" "}
            <span className="text-emerald-400 font-semibold">30+ minutes per application</span>.
          </p>

          {/* Trust badges */}
          <div className="animate-fade-in-up delay-300 flex items-center justify-center gap-6 mb-8 text-xs text-white/40">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />3 free/day
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />No signup
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />ATS-optimized
            </span>
          </div>

          {/* CTAs */}
          <div className="animate-fade-in-up delay-400 flex items-center justify-center gap-4">
            <Button
              onClick={() =>
                document.getElementById("form-anchor")?.scrollIntoView({ behavior: "smooth" })
              }
              className="bg-emerald-500 hover:bg-emerald-400 text-[#0a0f0e] font-semibold px-8 py-6 text-base rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:shadow-emerald-500/40 hover:-translate-y-0.5"
            >
              <Zap className="h-4 w-4 mr-2" />Try Free Now
            </Button>
            <Button
              onClick={() => {
                loadDemo();
                setTimeout(
                  () =>
                    document
                      .getElementById("form-anchor")
                      ?.scrollIntoView({ behavior: "smooth" }),
                  300
                );
              }}
              variant="outline"
              className="border-white/10 bg-white/5 backdrop-blur-xl text-white hover:bg-white/10 hover:border-emerald-500/30 px-8 py-6 text-base rounded-xl transition-all"
            >
              <Sparkles className="h-4 w-4 mr-2" />See Demo
            </Button>
          </div>

          {/* Mini stats */}
          <div className="animate-fade-in-up delay-500 grid grid-cols-3 gap-4 max-w-md mx-auto mt-14">
            {[
              { value: "30+", label: "Minutes Saved" },
              { value: "3 Free", label: "Per Day" },
              { value: "100%", label: "ATS Compatible" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-white/40 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* SECTION 2: PROBLEM / SOLUTION */}
      {/* ═══════════════════════════════════════════════ */}
      <section className="py-20 md:py-28 border-t border-white/[0.04]">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Stop Getting Rejected for{" "}
              <span className="text-gradient">Generic Applications</span>
            </h2>
            <p className="text-white/50 max-w-xl mx-auto">
              Recruiters can spot a ChatGPT application in seconds. Here&apos;s why ApplyFast gets you interviews.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Generic ChatGPT */}
            <div className="glass-card rounded-2xl p-6 border-red-500/10">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center mb-4">
                <X className="h-5 w-5 text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Generic ChatGPT</h3>
              <p className="text-sm text-white/40 mb-4">Copy-paste the JD into ChatGPT and pray.</p>
              <ul className="space-y-2 text-sm text-white/50">
                <li className="flex items-start gap-2">
                  <X className="h-3.5 w-3.5 text-red-400 mt-0.5 flex-shrink-0" />Sounds robotic
                </li>
                <li className="flex items-start gap-2">
                  <X className="h-3.5 w-3.5 text-red-400 mt-0.5 flex-shrink-0" />No ATS keywords
                </li>
                <li className="flex items-start gap-2">
                  <X className="h-3.5 w-3.5 text-red-400 mt-0.5 flex-shrink-0" />Fails screening
                </li>
                <li className="flex items-start gap-2">
                  <X className="h-3.5 w-3.5 text-red-400 mt-0.5 flex-shrink-0" />Generic answers
                </li>
              </ul>
            </div>

            {/* ApplyFast - highlighted */}
            <div className="glass-card rounded-2xl p-6 border-emerald-500/30 relative overflow-hidden scale-[1.03]">
              <div className="absolute top-0 right-0 bg-emerald-500 text-[#0a0f0e] text-xs font-bold px-3 py-1 rounded-bl-xl">
                BEST
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center mb-4">
                <Sparkles className="h-5 w-5 text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">ApplyFast AI</h3>
              <p className="text-sm text-white/50 mb-4">
                CV + JD → every field, personalized and ATS-optimized.
              </p>
              <ul className="space-y-2 text-sm text-white/70">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />Matches CV to JD
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />ATS keyword scan
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />Personalized tone
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />Interview prep included
                </li>
              </ul>
            </div>

            {/* Result */}
            <div className="glass-card rounded-2xl p-6 border-teal-500/10">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center mb-4">
                <Target className="h-5 w-5 text-teal-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Interview Calls</h3>
              <p className="text-sm text-white/40 mb-4">Stand out from hundreds of applicants.</p>
              <ul className="space-y-2 text-sm text-white/50">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-teal-400 mt-0.5 flex-shrink-0" />Recruiters notice you
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-teal-400 mt-0.5 flex-shrink-0" />ATS passes your app
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-teal-400 mt-0.5 flex-shrink-0" />More 1st round calls
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-teal-400 mt-0.5 flex-shrink-0" />Less ghosting
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* SECTION 3: HOW IT WORKS */}
      {/* ═══════════════════════════════════════════════ */}
      <section className="py-20 md:py-28 border-t border-white/[0.04]">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              How It <span className="text-gradient">Works</span>
            </h2>
            <p className="text-white/50 max-w-xl mx-auto">
              Three simple steps. No signup. No credit card.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: FileText,
                title: "Paste Your CV",
                desc: "Drop in your resume or LinkedIn profile. We parse everything — skills, experience, education, achievements.",
              },
              {
                step: "02",
                icon: Link,
                title: "Add Job Link",
                desc: "Paste any job URL or description. We analyze the role, company, requirements, and ATS keywords.",
              },
              {
                step: "03",
                icon: SendHorizonal,
                title: "Get Every Field",
                desc: "AI fills in every application field. Copy-paste into Workday, Greenhouse, Lever — any ATS.",
              },
            ].map((item, i) => {
              const IconComp = item.icon;
              return (
                <div key={i} className="glass-card-hover rounded-2xl p-8 text-center group">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-6 group-hover:bg-emerald-500/15 transition-colors">
                    <IconComp className="h-6 w-6 text-emerald-400" />
                  </div>
                  <p className="text-xs font-bold text-white/20 mb-2">{item.step}</p>
                  <h3 className="text-lg font-semibold text-white mb-3">{item.title}</h3>
                  <p className="text-sm text-white/50 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* SECTION 4: WHAT MAKES US DIFFERENT */}
      {/* ═══════════════════════════════════════════════ */}
      <section className="py-20 md:py-28 border-t border-white/[0.04]">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              What Makes Us <span className="text-gradient">Different</span>
            </h2>
            <p className="text-white/50 max-w-xl mx-auto">
              ChatGPT is generic. ApplyFast is built for one thing: getting you hired.
            </p>
          </div>

          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="grid grid-cols-3 border-b border-white/5">
              <div className="p-5">
                <p className="text-xs text-white/30 uppercase tracking-wider font-semibold">Feature</p>
              </div>
              <div className="p-5 text-center">
                <p className="text-xs text-white/30 uppercase tracking-wider font-semibold">ChatGPT Free</p>
              </div>
              <div className="p-5 text-center bg-emerald-500/[0.04]">
                <p className="text-xs text-emerald-400 uppercase tracking-wider font-semibold">ApplyFast</p>
              </div>
            </div>

            {[
              "ATS Score Analysis",
              "Company Deep Research",
              "Sniper Bullets",
              "Arabic Support",
              "4 Output Tones",
              "Interview Prep",
              "Experience Mapping",
              "Multi-CV Manager",
            ].map((feature, i) => (
              <div key={i} className={`grid grid-cols-3 ${i % 2 === 0 ? "bg-white/[0.01]" : ""}`}>
                <div className="p-4 text-sm text-white/70">{feature}</div>
                <div className="p-4 flex justify-center items-center">
                  <X className="h-4 w-4 text-red-400/40" />
                </div>
                <div className="p-4 flex justify-center items-center bg-emerald-500/[0.03]">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* SECTION 5: FEATURES GRID */}
      {/* ═══════════════════════════════════════════════ */}
      <section className="py-20 md:py-28 border-t border-white/[0.04]">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Your Application <span className="text-gradient">Superpowers</span>
            </h2>
            <p className="text-white/50 max-w-xl mx-auto">
              Everything you need to beat the ATS and impress recruiters.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Target, title: "ATS Keywords", desc: "Extract and match keywords that ATS systems scan for." },
              { icon: Gauge, title: "Match Score", desc: "See exactly how well your CV matches the job before applying." },
              { icon: Building2, title: "Company Deep Dive", desc: "Get company size, tech stack, funding, culture insights." },
              { icon: ArrowRight, title: "Experience Mapper", desc: "Your experience automatically mapped to each requirement." },
              { icon: Target, title: "Sniper Bullets", desc: "Recruiters scan in 5 seconds — make them stop and read." },
              { icon: HelpCircle, title: "Interview Prep", desc: "Role-specific questions with hints built from your CV." },
              { icon: Globe, title: "Arabic Support", desc: "Full bilingual output — English and Arabic, same quality." },
              { icon: Layers, title: "Multi-CV Manager", desc: "Save multiple CVs, switch between them instantly." },
            ].map((feat, i) => {
              const Icon = feat.icon;
              return (
                <div key={i} className="glass-card-hover rounded-xl p-6">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-4">
                    <Icon className="h-[18px] w-[18px] text-emerald-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-white mb-2">{feat.title}</h3>
                  <p className="text-xs text-white/40 leading-relaxed">{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* SECTION 6: DEMO */}
      {/* ═══════════════════════════════════════════════ */}
      <section className="py-20 md:py-28 border-t border-white/[0.04]">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="glass-card rounded-3xl p-10 md:p-14 border-emerald-500/10">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
              <Sparkles className="h-7 w-7 text-emerald-400" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              See It In <span className="text-gradient">Action</span>
            </h2>
            <p className="text-white/50 mb-8 max-w-md mx-auto">
              We&apos;ll prefill a real CV and job description so you can see the full output in seconds.
            </p>
            <Button
              onClick={() => {
                loadDemo();
                setTimeout(
                  () =>
                    document
                      .getElementById("form-anchor")
                      ?.scrollIntoView({ behavior: "smooth" }),
                  300
                );
              }}
              className="bg-emerald-500 hover:bg-emerald-400 text-[#0a0f0e] font-semibold px-8 py-6 text-base rounded-xl shadow-lg shadow-emerald-500/20"
            >
              <Sparkles className="h-4 w-4 mr-2" />Try Demo — It&apos;s Free
            </Button>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* SECTION 7: PRICING */}
      {/* ═══════════════════════════════════════════════ */}
      <section id="pricing" className="py-20 md:py-28 border-t border-white/[0.04]">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Simple, Transparent <span className="text-gradient">Pricing</span>
            </h2>
            <p className="text-white/50 max-w-xl mx-auto">
              Start free. Pay only when you need more.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {/* Free */}
            <div className="glass-card rounded-2xl p-8">
              <p className="text-xs text-white/30 uppercase tracking-wider font-semibold mb-4">Starter</p>
              <p className="text-3xl font-bold text-white mb-2">Free</p>
              <p className="text-sm text-white/40 mb-6">3 applications per day</p>
              <ul className="space-y-3 mb-8">
                {[
                  "Full field auto-fill",
                  "ATS keyword analysis",
                  "Match score",
                  "Basic interview prep",
                  "Skills extraction",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-white/60">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                onClick={() =>
                  document.getElementById("form-anchor")?.scrollIntoView({ behavior: "smooth" })
                }
                className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl py-5"
              >
                Start Free
              </Button>
            </div>

            {/* $3 Single */}
            <div className="glass-card rounded-2xl p-8 border-emerald-500/20 relative">
              <p className="text-xs text-emerald-400 uppercase tracking-wider font-semibold mb-4">Single</p>
              <p className="text-3xl font-bold text-white mb-2">$3</p>
              <p className="text-sm text-white/40 mb-6">1 application</p>
              <ul className="space-y-3 mb-8">
                {[
                  "Everything in Free",
                  "Sniper bullets",
                  "Company deep dive",
                  "Experience mapping",
                  "Full interview prep",
                  "Quantified achievements",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-white/60">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                onClick={() =>
                  document.getElementById("payment")?.scrollIntoView({ behavior: "smooth" })
                }
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-[#0a0f0e] font-semibold rounded-xl py-5"
              >
                Buy for $3
              </Button>
            </div>

            {/* $9 Pack */}
            <div className="glass-card rounded-2xl p-8 border-emerald-500/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-emerald-500 text-[#0a0f0e] text-xs font-bold px-3 py-1 rounded-bl-xl">
                BEST VALUE
              </div>
              <p className="text-xs text-emerald-400 uppercase tracking-wider font-semibold mb-4">5-Pack</p>
              <p className="text-3xl font-bold text-white mb-2">$9</p>
              <p className="text-sm text-white/40 mb-1">5 applications</p>
              <p className="text-xs text-emerald-400/70 mb-6">
                <span className="line-through text-white/30">$15</span> Save 40%
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "Everything in Single",
                  "Custom question answerer",
                  "STAR stories",
                  "Role comparison",
                  "Follow-up email",
                  "Priority support",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-white/60">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                onClick={() =>
                  document.getElementById("payment")?.scrollIntoView({ behavior: "smooth" })
                }
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-[#0a0f0e] font-semibold rounded-xl py-5"
              >
                Buy 5-Pack $9
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* SECTION 8: FAQ */}
      {/* ═══════════════════════════════════════════════ */}
      <section className="py-20 md:py-28 border-t border-white/[0.04]">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Frequently Asked <span className="text-gradient">Questions</span>
            </h2>
          </div>

          <div className="space-y-3">
            {[
              {
                q: "How does ApplyFast work?",
                a: "Paste your CV and job link (or description). Our AI reads both, extracts your info, and generates every application field — from basic info to cover letter intro and strengths. Then just copy-paste each field into any job portal.",
              },
              {
                q: "What platforms does this work with?",
                a: "All of them. ApplyFast generates text answers you manually paste — no browser automation. That means it works with Workday, Greenhouse, Lever, BambooHR, and any custom ATS without violating any terms of service.",
              },
              {
                q: "Is my CV data safe?",
                a: "Absolutely. Your CV is sent to DeepSeek AI for processing and never stored on our servers. We don't save, sell, or train on your data. Your information passes through and is gone immediately after processing.",
              },
              {
                q: "How many free applications do I get?",
                a: "3 completely free applications per day. No signup, no credit card required. After your daily limit, it's $3 per application or $9 for a 5-pack (40% savings).",
              },
              {
                q: "Does ApplyFast work for non-English CVs?",
                a: "Yes! We support Arabic natively — you can paste an Arabic CV and get output in both English and Arabic. Other languages are also supported through our AI processing.",
              },
              {
                q: "How do I pay?",
                a: "Send the amount to our IBAN (STC Bank). Once we receive your payment, we'll email you credits. We're working on automated payment — this is a one-person project, so bear with us!",
              },
              {
                q: "Can I get a refund?",
                a: "If the AI output doesn't match your CV or you're unsatisfied, reply to the payment email and we'll refund within 24 hours. No questions asked.",
              },
              {
                q: "How is this different from ChatGPT?",
                a: "ChatGPT gives you generic text. ApplyFast is purpose-built — it extracts ATS keywords, scores your match, maps your experience to each job requirement, and gives you interview prep. It's a specialized tool, not a general chatbot.",
              },
            ].map((item, i) => (
              <details key={i} className="glass-card rounded-xl group">
                <summary className="p-5 cursor-pointer list-none flex items-center justify-between text-white font-medium text-sm">
                  {item.q}
                  <ChevronDown className="h-4 w-4 text-white/30 group-open:rotate-180 transition-transform flex-shrink-0 ml-2" />
                </summary>
                <div className="px-5 pb-5">
                  <p className="text-sm text-white/50 leading-relaxed">{item.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* FOOTER */}
      {/* ═══════════════════════════════════════════════ */}
      <footer className="border-t border-white/[0.04] py-8">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/30">
            &copy; {new Date().getFullYear()} ApplyFast AI &middot; Built for job seekers &middot;
            Halal & ethical
          </p>
          <div className="flex items-center gap-6 text-xs text-white/30">
            <a href="#pricing" className="hover:text-emerald-400 transition-colors">
              Privacy
            </a>
            <a href="#pricing" className="hover:text-emerald-400 transition-colors">
              Terms
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-emerald-400 transition-colors"
            >
              Twitter
            </a>
          </div>
        </div>
      </footer>

      {/* ═══════════════════════════════════════════════ */}
      {/* DIVIDER */}
      {/* ═══════════════════════════════════════════════ */}
      <div className="max-w-5xl mx-auto px-4 pb-8">
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
          <span className="text-xs text-white/20 flex-shrink-0">Start Building Your Application Below</span>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
        </div>
      </div>

      {/* ═══════════════════════════════════════════════ */}
      {/* FORM ANCHOR */}
      {/* ═══════════════════════════════════════════════ */}
      <div id="form-anchor" />

      {/* ═══════════════════════════════════════════════ */}
      {/* FORM */}
      {/* ═══════════════════════════════════════════════ */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card className="p-6 glass-card rounded-2xl">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Your CV / Resume
              </label>
              <Textarea
                placeholder="Paste your full CV here..."
                className="min-h-[250px] bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl resize-y"
                value={cv}
                onChange={(e) => setCv(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Job Posting URL
                </label>
                <Input
                  placeholder="https://jobs.lever.co/company/..."
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl"
                  value={jobLink}
                  onChange={(e) => setJobLink(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Or paste job description
                </label>
                <Textarea
                  placeholder="Paste the job description directly..."
                  className="min-h-[150px] bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl resize-y"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                />
              </div>
              <Button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-[#0a0f0e] font-semibold py-6 text-base mt-auto rounded-xl transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Zap className="h-5 w-5 mr-2" />
                    Fill My Application
                  </>
                )}
              </Button>
              <div className="flex items-center justify-between">
                <Button
                  onClick={() => {
                    loadDemo();
                  }}
                  variant="ghost"
                  className="text-white/40 hover:text-emerald-400 text-sm"
                >
                  <Sparkles className="h-3.5 w-3.5 mr-1" />Try Demo
                </Button>
                {remaining !== null && (
                  <span className="text-xs">
                    {remaining > 0 ? (
                      <span className="text-emerald-400">{remaining} free left today</span>
                    ) : (
                      <span className="text-amber-400">0 free today — pay per use</span>
                    )}
                  </span>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* ═══════════════════════════════════════════════ */}
      {/* RESULTS */}
      {/* ═══════════════════════════════════════════════ */}
      {loading && (
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <Loader2 className="h-10 w-10 text-emerald-400 animate-spin mx-auto mb-4" />
          <p className="text-white/40">Analyzing job, matching your experience, generating fields...</p>
        </div>
      )}

      {result && (
        <div
          ref={resultRef}
          className="max-w-4xl mx-auto px-4 pb-12 animate-fade-in-up"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Your Auto-Filled Application</h2>
            <Button
              variant="outline"
              onClick={copyAll}
              className="border-white/10 text-white/60 hover:bg-white/5 hover:text-white rounded-xl text-sm"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy All
            </Button>
          </div>

          {/* Core fields */}
          <Card className="p-6 glass-card rounded-2xl mb-6">
            <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wider mb-4">
              Basic Information
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {FIELDS.map(({ key, label }) => {
                const val = result[key];
                const displayVal = Array.isArray(val) ? val.join(", ") : String(val ?? "");
                if (!displayVal || displayVal === "N/A" || displayVal === "undefined") return null;
                return (
                  <div key={key} className="group relative">
                    <label className="block text-xs text-white/40 mb-1">{label}</label>
                    <div className="flex items-center gap-2">
                      <p className="text-white/80 text-sm">{displayVal}</p>
                      <button
                        onClick={() => copyField(key, displayVal)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-white/30 hover:text-emerald-400"
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
          <Card className="p-6 glass-card rounded-2xl mb-6">
            <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wider mb-4">
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
          <Card className="p-6 glass-card rounded-2xl mb-6">
            <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wider mb-4">
              Why This Role
            </h3>
            <p className="text-white/60 leading-relaxed">{result.whyThisRole}</p>
            <button
              onClick={() => copyField("whyThisRole", result.whyThisRole)}
              className="mt-3 text-xs text-white/30 hover:text-emerald-400 flex items-center gap-1"
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
          <Card className="p-6 glass-card rounded-2xl mb-6">
            <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wider mb-4">
              Cover Letter Intro
            </h3>
            <p className="text-white/60 leading-relaxed">{result.coverLetterSnippet}</p>
            <button
              onClick={() => copyField("coverLetter", result.coverLetterSnippet)}
              className="mt-3 text-xs text-white/30 hover:text-emerald-400 flex items-center gap-1"
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
          <Card className="p-6 glass-card rounded-2xl">
            <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wider mb-4">
              Top Strengths for This Role
            </h3>
            <ul className="space-y-2">
              {result.strengths?.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-white/60">
                  <span className="text-emerald-400 mt-1">•</span>
                  {s}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}

      {/* ═══════════════════════════════════════════════ */}
      {/* PAYMENT SECTION */}
      {/* ═══════════════════════════════════════════════ */}
      <div id="payment" className="max-w-2xl mx-auto px-4 pb-24 pt-8 border-t border-white/[0.04]">
        <Card className="p-8 glass-card rounded-2xl text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm mb-4">
            ⚡ Pro
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Unlimited Applications</h3>
          <p className="text-white/50 mb-2">$3 per application. Pay once, use once.</p>
          <p className="text-sm text-white/40 mb-6">Or $9 for 5 applications (save 40%)</p>

          <div className="space-y-3 max-w-md mx-auto">
            <div className="p-4 glass-card rounded-xl cursor-pointer hover:border-emerald-500/30 transition-colors">
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <p className="text-white font-semibold">1 Application</p>
                  <p className="text-sm text-white/40">$3.00</p>
                </div>
                <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  One-time
                </span>
              </div>
            </div>

            <div className="p-4 glass-card rounded-xl cursor-pointer hover:border-emerald-500/30 transition-colors relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-emerald-500 text-[#0a0f0e] text-xs font-bold px-2 py-0.5 rounded-bl-lg">
                Best Value
              </div>
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <p className="text-white font-semibold">5 Applications</p>
                  <p className="text-sm text-white/40">
                    <span className="text-emerald-400 font-semibold">$9.00</span>{" "}
                    <span className="line-through text-white/30">$15.00</span>
                  </p>
                </div>
                <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  Save 40%
                </span>
              </div>
            </div>
          </div>

          <div className="mt-8 p-4 bg-white/[0.03] rounded-xl border border-white/5">
            <p className="text-sm text-white/40 mb-2">To pay, send the amount via:</p>
            <div className="bg-white/5 rounded-md p-3 font-mono text-white/60 text-sm break-all select-all">
              IBAN: SA6478000000001065324365
            </div>
            <p className="text-xs text-white/30 mt-2">
              STC Bank &middot; After payment, email the receipt to activate your credits.
            </p>
          </div>
        </Card>
      </div>
    </main>
  );
}
