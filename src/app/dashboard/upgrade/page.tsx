"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { Check, X, Zap, Crown, Sparkles, Rocket, Star, QrCode } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  PLAN_FEATURES,
  PLAN_PRICES_INR,
} from "@/lib/constants";
import type { Plan } from "@/types/database";

type RazorpayResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};
type RazorpayOptions = {
  key: string; amount: number; currency: string; name: string;
  description: string; order_id: string;
  prefill: { name?: string; email?: string };
  theme: { color: string };
  handler: (r: RazorpayResponse) => void;
  modal: { ondismiss: () => void };
  method?: {
    upi?: boolean; card?: boolean; netbanking?: boolean;
    wallet?: boolean; emi?: boolean; paylater?: boolean;
  };
};
declare global {
  interface Window { Razorpay: new (o: RazorpayOptions) => { open(): void }; }
}

const PLAN_ORDER: Plan[] = ["free", "creator", "studio", "agency"];

const PLAN_DEFS = [
  {
    plan: "free" as Plan,
    name: "Free",
    scripts: "3 scripts / month",
    videos: "No video generation",
    icon: Sparkles,
    highlighted: false,
    badge: null as string | null,
  },
  {
    plan: "creator" as Plan,
    name: "Creator",
    scripts: "30 scripts / month",
    videos: "~12 videos / month",
    icon: Zap,
    highlighted: true,
    badge: "Most Popular",
  },
  {
    plan: "studio" as Plan,
    name: "Studio",
    scripts: "150 scripts / month",
    videos: "~25 videos / month",
    icon: Rocket,
    highlighted: false,
    badge: null,
  },
  {
    plan: "agency" as Plan,
    name: "Agency",
    scripts: "300 scripts / month",
    videos: "~75 videos / month",
    icon: Crown,
    highlighted: false,
    badge: null,
  },
];

const CATEGORY_LABELS: Record<string, string> = {
  limits: "Usage",
  scripts: "Script Generation",
  media: "AI Media",
  account: "Account",
};

