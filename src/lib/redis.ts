import { Redis } from "@upstash/redis";

// Initialize Redis using environment variables
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Credit pack definitions (variant_id → credits)
export const CREDIT_PACKS: Record<string, { name: string; credits: number }> = {
  // You MUST update these variant IDs after creating products in Lemon Squeezy
  "default": { name: "1 Application", credits: 1 }, // $3 pack
  "variant_5": { name: "5 Applications", credits: 5 }, // $9 pack
};

export function getCreditsKey(licenseKey: string): string {
  return `credits:${licenseKey}`;
}

export function getDailyKey(identifier: string): string {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  return `daily:${identifier}:${today}`;
}
