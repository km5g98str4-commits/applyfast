import { NextRequest, NextResponse } from "next/server";
import { getRedis, CREDIT_PACKS, getCreditsKey } from "@/lib/redis";

export const runtime = "edge";

const LS_STORE_ID = process.env.LEMONSQUEEZY_STORE_ID;
const LS_PRODUCT_IDS = new Set([
  process.env.LEMONSQUEEZY_PRODUCT_ID_5,
  process.env.LEMONSQUEEZY_PRODUCT_ID_UNLIMITED,
].filter(Boolean));
const isDemoMode = !process.env.LEMONSQUEEZY_STORE_ID && !process.env.UPSTASH_REDIS_REST_URL;

/**
 * POST /api/license/validate
 * Validates a Lemon Squeezy license key and returns credit balance.
 * Does NOT consume credits.
 *
 * Demo mode: always returns valid with 999 credits (no external services required).
 */
export async function POST(req: NextRequest) {
  try {
    const { license_key } = await req.json();

    if (!license_key || typeof license_key !== "string") {
      return NextResponse.json({ valid: false, error: "License key is required" }, { status: 400 });
    }

    // 🧪 DEMO MODE — accept any key as valid with unlimited credits
    if (isDemoMode) {
      return NextResponse.json({
        valid: true,
        credits: 999,
        pack: "Demo Unlimited",
        email: "demo@applyfast.dev",
        demo: true,
      });
    }

    const r = getRedis();
    if (!r) {
      return NextResponse.json(
        { valid: false, error: "Service temporarily unavailable — Redis is not configured." },
        { status: 503 }
      );
    }

    // Validate the license key with Lemon Squeezy
    const validateRes = await fetch("https://api.lemonsqueezy.com/v1/licenses/validate", {
      method: "POST",
      headers: { "Accept": "application/json", "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ license_key }).toString(),
    });

    if (!validateRes.ok) {
      return NextResponse.json({ valid: false, error: "License validation failed" }, { status: 502 });
    }

    const { valid, meta } = await validateRes.json();

    if (!valid) {
      return NextResponse.json({ valid: false, error: "Invalid license key" }, { status: 400 });
    }

    // Verify this key belongs to our store + product
    const storeId = String(meta?.store_id);
    const productId = String(meta?.product_id);

    if (LS_STORE_ID && storeId !== LS_STORE_ID) {
      return NextResponse.json({ valid: false, error: "Key not issued by this store" }, { status: 400 });
    }
    if (LS_PRODUCT_IDS.size > 0 && !LS_PRODUCT_IDS.has(productId)) {
      return NextResponse.json({ valid: false, error: "Key not for an ApplyFast product" }, { status: 400 });
    }

    // Look up / seed credit balance
    const creditsKey = getCreditsKey(license_key);
    const redeemedKey = `redeemed:${license_key}`;
    const variantId = meta?.variant_id ? String(meta.variant_id) : null;
    const pack = variantId ? CREDIT_PACKS[variantId] : null;

    // Check existing balance (set by webhook or prior redemption)
    let balance = await r.get<number>(creditsKey);

    if (balance === null && pack) {
      const alreadyRedeemed = await r.get<number>(redeemedKey);
      if (alreadyRedeemed) {
        return NextResponse.json(
          { valid: false, error: "This license key has already been activated. Use a new key for additional credits." },
          { status: 400 }
        );
      }

      await r.set(redeemedKey, 1);
      await r.set(creditsKey, pack.credits);
      balance = pack.credits;
    }

    return NextResponse.json({
      valid: true,
      credits: balance ?? 0,
      pack: pack?.name || "Unknown",
      email: meta?.customer_email || null,
    });
  } catch (error: any) {
    console.error("License validation error:", error?.message || error);
    return NextResponse.json(
      { valid: false, error: "Service temporarily unavailable. Please try again." },
      { status: 503 }
    );
  }
}
