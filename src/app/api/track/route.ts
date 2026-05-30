import { NextResponse } from "next/server";

// Simple analytics endpoint - counts page views and referrers
const stats: {
  totalVisits: number;
  uniqueIPs: Set<string>;
  referrers: Record<string, number>;
  pages: Record<string, number>;
  hourly: Record<string, number>;
} = {
  totalVisits: 0,
  uniqueIPs: new Set(),
  referrers: {},
  pages: {},
  hourly: {},
};

export async function POST(req: Request) {
  try {
    const { r: referrer, u: page, w: screenWidth } = await req.json();

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const hour = new Date().toISOString().slice(0, 13);

    stats.totalVisits++;
    stats.uniqueIPs.add(ip);
    stats.referrers[referrer || "direct"] =
      (stats.referrers[referrer || "direct"] || 0) + 1;
    stats.pages[page || "/"] = (stats.pages[page || "/"] || 0) + 1;
    stats.hourly[hour] = (stats.hourly[hour] || 0) + 1;

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json({
    totalVisits: stats.totalVisits,
    uniqueIPs: stats.uniqueIPs.size,
    referrers: stats.referrers,
    pages: stats.pages,
    hourly: stats.hourly,
  });
}
