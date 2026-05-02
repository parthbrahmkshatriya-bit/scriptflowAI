"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { Check, Zap, Crown, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Plan } from "@/types/database";

/* ── Razorpay global type ── */
type RazorpayResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: { name?: string; email?: string };
  theme: { color: string };
  handler: (response: RazorpayResponse) => void;
  modal: { ondismiss: () => void };
};

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => { open(): void };
  }
}

/* ── Plan data ── */
const planCards = [
  {
    plan: "free" as Plan,
    name: "Free",
    priceINR: 0,
    scripts: "3 scripts / month",
    icon: Sparkles,
    highlighted: false,
    badge: null as string | null,
    features: [
      "3 script generations / month",
      "All platforms & visual styles",
      "15s, 30s & 60s durations",
      "Basic AI generation prompts",
    ],
  },
  {
    plan: "creator" as Plan,
    name: "Creator",
    priceINR: 999,
    scripts: "30 scripts / month",
    icon: Zap,
    highlighted: true,
    badge: "Most Popular",
    features: [
      "30 script generations / month",
      "Tool-specific prompt formatting",
      "All platforms & visual styles",
      "Script history & favorites",
      "Share scripts publicly",
      "Export as text",
    ],
  },
  {
    plan: "pro" as Plan,
    name: "Pro",
    priceINR: 1999,
    scripts: "Unlimited scripts",
    icon: Crown,
    highlighted: false,
    badge: null as string | null,
    features: [
      "Unlimited script generations",
      "Everything in Creator",
      "Script remix & variations",
      "Trending hooks library",
      "Priority AI generation",
      "Export as PDF",
    ],
  },
];