export default function UpgradePage() {
  const router = useRouter();
  const supabase = createClient();

  const [currentPlan, setCurrentPlan] = useState<Plan>("free");
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState<string | null>(null);
  const [processingPlan, setProcessingPlan] = useState<Plan | null>(null);
  const [processingUPI, setProcessingUPI] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const { data: profile } = await supabase
        .from("users").select("plan, full_name").eq("id", user.id).single();
      setCurrentPlan((profile?.plan ?? "free") as Plan);
      setUserEmail(user.email ?? "");
      setUserName((profile as { full_name?: string | null } | null)?.full_name ?? null);
      setLoading(false);
    }
    loadProfile();
  }, [supabase, router]);

  async function handleUpgrade(targetPlan: "creator" | "studio" | "agency") {
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
      const { order_id, amount, currency, key_id } = await orderRes.json();
      const rzpKey = key_id ?? process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!;

      if (typeof window === "undefined" || !window.Razorpay) {
        toast.error("Payment system not loaded. Please refresh and try again.");
        setProcessingPlan(null);
        return;
      }

      const def = PLAN_DEFS.find(p => p.plan === targetPlan)!;
      const inrPrice = PLAN_PRICES_INR[targetPlan] ?? 0;

      const rzp = new window.Razorpay({
        key: rzpKey,
        amount,
        currency,
        name: "ScriptFlow AI",
        description: `${def.name} Plan — ₹${inrPrice}/mo`,
        order_id,
        prefill: { email: userEmail, name: userName ?? undefined },
        theme: { color: "#8B5CF6" },
        handler: async (response: RazorpayResponse) => {
          try {
            const verifyRes = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ...response, plan: targetPlan }),
            });
            if (verifyRes.ok) {
              toast.success(`You're now on the ${def.name} plan! 🎉`);
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
        modal: { ondismiss: () => setProcessingPlan(null) },
      });
      rzp.open();
    } catch {
      toast.error("Something went wrong. Please try again.");
      setProcessingPlan(null);
    }
  }

  async function handleUPIPayment(targetPlan: "creator" | "studio" | "agency") {
    setProcessingUPI(targetPlan);
    try {
      const orderRes = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: targetPlan }),
      });
      if (!orderRes.ok) {
        const err = await orderRes.json();
        toast.error(err.error ?? "Failed to create order");
        setProcessingUPI(null);
        return;
      }
      const { order_id, amount, currency, key_id } = await orderRes.json();
      const rzpKey = key_id ?? process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!;

      if (typeof window === "undefined" || !window.Razorpay) {
        toast.error("Payment system not loaded. Please refresh and try again.");
        setProcessingUPI(null);
        return;
      }

      const def = PLAN_DEFS.find(p => p.plan === targetPlan)!;
      const inrPriceUPI = PLAN_PRICES_INR[targetPlan] ?? 0;

      const rzp = new window.Razorpay({
        key: rzpKey,
        amount,
        currency,
        name: "ScriptFlow AI",
        description: `${def.name} Plan — ₹${inrPriceUPI}/mo`,
        order_id,
        prefill: { email: userEmail, name: userName ?? undefined },
        theme: { color: "#8B5CF6" },
        // Restrict to UPI only — modal opens straight to QR / UPI ID screen
        method: { upi: true, card: false, netbanking: false, wallet: false, emi: false, paylater: false },
        handler: async (response: RazorpayResponse) => {
          try {
            const verifyRes = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ...response, plan: targetPlan }),
            });
            if (verifyRes.ok) {
              toast.success(`You're now on the ${def.name} plan! 🎉`);
              router.push("/dashboard");
              router.refresh();
            } else {
              const err = await verifyRes.json();
              toast.error(err.error ?? "Payment verification failed. Contact support.");
            }
          } finally {
            setProcessingUPI(null);
          }
        },
        modal: { ondismiss: () => setProcessingUPI(null) },
      });
      rzp.open();
    } catch {
      toast.error("Something went wrong. Please try again.");
      setProcessingUPI(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const currentIdx = PLAN_ORDER.indexOf(currentPlan);

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />

      <div className="space-y-8 max-w-6xl">
        <div>
          <h1 className="text-2xl font-bold">Upgrade Your Plan</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Secure payments via Razorpay · Pay with UPI / QR Code, Cards, Net Banking &amp; Wallets
          </p>
        </div>


        {/* Plan cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {PLAN_DEFS.map((def) => {
            const isCurrent = currentPlan === def.plan;
            const targetIdx = PLAN_ORDER.indexOf(def.plan);
            const isUpgrade = targetIdx > currentIdx;
            const inrPrice = PLAN_PRICES_INR[def.plan] ?? 0;

            return (
              <div key={def.plan} className={cn(
                "relative rounded-2xl border p-5 flex flex-col",
                isCurrent && "border-primary/50 bg-primary/5",
                !isCurrent && def.highlighted && "border-violet-500/50 bg-violet-950/20",
                !isCurrent && !def.highlighted && "border-border bg-card"
              )}>
                {/* Badge */}
                {(isCurrent || def.badge) && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap">
                    {isCurrent ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold text-white bg-green-600 shadow">
                        ✓ Current Plan
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-blue-600 shadow-lg">
                        <Star className="size-3" /> {def.badge}
                      </span>
                    )}
                  </div>
                )}

                <div className="mb-4 mt-2">
                  <div className="flex items-center gap-2 mb-2">
                    <def.icon className={cn("size-5", def.highlighted ? "text-violet-400" : "text-muted-foreground")} />
                    <h3 className="text-lg font-bold">{def.name}</h3>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-bold">
                      {inrPrice === 0 ? "Free" : `₹${inrPrice.toLocaleString("en-IN")}`}
                    </span>
                    {inrPrice > 0 && <span className="text-muted-foreground text-sm">/mo</span>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{def.scripts}</p>
                  <p className="text-xs text-muted-foreground">{def.videos}</p>
                </div>

                <div className={cn("h-px mb-4", def.highlighted
                  ? "bg-gradient-to-r from-transparent via-violet-500/50 to-transparent"
                  : "bg-border"
                )} />

                {/* Features */}
                <div className="flex-1 space-y-4 mb-5">
                  {(["scripts", "media", "account"] as const).map((cat) => (
                    <div key={cat}>
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-1.5">
                        {CATEGORY_LABELS[cat]}
                      </p>
                      <ul className="space-y-1.5">
                        {PLAN_FEATURES.filter(f => f.category === cat).map((feat) => {
                          const val = feat[def.plan as keyof typeof feat] as boolean | string;
                          const isTrue = val === true || typeof val === 'string';
                          return (
                            <li key={feat.label} className="flex items-start gap-2 text-xs">
                              {isTrue
                                ? <Check className={cn("size-3.5 mt-0.5 shrink-0", def.highlighted ? "text-violet-400" : "text-emerald-500")} />
                                : <X className="size-3.5 mt-0.5 shrink-0 text-muted-foreground/30" />
                              }
                              <span className={isTrue ? "text-foreground" : "text-muted-foreground/40"}>
                                {feat.label}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <button
                  disabled={!isUpgrade || processingPlan !== null || processingUPI !== null}
                  onClick={() => isUpgrade && def.plan !== "free"
                    ? handleUpgrade(def.plan as "creator" | "studio" | "agency")
                    : undefined
                  }
                  className={cn(
                    "w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200",
                    isCurrent && "bg-muted text-muted-foreground cursor-default",
                    !isCurrent && isUpgrade && def.highlighted &&
                      "bg-gradient-to-r from-violet-600 to-blue-600 text-white hover:from-violet-500 hover:to-blue-500 shadow-lg shadow-violet-500/30 disabled:opacity-60 disabled:cursor-not-allowed",
                    !isCurrent && isUpgrade && !def.highlighted &&
                      "border border-border bg-background text-foreground hover:bg-accent disabled:opacity-60 disabled:cursor-not-allowed",
                    !isCurrent && !isUpgrade &&
                      "bg-muted text-muted-foreground cursor-default opacity-50"
                  )}
                >
                  {isCurrent ? "Current Plan"
                    : processingPlan === def.plan ? "Processing…"
                    : isUpgrade ? `Upgrade to ${def.name}`
                    : def.plan === "free" ? "Free Plan"
                    : "Lower Plan"}
                </button>

                {/* UPI / QR Code button */}
                {isUpgrade && def.plan !== "free" && (
                  <button
                    disabled={processingPlan !== null || processingUPI !== null}
                    onClick={() => handleUPIPayment(def.plan as "creator" | "studio" | "agency")}
                    className="w-full mt-2 rounded-xl px-4 py-2 text-xs font-medium flex items-center justify-center gap-1.5 border border-dashed border-white/10 text-zinc-400 hover:text-white hover:border-violet-500/40 hover:bg-violet-500/5 transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <QrCode className="size-3.5" />
                    {processingUPI === def.plan ? "Opening UPI…" : "Pay via UPI / QR Code"}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <p className="text-center text-sm text-muted-foreground">
          7-day money-back guarantee · Cancel anytime
        </p>
      </div>
    </>
  );
}
