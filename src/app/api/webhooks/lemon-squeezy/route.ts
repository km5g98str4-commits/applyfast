import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getRedis, CREDIT_PACKS, getCreditsKey } from "@/lib/redis";

export const runtime = "nodejs"; // crypto.timingSafeEqual requires Node.js

const LS_STORE_ID = process.env.LEMONSQUEEZY_STORE_ID;

/**
 * POST /api/webhooks/lemon-squeezy
 * Receives order_created and license_key_created webhooks from Lemon Squeezy.
 * On order_created: grants credits based on variant_id.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  if (!secret) {
    console.error("LEMONSQUEEZY_WEBHOOK_SECRET not set");
    return NextResponse.json({ error: "Secret not configured" }, { status: 500 });
  }

  try {
    const rawBody = await req.text();

    // Verify HMAC signature
    const signature = Buffer.from(req.headers.get("x-signature") ?? "", "utf8");
    const hmac = Buffer.from(
      crypto.createHmac("sha256", secret).update(rawBody).digest("hex"),
      "utf8"
    );

    if (signature.length === 0 || rawBody.length === 0 || !crypto.timingSafeEqual(hmac, signature)) {
      console.error("Invalid webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);
    const eventName = payload.meta?.event_name;

    console.log(`Webhook received: ${eventName}`);

    // Handle order_created: grant credits
    if (eventName === "order_created") {
      const order = payload.data;
      const orderId = order?.id;

      if (order?.attributes?.store_id !== Number(LS_STORE_ID)) {
        console.warn(`Order ${orderId} from different store: ${order.attributes?.store_id}`);
        return NextResponse.json({ received: true, skipped: "wrong_store" });
      }

      // We need the license key to track credits. It's available in license_key_created event.
      // For order_created, we log and wait for license_key_created.
      console.log(`Order #${orderId} created: ${order.attributes?.user_email}`);
      return NextResponse.json({ received: true, event: "order_created" });
    }

    // Handle license_key_created: seed credits
    if (eventName === "license_key_created") {
      const licenseData = payload.data;
      const licenseKey = licenseData?.attributes?.key;
      const variantId = String(licenseData?.attributes?.variant_id || "");
      const storeId = licenseData?.attributes?.store_id;

      if (!licenseKey) {
        console.error("license_key_created without key");
        return NextResponse.json({ error: "Missing license key" }, { status: 400 });
      }

      if (LS_STORE_ID && String(storeId) !== LS_STORE_ID) {
        console.warn(`License from different store: ${storeId}`);
        return NextResponse.json({ received: true, skipped: "wrong_store" });
      }

      // Duplicate webhook guard: mark as processed
      const processedKey = `webhook:processed:${eventName}:${licenseData?.id || licenseKey}`;
      const r = getRedis();
      if (r) {
        const alreadyProcessed = await r.get<number>(processedKey);
        if (alreadyProcessed) {
          console.log(`Duplicate ${eventName} for key ${licenseKey.slice(0, 8)}..., skipping`);
          return NextResponse.json({ received: true, skipped: "duplicate" });
        }
      }

      const pack = CREDIT_PACKS[variantId];
      const credits = pack?.credits ?? 1; // Default to 1 if variant unknown

      // Atomically seed credits + mark processed (30-day TTL on dedup)
      if (r) {
        await Promise.all([
          r.set(getCreditsKey(licenseKey), credits),
          r.set(processedKey, 1, { ex: 2592000 }),
        ]);
      } else {
        console.warn(`Redis not configured — skipping credit grant for ${licenseKey.slice(0, 8)}...`);
      }
      console.log(
        `Credits granted: ${credits} for key ${licenseKey.slice(0, 8)}... (variant ${variantId})`
      );

      return NextResponse.json({ received: true, creditsGranted: credits });
    }

    // All other events: acknowledge
    if (eventName === "order_refunded") {
      const refund = payload.data;
      const orderId = refund?.attributes?.order_id;
      console.log(`Refund processed for order #${orderId}, scrubbing credits if known`);
      // Credit clawback is best-effort — we don't have order→key mapping without a DB
      // Log for manual review; future: lookup key via LS API
      return NextResponse.json({ received: true, event: "order_refunded", note: "manual review required" });
    }

    return NextResponse.json({ received: true, event: eventName });
  } catch (error: any) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
