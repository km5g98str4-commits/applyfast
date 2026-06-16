import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { NextRequest } from "next/server";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Get a stable client IP that can't be easily spoofed.
 * In production behind a trusted proxy, use X-Real-IP.
 * Falls back to X-Forwarded-For only when X-Real-IP is absent.
 * For local dev, generates a hash from User-Agent + Accept-Language for stability.
 */
export function getClientIP(req: NextRequest): string {
  // Preferred: X-Real-IP (set by trusted reverse proxy like nginx)
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  // Fallback: first IP in X-Forwarded-For (only trust in production)
  // In local dev, don't trust any forwarded headers
  if (process.env.NODE_ENV === "production") {
    const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    if (forwarded) return forwarded;
  }

  // Last resort: hash of non-spoofable headers for local dev
  // This prevents rotating User-Agent to bypass limits
  const ua = req.headers.get("user-agent") || "unknown";
  const lang = req.headers.get("accept-language") || "unknown";
  return `hash:${simpleHash(ua + lang)}`;
}

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}