export default function UpgradePage() {
  const router = useRouter();
  const supabase = createClient();

  const [currentPlan, setCurrentPlan] = useState<Plan>("free");
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState<string | null>(null);
  const [processingPlan, setProcessingPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      const { data: profile } = await supabase
        .from("users")
        .select("plan, full_name")
        .eq("id", user.id)
        .single();

      setCurrentPlan((profile?.plan ?? "free") as Plan);
      setUserEmail(user.email ?? "");
      setUserName((profile as { full_name?: string | null } | null)?.full_name ?? null);
      setLoading(false);
    }
    loadProfile();
  }, [supabase, router]);

  async function handleUpgrade(targetPlan: "creator" | "pro") {
    setProcessingPlan(targetPlan);
    try {
      const orderRes = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: targetPlan }),
      });

      if (!orderRes.ok) {
        const err = await orderRes.json();
        toast.error(err.error ?? "Failed to create order");
        setProcessingPlan(null);
        return;
      }

      const { order_id, amount, currency } = await orderRes.json();

      if (typeof window === "undefined" || !window.Razorpay) {
        toast.error("Payment system not loaded. Please refresh and try again.");
        setProcessingPlan(null);
        return;
      }

      const planLabel = targetPlan === "creator" ? "Creator" : "Pro";
      const priceLabel = targetPlan === "creator" ? "999" : "1,999";

      const rzp = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount,
        currency,
        name: "ScriptFlow AI",
        description: `${planLabel} Plan — ₹${priceLabel}/month`,
        order_id,
        prefill: {
          email: userEmail,
          name: userName ?? undefined,
        },
        theme: { color: "#8B5CF6" },
        handler: async (response) => {
          try {
            const verifyRes = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ...response, plan: targetPlan }),
            });

            if (verifyRes.ok) {
              toast.success(`You're now on the ${planLabel} plan! 🎉`);
              router.push("/dashboard");
              router.refresh();
            } else {
              const err = await verifyRes.json();
              toast.error(err.error ?? "Payment verification failed. Contact support.");
            }
          } finally {
            setProcessingPlan(null);
          }
        },
        modal: {
          ondismiss: () => setProcessingPlan(null),
        },
      });

      rzp.open();
    } catch {
      toast.error("Something went wrong. Please try again.");
      setProcessingPlan(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
      />

      <div className="space-y-8 max-w-4xl">
        <div>
          <h1 className="text-2xl font-bold">Upgrade Your Plan</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Get more scripts and unlock all features. Secure payments via Razorpay.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {planCards.map((card) => {
            const isCurrent = currentPlan === card.plan;
            const isUpgrade =
              (card.plan === "creator" && currentPlan === "free") ||
              (card.plan === "pro" && currentPlan !== "pro");

            return (
              <div
                key={card.plan}
                className={cn(
                  "relative rounded-2xl border p-6 flex flex-col",
                  isCurrent && "border-primary/50 bg-primary/5",
                  !isCurrent && card.highlighted && "border-violet-500/50 bg-violet-950/20",
                  !isCurrent && !card.highlighted && "border-border bg-card"
                )}
              >
                {/* Badge: Current Plan takes priority over Most Popular */}
                {(isCurrent || card.badge) && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    {isCurrent ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold text-white bg-green-600 shadow">
                        ✓ Current Plan
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-blue-600 shadow-lg shadow-violet-500/30">
                        <Zap className="size-3" />
                        {card.badge}
                      </span>
                    )}
                  </div>
                )}

                {/* Plan name + price */}
                <div className="mb-5 mt-2">
                  <div className="flex items-center gap-2 mb-2">
                    <card.icon
                      className={cn(
                        "size-5",
                        card.highlighted ? "text-violet-400" : "text-muted-foreground"
                      )}
                    />
                    <h3 className="text-lg font-bold">{card.name}</h3>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">
                      {card.priceINR === 0 ? "Free" : `₹${card.priceINR}`}
                    </span>
                    {card.priceINR > 0 && (
                      <span className="text-muted-foreground text-sm">/month</span>
                    )}
                  </div>
                  <p className="text-muted-foreground text-sm mt-1">{card.scripts}</p>
                </div>

                {/* Divider */}
                <div
                  className={cn(
                    "h-px mb-5",
                    card.highlighted
                      ? "bg-gradient-to-r from-transparent via-violet-500/50 to-transparent"
                      : "bg-border"
                  )}
                />

                {/* Features */}
                <ul className="space-y-2.5 flex-1 mb-6">
                  {card.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check
                        className={cn(
                          "size-4 mt-0.5 shrink-0",
                          card.highlighted ? "text-violet-400" : "text-muted-foreground"
                        )}
                      />
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA button */}
                <button
                  disabled={!isUpgrade || processingPlan !== null}
                  onClick={() =>
                    isUpgrade && card.plan !== "free"
                      ? handleUpgrade(card.plan as "creator" | "pro")
                      : undefined
                  }
                  className={cn(
                    "w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200",
                    isCurrent &&
                      "bg-muted text-muted-foreground cursor-default",
                    !isCurrent &&
                      isUpgrade &&
                      card.highlighted &&
                      "bg-gradient-to-r from-violet-600 to-blue-600 text-white hover:from-violet-500 hover:to-blue-500 shadow-lg shadow-violet-500/30 disabled:opacity-60 disabled:cursor-not-allowed",
                    !isCurrent &&
                      isUpgrade &&
                      !card.highlighted &&
                      "border border-border bg-background text-foreground hover:bg-accent disabled:opacity-60 disabled:cursor-not-allowed",
                    !isCurrent &&
                      !isUpgrade &&
                      card.plan !== "free" &&
                      "bg-muted text-muted-foreground cursor-default"
                  )}
                >
                  {isCurrent
                    ? "Current Plan"
                    : processingPlan === card.plan
                    ? "Processing…"
                    : isUpgrade
                    ? `Upgrade to ${card.name}`
                    : card.plan === "free"
                    ? "Free Plan"
                    : "Current or Lower Plan"}
                </button>
              </div>
            );
          })}
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Secure payments via Razorpay · UPI, Cards, Net Banking & Wallets accepted ·
          7-day money-back guarantee
        </p>
      </div>
    </>
  );
}
