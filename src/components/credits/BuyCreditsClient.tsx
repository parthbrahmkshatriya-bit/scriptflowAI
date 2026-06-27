"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { toast } from "sonner";
import { CREDIT_PACKS, VIDEO_LIMITS } from "@/lib/constants";
import type { CreditPack } from "@/lib/constants";

interface Props {
  videoCredits: number;
  plan: string;
  videosUsed: number;
  paypalClientId: string;
}

type PayMethod = "razorpay" | "paypal";

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function BuyCreditsClient({ videoCredits, plan, videosUsed, paypalClientId }: Props) {
  const router = useRouter();
  const [method, setMethod] = useState<PayMethod>("razorpay");
  const [loadingPack, setLoadingPack] = useState<string | null>(null);
  const [balance, setBalance] = useState(videoCredits);

  const planLimit = VIDEO_LIMITS[plan] ?? 0;

  async function handleRazorpay(pack: CreditPack) {
    setLoadingPack(pack.id);
    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) { toast.error("Failed to load Razorpay. Please try again."); return; }

      const res = await fetch("/api/credits/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pack_id: pack.id }),
      });
      const order = await res.json() as { order_id: string; amount: number; currency: string; key_id: string; error?: string };
      if (!res.ok) { toast.error(order.error ?? "Order creation failed"); return; }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rzp = new (window as any).Razorpay({
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        name: "ScriptFlow AI",
        description: `${pack.videos} Video Credits — ${pack.label}`,
        order_id: order.order_id,
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
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
            setBalance(result.new_balance ?? balance + pack.videos);
            toast.success(`${pack.videos} video credits added to your account!`);
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
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">Video Credits</p>
          <p className="text-3xl font-bold">{balance}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {videosUsed}/{planLimit} monthly uses · {balance} paid credits · no expiry
          </p>
        </div>
      </div>

      {/* Payment method toggle */}
      <div className="flex items-center gap-1 p-1 rounded-lg bg-white/[0.04] border border-white/[0.08] w-fit">
        <button
          onClick={() => setMethod("razorpay")}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${method === "razorpay" ? "bg-violet-600 text-white shadow" : "text-zinc-400 hover:text-white"}`}
        >
          INR · Razorpay
        </button>
        <button
          onClick={() => setMethod("paypal")}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${method === "paypal" ? "bg-violet-600 text-white shadow" : "text-zinc-400 hover:text-white"}`}
        >
          USD · PayPal
        </button>
      </div>

      {/* Pack cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {CREDIT_PACKS.map((pack) => {
          const priceLabel = method === "razorpay" ? pack.inrDisplay : `$${pack.usdDisplay}`;
          const perVideo = method === "razorpay"
            ? `₹${Math.round(pack.inrPaise / 100 / pack.videos)}/video`
            : `$${(pack.usdCents / 100 / pack.videos).toFixed(2)}/video`;

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
                <p className="text-3xl font-bold mt-1">{pack.videos} <span className="text-base font-normal text-muted-foreground">videos</span></p>
                <p className="text-xl font-bold text-white mt-1">{priceLabel}</p>
                <p className="text-xs text-muted-foreground">{perVideo}</p>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                {method === "razorpay" ? (
                  <Button
                    className="w-full"
                    variant={pack.badge ? "default" : "outline"}
                    onClick={() => handleRazorpay(pack)}
                    disabled={loadingPack === pack.id}
                  >
                    {loadingPack === pack.id ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin w-3 h-3 border border-current border-t-transparent rounded-full" />
                        Processing…
                      </span>
                    ) : (
                      "Buy with Razorpay"
                    )}
                  </Button>
                ) : (
                  <PayPalPackButton pack={pack} paypalClientId={paypalClientId} onSuccess={(newBalance) => { setBalance(newBalance); router.refresh(); }} />
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground">
        Credits never expire and are applied automatically after your monthly plan quota runs out.
        All payments are secure and handled by Razorpay / PayPal.
      </p>
    </div>
  );
}

function PayPalPackButton({
  pack,
  paypalClientId,
  onSuccess,
}: {
  pack: CreditPack;
  paypalClientId: string;
  onSuccess: (newBalance: number) => void;
}) {
  if (!paypalClientId) {
    return <p className="text-xs text-muted-foreground text-center py-2">PayPal not configured</p>;
  }

  return (
    <PayPalScriptProvider options={{ clientId: paypalClientId, currency: "USD" }}>
      <PayPalButtons
        style={{ layout: "vertical", shape: "rect", label: "pay", height: 36 }}
        createOrder={async () => {
          const res = await fetch("/api/credits/paypal/create-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ pack_id: pack.id }),
          });
          const data = await res.json() as { order_id: string; error?: string };
          if (!res.ok) throw new Error(data.error ?? "Order creation failed");
          return data.order_id;
        }}
        onApprove={async (data) => {
          const res = await fetch("/api/credits/paypal/capture", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ order_id: data.orderID, pack_id: pack.id }),
          });
          const result = await res.json() as { success?: boolean; new_balance?: number; error?: string };
          if (result.success) {
            toast.success(`${pack.videos} video credits added!`);
            onSuccess(result.new_balance ?? 0);
          } else {
            toast.error(result.error ?? "Payment failed");
          }
        }}
        onError={() => toast.error("PayPal error. Please try again.")}
      />
    </PayPalScriptProvider>
  );
}
