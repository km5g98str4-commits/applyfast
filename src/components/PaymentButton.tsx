"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { CreditCard, ExternalLink } from "lucide-react";
import { toast } from "sonner";

// These will be set after Ziyad creates Lemon Squeezy store
const LEMON_SQUEEZY_SINGLE = process.env.NEXT_PUBLIC_LEMON_SQUEEZY_SINGLE_URL || "#";
const LEMON_SQUEEZY_PACK = process.env.NEXT_PUBLIC_LEMON_SQUEEZY_PACK_URL || "#";
const HAS_LEMON_SQUEEZY = LEMON_SQUEEZY_SINGLE !== "#";

export function PaymentSection({ remaining }: { remaining: number | null }) {
  const [open, setOpen] = useState(false);

  const buySingle = () => {
    if (HAS_LEMON_SQUEEZY) {
      window.open(LEMON_SQUEEZY_SINGLE, "_blank");
    } else {
      toast.info("Payment coming soon! Check back in a few hours.");
    }
  };

  const buyPack = () => {
    if (HAS_LEMON_SQUEEZY) {
      window.open(LEMON_SQUEEZY_PACK, "_blank");
    } else {
      toast.info("Payment coming soon! Check back in a few hours.");
    }
  };

  if (remaining === null || remaining > 0) return null;

  return (
    <Card className="p-6 bg-slate-900/50 border-slate-800 max-w-4xl mx-auto animate-in fade-in duration-300">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-white mb-2">
          💎 Upgrade to Unlimited
        </h3>
        <p className="text-slate-400">
          You&apos;ve used all 3 free applications today. Get more instantly.
        </p>
      </div>

      {HAS_LEMON_SQUEEZY ? (
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="p-5 bg-slate-800/50 border-slate-700 hover:border-emerald-500/50 transition-colors">
            <div className="text-center">
              <p className="text-white font-semibold mb-1">
                Single Application
              </p>
              <p className="text-3xl font-bold text-emerald-400 mb-3">$3</p>
              <Button
                onClick={buySingle}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Buy Now
              </Button>
              <p className="text-xs text-slate-500 mt-2">
                One-time · 24h access after payment
              </p>
            </div>
          </Card>

          <Card className="p-5 bg-slate-800/50 border-slate-700 ring-1 ring-emerald-500/30 hover:border-emerald-500/50 transition-colors relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-emerald-600 text-white text-xs px-3 py-0.5 rounded-bl-lg font-medium">
              Best Value
            </div>
            <div className="text-center">
              <p className="text-white font-semibold mb-1">5-Pack</p>
              <p className="text-3xl font-bold text-emerald-400 mb-1">$9</p>
              <p className="text-xs text-slate-500 mb-3 line-through">$15</p>
              <Button
                onClick={buyPack}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Buy Now
              </Button>
              <p className="text-xs text-slate-500 mt-2">
                Save 40% · No expiration
              </p>
            </div>
          </Card>
        </div>
      ) : (
        <div className="text-center p-6">
          <p className="text-slate-400 mb-4">
            🏗️ Automated payment is being set up right now.
          </p>
          <p className="text-sm text-slate-500">
            Want early access? DM us — we&apos;ll process your order manually.
          </p>
        </div>
      )}

      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
        <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
        Secure payment via Lemon Squeezy
      </div>
    </Card>
  );
}
