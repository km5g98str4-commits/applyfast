import { NextRequest, NextResponse } from "next/server";
import { getRedis, getCreditsKey, getDailyKey } from "@/lib/redis";

export const runtime = "edge";

const isDemoMode = !process.env.UPSTASH_REDIS_REST_URL;

/**
 * POST /api/license/consume
 * Consumes 1 credit from the user's license key balance.
 * Used before each AI generation call.
 *
 * Body: { license_key?: string }
 * If no license_key provided, uses daily free tier (3 per day per IP).
 *
 * Demo mode: always allows (no Redis required).
 */
export async function POST(req: NextRequest) {
  try {
    const { license_key } = await req.json();
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

    // 🧪 DEMO MODE — always allow, no limits
    if (isDemoMode) {
      return NextResponse.json({
        allowed: true,
        remaining: 999,
        freeLimit: 999,
        used: 0,
        demo: true,
      });
    }

    const r = getRedis();
    if (!r) {
      return NextResponse.json(
        { allowed: false, remaining: 0, message: "Service temporarily unavailable — Redis is not configured." },
        { status: 503 }
      );
    }

    // Free tier: IP-based, 3 per day
    if (!license_key) {
      const dailyKey = getDailyKey(`ip:${ip}`);
      const used = await r.get<number>(dailyKey);

      if (used !== null && used >= 3) {
        return NextResponse.json({
          allowed: false,
          remaining: 0,
          freeLimit: 3,
          message: "Free daily limit reached. Purchase credits to continue.",
        });
      }

      // Increment and set TTL (expire at end of day UTC)
      const next = (used ?? 0) + 1;
      const now = new Date();
      const endOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
      const ttl = Math.ceil((endOfDay.getTime() - now.getTime()) / 1000);
      await r.set(dailyKey, next, { ex: ttl });

      return NextResponse.json({
        allowed: true,
        remaining: Math.max(0, 3 - next),
        freeLimit: 3,
        used: next,
      });
    }

    // Licensed user: validate key exists with credits
    const creditsKey = getCreditsKey(license_key);
    const balance = await r.get<number>(creditsKey);

    if (balance === null) {
      return NextResponse.json({
        allowed: false,
        remaining: 0,
        message: "Invalid license key. Please check your key or contact support.",
      });
    }

    if (balance <= 0) {
      return NextResponse.json({
        allowed: false,
        remaining: 0,
        message: "No credits remaining. Purchase more to continue.",
      });
    }

    // Consume 1 credit
    const newBalance = await r.decr(creditsKey);

    return NextResponse.json({
      allowed: true,
      remaining: newBalance,
      licensed: true,
    });
  } catch (error: any) {
    console.error("Credit consumption error:", error?.message || error);
    return NextResponse.json(
      { allowed: false, remaining: 0, message: "Service temporarily unavailable. Please try again." },
      { status: 503 }
    );
  }
}
