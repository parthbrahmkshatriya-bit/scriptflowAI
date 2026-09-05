"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { toast } from "sonner";
import { CREDIT_PACKS, CREDITS_PER_PACK_VIDEO } from "@/lib/constants";
import type { CreditPack } from "@/lib/constants";

interface Props {
  /** Current credit balance. */
  creditBalance: number;
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && (window as unknown as Record<string, unknown>).Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function BuyCreditsClient({ creditBalance }: Props) {
  const router = useRouter();
  const [loadingPack, setLoadingPack] = useState<string | null>(null);
  const [balance, setBalance] = useState(creditBalance);

  async function handleBuy(pack: CreditPack) {
    setLoadingPack(pack.id);
    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) { toast.error("Failed to load Razorpay. Please try again."); return; }

      const res = await fetch("/api/credits/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pack_id: pack.id }),
      });
      const order = await res.json() as {
        order_id: string; amount: number; currency: string; key_id: string; error?: string;
      };
      if (!res.ok) { toast.error(order.error ?? "Order creation failed"); return; }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rzp = new (window as any).Razorpay({
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        name: "ScriptFlow AI",
        description: `${pack.videos * CREDITS_PER_PACK_VIDEO} credits — ${pack.label}`,
        order_id: order.order_id,
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          const verify = await fetch("/api/credits/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              pack_id: pack.id,
            }),
          });
          const result = await verify.json() as { success?: boolean; new_balance?: number; error?: string };
          if (result.success) {
            setBalance(result.new_balance ?? balance + pack.videos * CREDITS_PER_PACK_VIDEO);
            toast.success(`${pack.videos * CREDITS_PER_PACK_VIDEO} credits added to your account!`);
            router.refresh();
          } else {
            toast.error(result.error ?? "Payment verification failed");
          }
        },
        prefill: {},
        theme: { color: "#7c3aed" },
      });
      rzp.open();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoadingPack(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Current balance */}
      <div className="flex items-center gap-4 p-4 rounded-xl border border-white/[0.08] bg-white/[0.03]">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">Credit balance</p>
          <p className="text-3xl font-bold">{balance}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            A render costs 4 credits and up, depending on model, length and resolution.
            Purchased credits never expire.
          </p>
        </div>
      </div>

      {/* Pack cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {CREDIT_PACKS.map((pack) => {
          // Packs are still priced per video; a render is charged in credits.
          // Showing both keeps the pack comparable to the old pricing while
          // matching what actually gets deducted.
          const packCredits = pack.videos * CREDITS_PER_PACK_VIDEO;
          const perCredit = `₹${(pack.inrPaise / 100 / packCredits).toFixed(1)}/credit`;
          return (
            <Card
              key={pack.id}
              className={`relative border-white/[0.08] bg-white/[0.03] hover:border-violet-500/40 transition-colors ${pack.badge ? "border-violet-500/30" : ""}`}
            >
              {pack.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-violet-600 text-white text-[10px] px-2">{pack.badge}</Badge>
                </div>
              )}
              <CardHeader className="pb-2 pt-5 px-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{pack.label}</p>
                <p className="text-3xl font-bold mt-1">
                  {packCredits} <span className="text-base font-normal text-muted-foreground">credits</span>
                </p>
                <p className="text-2xl font-bold text-white mt-1">{pack.inrDisplay}</p>
                <p className="text-xs text-muted-foreground">
                  {perCredit} · about {Math.floor(packCredits / 4)} standard renders
                </p>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <Button
                  className="w-full"
                  variant={pack.badge ? "default" : "outline"}
                  onClick={() => handleBuy(pack)}
                  disabled={loadingPack === pack.id}
                >
                  {loadingPack === pack.id ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin w-3 h-3 border border-current border-t-transparent rounded-full" />
                      Processing…
                    </span>
                  ) : (
                    "Buy Now"
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground">
        Credits never expire and are applied automatically after your monthly quota runs out.
        Pay via UPI, cards, net banking, or PayPal — all through Razorpay&apos;s secure checkout.
      </p>
    </div>
  );
}
