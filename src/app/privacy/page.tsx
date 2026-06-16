"use client";

import { useEffect, useState, type ReactNode } from "react";
import { ArrowLeft, Shield } from "lucide-react";

export default function PrivacyPage() {
  const [lang, setLang] = useState<"en" | "ar">("en");

  useEffect(() => {
    const stored = localStorage.getItem("applyfast_locale");
    if (stored === "ar") setLang("ar");
  }, []);

  const toggleLang = () => {
    const next = lang === "en" ? "ar" : "en";
    setLang(next);
    localStorage.setItem("applyfast_locale", next);
    document.documentElement.dir = next === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = next;
  };

  const isAr = lang === "ar";

  return (
    <main className="min-h-screen bg-[#0a0f0e] text-white" dir={isAr ? "rtl" : "ltr"}>
      <header className="sticky top-0 bg-[#0a0f0e]/90 backdrop-blur-md border-b border-white/[0.04] z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <a
            href="/"
            className="flex items-center gap-2 text-white/50 hover:text-emerald-400 transition-colors text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            {isAr ? "العودة إلى ApplyFast" : "Back to ApplyFast"}
          </a>
          <button
            onClick={toggleLang}
            className="text-xs text-white/40 hover:text-emerald-400 transition-colors px-3 py-1.5 rounded-lg border border-white/10 hover:border-emerald-500/30"
          >
            {isAr ? "English" : "العربية"}
          </button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
            <Shield className="h-5 w-5 text-emerald-400" />
          </div>
          <h1 className="text-3xl font-bold text-white">
            {isAr ? "سياسة الخصوصية" : "Privacy Policy"}
          </h1>
        </div>
        <p className="text-white/40 text-sm mb-12">
          {isAr ? "آخر تحديث: يونيو 2026" : "Last updated: June 2026"}
        </p>

        {isAr ? <PrivacyAR /> : <PrivacyEN />}
      </div>

      <footer className="border-t border-white/[0.04] py-6">
        <div className="max-w-3xl mx-auto px-4 flex items-center justify-between text-xs text-white/30">
          <p>&copy; 2026 ApplyFast AI</p>
          <div className="flex gap-4">
            <a href="/privacy" className="hover:text-emerald-400 transition-colors">
              {isAr ? "الخصوصية" : "Privacy"}
            </a>
            <a href="/terms" className="hover:text-emerald-400 transition-colors">
              {isAr ? "الشروط" : "Terms"}
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-lg font-semibold text-white mb-3">{title}</h2>
      <div className="space-y-3 text-white/60 text-sm leading-relaxed">{children}</div>
    </section>
  );
}

function Bullet({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2">
          <span className="text-emerald-400 mt-0.5 flex-shrink-0">•</span>
          {item}
        </li>
      ))}
    </ul>
  );
}

function ThirdPartyCard({ name, detail }: { name: string; detail: string }) {
  return (
    <div className="glass-card rounded-xl p-4 mb-3">
      <p className="text-white font-medium text-sm mb-1">{name}</p>
      <p className="text-xs text-white/50">{detail}</p>
    </div>
  );
}

