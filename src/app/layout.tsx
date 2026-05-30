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
  title: "ApplyFast AI — Auto-Fill Job Applications in Seconds",
  description:
    "Paste your CV and job link. AI fills every application field instantly — Workday, Greenhouse, Lever, all ATS. Save 30+ minutes per application. 3 free per day.",
  keywords: [
    "job application",
    "AI fill application",
    "auto fill job form",
    "resume to application",
    "CV filler",
    "Workday auto fill",
    "Greenhouse application",
    "Lever job app",
    "job search AI",
    "apply to jobs fast",
  ],
  authors: [{ name: "ApplyFast" }],
  openGraph: {
    title: "ApplyFast AI — Auto-Fill Job Applications Instantly",
    description:
      "Paste your CV + job link. Get every application field filled by AI. Free 3/day.",
    url: "https://applyfast-chi.vercel.app",
    siteName: "ApplyFast AI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ApplyFast AI — Auto-Fill Job Applications",
    description:
      "Paste CV + job link → AI fills everything. 30 mins saved per app.",
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
        {/* Analytics - simple inline tracker until we add proper analytics */}
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
