import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ApplyFast — AI Job Application Assistant for Saudi & Gulf",
  description:
    "Paste your CV and job link. AI fills every application field with Gulf-market ATS optimization, bilingual Arabic/English output, and Saudi-specific keyword analysis. 3 free per day.",
  keywords: [
    "job application Saudi",
    "تعبئة طلب التوظيف",
    "سيرة ذاتية ذكاء اصطناعي",
    "وظائف السعودية",
    "auto fill job form",
    "resume to application",
    "CV filler",
    "Workday auto fill",
    "Gulf job market",
    "Vision 2030 jobs",
    "Nitaqat",
    "ATS Gulf",
    "apply to jobs fast",
  ],
  authors: [{ name: "ApplyFast" }],
  openGraph: {
    title: "ApplyFast — AI Job Application Assistant for Saudi & Gulf",
    description:
      "Paste your CV + job link. Get every application field filled by AI with Gulf-market ATS optimization. Bilingual Arabic/English. Free 3/day.",
    url: "https://applyfast-chi.vercel.app",
    siteName: "ApplyFast",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ApplyFast — AI Job Application Assistant for Saudi & Gulf",
    description:
      "Paste CV + job link → AI fills everything with Gulf-market ATS optimization. Free 3/day.",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://applyfast-chi.vercel.app",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <head>
        {/* RTL locale detection script — runs before paint to avoid flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var stored = localStorage.getItem('applyfast_locale');
                var loc = stored === 'ar' ? 'ar' : (stored === 'en' ? 'en' : (navigator.language||'').startsWith('ar') ? 'ar' : 'en');
                document.documentElement.dir = loc === 'ar' ? 'rtl' : 'ltr';
                document.documentElement.lang = loc;
                if (!stored) localStorage.setItem('applyfast_locale', loc);
              })();
            `,
          }}
        />
        {/* Analytics */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var url = 'https://applyfast-chi.vercel.app/api/track';
                var d = { r: document.referrer, u: location.pathname, t: Date.now(), w: screen.width };
                if (navigator.sendBeacon) navigator.sendBeacon(url, JSON.stringify(d));
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-slate-950">
        {children}
        <Toaster position="top-center" theme="dark" />
      </body>
    </html>
  );
}