function PrivacyEN() {
  return (
    <div>
      <Section title="1. What Data We Collect">
        <p>ApplyFast collects the minimum data necessary to provide the service:</p>
        <Bullet
          items={[
            "CV / resume text — submitted by you for AI processing only, never stored",
            "Job description or URL — submitted by you for analysis, never stored",
            "IP address — held temporarily in Redis (24-hour TTL) for the 3 free/day rate limit",
            "License key — if purchased, stored to verify and deduct usage",
            "Name or email — only if you contact us directly",
          ]}
        />
        <p className="text-white/40 text-xs">
          We do <strong className="text-white/60">not</strong> require account creation. No email,
          name, or personal profile is collected unless you choose to provide it.
        </p>
      </Section>

      <Section title="2. How We Use Your Data">
        <Bullet
          items={[
            "CV and job description are sent to our AI providers for real-time processing and are never stored on our servers.",
            "IP addresses are used solely to enforce the free-tier daily limit and are not linked to any personal identity.",
            "We never use your CV or job data to train AI models.",
            "We never sell or share your data with advertisers or third-party marketers.",
          ]}
        />
      </Section>

      <Section title="3. Data Security">
        <Bullet
          items={[
            "All data is transmitted over HTTPS (TLS encryption in transit)",
            "CV text is processed in memory and discarded immediately — never written to disk or a database",
            "Rate-limit counters in Redis store only a hashed IP and a count — no personal content",
            "License key data is stored with encryption in Upstash Redis",
          ]}
        />
      </Section>

      <Section title="4. Third-Party Services">
        <p>
          ApplyFast relies on the following third-party services. Each handles data under
          its own privacy policy:
        </p>
        <ThirdPartyCard
          name="DeepSeek API"
          detail="Primary AI model provider based in China. Your CV and job description are sent to DeepSeek servers for processing and are subject to their data handling policies."
        />
        <ThirdPartyCard
          name="OpenAI API"
          detail="Fallback AI provider (US-based). Used when DeepSeek is unavailable."
        />
        <ThirdPartyCard
          name="Lemon Squeezy"
          detail="Payment processor for premium credits. We never see or store your payment card details."
        />
        <ThirdPartyCard
          name="Upstash Redis"
          detail="Serverless database for rate-limit counters and license key management (EU/US regions)."
        />
        <ThirdPartyCard
          name="Vercel"
          detail="Hosting and serverless compute provider (US-based). All traffic routes through Vercel infrastructure."
        />
      </Section>

      <Section title="5. Your Rights — GDPR & Saudi PDPL">
        <p>
          ApplyFast respects applicable data protection laws, including the EU{" "}
          <strong className="text-white/70">General Data Protection Regulation (GDPR)</strong> and
          Saudi Arabia&apos;s{" "}
          <strong className="text-white/70">Personal Data Protection Law (PDPL — نظام حماية البيانات الشخصية)</strong>.
        </p>
        <p>You have the right to:</p>
        <Bullet
          items={[
            "Request confirmation of whether we hold any personal data about you",
            "Request deletion of any personal data (we hold only hashed IP counters and license keys — CV text is never stored)",
            "Withdraw consent at any time by stopping use of the service",
            "Lodge a complaint with your relevant data protection authority",
          ]}
        />
        <p>
          To exercise these rights:{" "}
          <a href="mailto:iziyad.alfahhad@gmail.com" className="text-emerald-400 hover:underline">
            iziyad.alfahhad@gmail.com
          </a>
        </p>
      </Section>

      <Section title="6. Cookies & Local Storage">
        <p>
          ApplyFast does not use tracking or advertising cookies. We use browser{" "}
          <code className="text-emerald-400 text-xs">localStorage</code> only to remember your
          language preference (<code className="text-emerald-400 text-xs">applyfast_locale</code>).
          No analytics or advertising cookies are set.
        </p>
      </Section>

      <Section title="7. Data Retention">
        <Bullet
          items={[
            "CV and job description: zero retention — discarded after AI processing completes",
            "IP rate-limit counters: auto-expire after 24 hours (Redis TTL)",
            "License key records: retained until credits are exhausted or you request deletion",
          ]}
        />
      </Section>

      <Section title="8. Changes to This Policy">
        <p>
          We may update this policy periodically. Material changes will be noted at the top of
          this page with a revised date. Continued use of ApplyFast after changes constitutes
          acceptance of the updated policy.
        </p>
      </Section>

      <Section title="9. Contact">
        <p>
          Questions about this Privacy Policy?{" "}
          <a href="mailto:iziyad.alfahhad@gmail.com" className="text-emerald-400 hover:underline">
            iziyad.alfahhad@gmail.com
          </a>
        </p>
      </Section>
    </div>
  );
}

