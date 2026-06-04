import { NextRequest, NextResponse } from "next/server";
import { redis, CREDIT_PACKS, getCreditsKey } from "@/lib/redis";

export const runtime = "edge";

const LS_STORE_ID = process.env.LEMONSQUEEZY_STORE_ID;
const LS_PRODUCT_ID = process.env.LEMONSQUEEZY_PRODUCT_ID;
const LS_VARIANT_IDS = (process.env.LEMONSQUEEZY_VARIANT_IDS || "").split(",").map(s => s.trim()).filter(Boolean);

/**
 * POST /api/license/validate
 * Validates a Lemon Squeezy license key and returns credit balance.
 * Does NOT consume credits.
 */
export async function POST(req: NextRequest) {
  try {
    const { license_key } = await req.json();

    if (!license_key || typeof license_key !== "string") {
      return NextResponse.json({ valid: false, error: "License key is required" }, { status: 400 });
    }

    // Step 1: Validate the license key with Lemon Squeezy
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

    // Step 2: Verify this key belongs to our store + product
    const storeId = String(meta?.store_id);
    const productId = String(meta?.product_id);

    if (LS_STORE_ID && storeId !== LS_STORE_ID) {
      return NextResponse.json({ valid: false, error: "Key not issued by this store" }, { status: 400 });
    }
    if (LS_PRODUCT_ID && productId !== LS_PRODUCT_ID) {
      return NextResponse.json({ valid: false, error: "Key not for this product" }, { status: 400 });
    }

    // Step 3: Look up / seed credit balance
    const creditsKey = getCreditsKey(license_key);
    const redeemedKey = `redeemed:${license_key}`;
    const variantId = meta?.variant_id ? String(meta.variant_id) : null;
    const pack = variantId ? CREDIT_PACKS[variantId] : null;

    // Check existing balance (set by webhook or prior redemption)
    let balance = await redis.get<number>(creditsKey);

    if (balance === null && pack) {
      // Webhook hasn't fired yet — atomically claim this key once
      const alreadyRedeemed = await redis.get<number>(redeemedKey);
      if (alreadyRedeemed) {
        return NextResponse.json({
          valid: false,
          error: "This license key has already been activated. Use a new key for additional credits.",
        }, { status: 400 });
      }

      await redis.set(redeemedKey, 1);
      await redis.set(creditsKey, pack.credits);
      balance = pack.credits;
    }

    return NextResponse.json({
      valid: true,
      credits: balance ?? 0,
      pack: pack?.name || "Unknown",
      email: meta?.customer_email || null,
    });
  } catch (error: any) {
    console.error("License validation error:", error);
    return NextResponse.json({ valid: false, error: "Validation error" }, { status: 500 });
  }
}
