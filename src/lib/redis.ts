import { Redis } from "@upstash/redis";

// Lazy-initialized Redis instance — returns null if env vars are missing
let _redis: Redis | null = null;
let _redisInitAttempted = false;

export function getRedis(): Redis | null {
  if (_redisInitAttempted) return _redis;

  _redisInitAttempted = true;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token || url === "your_upstash_redis_url_here" || token === "your_upstash_redis_token_here") {
    console.warn("⚠️ [Redis] Missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN. Demo mode: credit limits disabled, all requests use free tier fallback.");
    return null;
  }

  try {
    _redis = new Redis({ url, token });
    return _redis;
  } catch (err) {
    console.error("⚠️ [Redis] Failed to initialize:", err);
    return null;
  }
}

// Safe wrapper — may be null when env vars are missing (won't crash)
export const redis: Redis | null = getRedis();

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