function PrivacyAR() {
  return (
    <div dir="rtl">
      <Section title="١. البيانات التي نجمعها">
        <p>يجمع ApplyFast الحد الأدنى من البيانات اللازمة لتقديم الخدمة:</p>
        <Bullet
          items={[
            "نص السيرة الذاتية — يُرسل من قِبلك للمعالجة بالذكاء الاصطناعي فقط، ولا يُخزَّن أبداً",
            "وصف الوظيفة أو رابطها — يُرسل للتحليل فقط، ولا يُخزَّن",
            "عنوان IP — يُحفظ مؤقتاً في Redis (٢٤ ساعة) لتطبيق حد المجانية (٣ طلبات يومياً)",
            "مفتاح الترخيص — إذا اشتريت رصيداً، يُخزَّن للتحقق منه وخصم الاستخدام",
            "الاسم أو البريد الإلكتروني — فقط إذا تواصلت معنا مباشرةً",
          ]}
        />
        <p className="text-white/40 text-xs">
          لا يتطلب ApplyFast إنشاء حساب. لا نجمع البريد الإلكتروني أو الاسم الشخصي إلا إذا اخترت تقديمهما.
        </p>
      </Section>

      <Section title="٢. كيف نستخدم بياناتك">
        <Bullet
          items={[
            "تُرسل السيرة الذاتية ووصف الوظيفة مباشرةً إلى مزودي الذكاء الاصطناعي للمعالجة الفورية، ولا تُخزَّن على خوادمنا.",
            "تُستخدم عناوين IP فقط لتطبيق حد المجانية، ولا تُربط بأي هوية شخصية.",
            "لا نستخدم بياناتك لتدريب نماذج الذكاء الاصطناعي.",
            "لا نبيع بياناتك أو نشاركها مع جهات إعلانية أو تسويقية.",
          ]}
        />
      </Section>

      <Section title="٣. أمان البيانات">
        <Bullet
          items={[
            "تُنقل جميع البيانات عبر HTTPS (تشفير TLS في النقل)",
            "يُعالَج نص السيرة الذاتية في الذاكرة المؤقتة ويُحذف فوراً بعد الانتهاء",
            "عدادات الحد في Redis تخزّن IP مُجزَّأً وعدداً فقط — لا محتوى شخصي",
            "بيانات مفتاح الترخيص مُشفَّرة في Upstash Redis",
          ]}
        />
      </Section>

      <Section title="٤. الخدمات الخارجية">
        <p>يعتمد ApplyFast على الخدمات الخارجية التالية، وكل منها له سياسة خصوصية مستقلة:</p>
        <ThirdPartyCard
          name="DeepSeek API"
          detail="مزوّد نموذج الذكاء الاصطناعي الرئيسي، مقرّه الصين. تُرسل إليه السيرة الذاتية ووصف الوظيفة للمعالجة."
        />
        <ThirdPartyCard
          name="OpenAI API"
          detail="مزوّد الذكاء الاصطناعي الاحتياطي (مقرّه الولايات المتحدة). يُستخدم عند تعذّر الوصول إلى DeepSeek."
        />
        <ThirdPartyCard
          name="Lemon Squeezy"
          detail="معالج المدفوعات للرصيد المدفوع. لا نرى تفاصيل بطاقتك ولا نخزّنها."
        />
        <ThirdPartyCard
          name="Upstash Redis"
          detail="قاعدة بيانات serverless لعدادات الحد ومفاتيح الترخيص (مناطق الاتحاد الأوروبي/الولايات المتحدة)."
        />
        <ThirdPartyCard
          name="Vercel"
          detail="مزوّد الاستضافة والوظائف السحابية (مقرّه الولايات المتحدة)."
        />
      </Section>

      <Section title="٥. حقوقك — GDPR ونظام PDPL السعودي">
        <p>
          يلتزم ApplyFast بقوانين حماية البيانات المعمول بها، بما فيها اللائحة الأوروبية{" "}
          <strong className="text-white/70">GDPR</strong> ونظام حماية البيانات الشخصية السعودي{" "}
          <strong className="text-white/70">(PDPL)</strong> الصادر بالمرسوم الملكي م/19 لعام 1443هـ.
        </p>
        <p>يحق لك:</p>
        <Bullet
          items={[
            "طلب معرفة البيانات التي نحتفظ بها عنك",
            "طلب حذف أي بيانات شخصية (نحتفظ فقط بـ IP مُجزَّأ ومفاتيح الترخيص — لا نخزّن السيرة الذاتية)",
            "سحب موافقتك في أي وقت بمجرد التوقف عن استخدام الخدمة",
            "تقديم شكوى لدى الجهة الرقابية المختصة في بلدك",
          ]}
        />
        <p>
          للتواصل:{" "}
          <a href="mailto:iziyad.alfahhad@gmail.com" className="text-emerald-400 hover:underline">
            iziyad.alfahhad@gmail.com
          </a>
        </p>
      </Section>

      <Section title="٦. ملفات تعريف الارتباط والتخزين المحلي">
        <p>
          لا يستخدم ApplyFast ملفات تعريف الارتباط التتبعية أو الإعلانية. نستخدم{" "}
          <code className="text-emerald-400 text-xs">localStorage</code> فقط لحفظ تفضيل اللغة
          (المفتاح: <code className="text-emerald-400 text-xs">applyfast_locale</code>).
        </p>
      </Section>

      <Section title="٧. مدة الاحتفاظ بالبيانات">
        <Bullet
          items={[
            "السيرة الذاتية ووصف الوظيفة: احتفاظ صفري — تُحذف بعد اكتمال المعالجة مباشرةً",
            "عدادات حد الاستخدام: تنتهي تلقائياً بعد ٢٤ ساعة (إعداد TTL في Redis)",
            "سجلات مفاتيح الترخيص: تُحفظ حتى نفاد الرصيد أو طلب الحذف",
          ]}
        />
      </Section>

      <Section title="٨. التواصل معنا">
        <p>
          أي استفسار حول سياسة الخصوصية:{" "}
          <a href="mailto:iziyad.alfahhad@gmail.com" className="text-emerald-400 hover:underline">
            iziyad.alfahhad@gmail.com
          </a>
        </p>
      </Section>
    </div>
  );
}
