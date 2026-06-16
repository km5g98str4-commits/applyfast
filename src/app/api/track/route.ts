import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const TRACKING_SECRET = process.env.TRACKING_SECRET;

function getRedis(): Redis | null {
  try {
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return null;
    return new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  } catch {
    return null;
  }
}

function isAuthorized(req: NextRequest): boolean {
  if (TRACKING_SECRET) {
    const key = req.headers.get("x-api-key");
    return key === TRACKING_SECRET;
  }
  return false;
}

export async function POST(req: NextRequest) {
  try {
    const { r: referrer, u: page } = await req.json();
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const hour = new Date().toISOString().slice(0, 13);

    const r = getRedis();
    if (!r) {
      return NextResponse.json({ ok: true });
    }

    // Persist to Redis with 90-day TTL
    await Promise.all([
      r.incr("track:total"),
      r.sadd("track:ips", ip),
      r.hincrby("track:referrers", referrer || "direct", 1),
      r.hincrby("track:pages", page || "/", 1),
      r.hincrby("track:hourly", hour, 1),
    ]);

    // Set TTL on keys that don't expire automatically
    await Promise.all([
      r.expire("track:total", 7776000),   // 90 days
      r.expire("track:ips", 7776000),
      r.expire("track:referrers", 7776000),
      r.expire("track:pages", 7776000),
      r.expire("track:hourly", 7776000),
    ]);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const r = getRedis();
  if (!r) {
    return NextResponse.json({
      totalVisits: 0,
      uniqueIPs: 0,
      referrers: {},
      pages: {},
      hourly: {},
    });
  }

  const [totalVisits, uniqueIPs, referrers, pages, hourly] = await Promise.all([
    r.get<number>("track:total"),
    r.scard("track:ips"),
    r.hgetall<Record<string, string>>("track:referrers"),
    r.hgetall<Record<string, string>>("track:pages"),
    r.hgetall<Record<string, string>>("track:hourly"),
  ]);

  return NextResponse.json({
    totalVisits: totalVisits || 0,
    uniqueIPs: uniqueIPs || 0,
    referrers: referrers || {},
    pages: pages || {},
    hourly: hourly || {},
  });
}
