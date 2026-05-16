"use client"

import { useState } from "react"
import Link from "next/link"
import { Check, Zap, Rocket, Clock, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { AnimateOnScroll } from "@/components/landing/AnimateOnScroll"
import {
  EARLY_BIRD_ACTIVE,
  EARLY_BIRD_TOTAL,
  EARLY_BIRD_CLAIMED,
  EARLY_BIRD_PRICING,
  REGULAR_PRICING,
} from "@/lib/constants"

const spotsRemaining = EARLY_BIRD_TOTAL - EARLY_BIRD_CLAIMED

type Billing = "monthly" | "annual"

/* Annual = 17% off (pay 10 months, get 2 free) */
function annualPrice(monthly: number) {
  return Math.round((monthly * 10) / 12)
}

const plans = [
  {
    name: "Free",
    icon: null,
    regularMonthlyINR: 0,
    earlyMonthlyINR: 0,
    scripts: "3 scripts / month",
    badge: null as string | null,
    launchBadge: false,
    highlighted: false,
    tealHighlight: false,
    cta: "Get Started Free",
    href: "/signup",
    features: [
      "3 script generations / month",
      "All platforms (YouTube, Reels, TikTok)",
      "All visual styles",
      "15s, 30s & 60s durations",
      "Scene-by-scene breakdown",
      "Basic AI generation prompts",
    ],
  },
  {
    name: "Creator",
    icon: Zap,
    regularMonthlyINR: REGULAR_PRICING.creator.inr,
    earlyMonthlyINR: EARLY_BIRD_PRICING.creator.inr,
    scripts: "30 scripts / month",
    badge: "Most Popular",
    launchBadge: true,
    highlighted: true,
    tealHighlight: false,
    cta: "Claim Launch Price",
    href: "/signup",
    features: [
      "30 script generations / month",
      "All platforms & visual styles",
      "Tool-specific prompt formatting",
      "VEO 3, Kling, Runway, Pika, Midjourney",
      "Script history & favorites",
      "Share scripts publicly",
      "Export as text",
    ],
  },
  {
    name: "Pro",
    icon: Rocket,
    regularMonthlyINR: REGULAR_PRICING.pro.inr,
    earlyMonthlyINR: EARLY_BIRD_PRICING.pro.inr,
    scripts: "Unlimited scripts",
    badge: null,
    launchBadge: true,
    highlighted: false,
    tealHighlight: false,
    cta: "Claim Launch Price",
    href: "/signup",
    features: [
      "Unlimited script generations",
      "Everything in Creator",
      "Script remix & variations",
      "Trending hooks library",
      "Priority AI generation",
      "Export as PDF",
      "Early access to new features",
    ],
  },
  {
    name: "Studio",
    icon: Users,
    regularMonthlyINR: 3999,
    earlyMonthlyINR: 1999,
    scripts: "Unlimited · 5 seats",
    badge: "Coming Soon",
    launchBadge: false,
    highlighted: false,
    tealHighlight: true,
    cta: "Join Waitlist",
    href: "/signup",
    features: [
      "5 team seats included",
      "Unlimited script generations",
      "Everything in Pro",
      "White-label export",
      "Dedicated account manager",
      "Custom branding on exports",
      "Priority support queue",
    ],
  },
]

export function PricingSection() {
  const [billing, setBilling] = useState<Billing>("monthly")

  return (
    <section id="pricing" className="py-28 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#00e5c0]/[0.025] to-transparent pointer-events-none" />

      <div className="max-w-6xl mx-auto">

        {/* Early-bird banner */}
        {EARLY_BIRD_ACTIVE && (
          <AnimateOnScroll className="mb-10">
            <div className="animated-grad-border p-[1.5px] rounded-2xl max-w-2xl mx-auto">
              <div className="rounded-[calc(1rem-1.5px)] bg-[#07090f] px-6 py-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-xl bg-gradient-to-br from-[#00e5c0]/20 to-teal-600/20 border border-[#00e5c0]/30 flex items-center justify-center shrink-0">
                      <Rocket className="size-4 text-[#00e5c0]" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white leading-snug">
                        🚀 Launch Offer — First {EARLY_BIRD_TOTAL} users get special pricing!
                      </p>
                      <p className="text-xs text-zinc-400 mt-0.5 flex items-center gap-1">
                        <Clock className="size-3" />
                        Offer ends when {EARLY_BIRD_TOTAL} spots are filled
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 text-center sm:text-right">
                    <div className="text-2xl font-bold tabular-nums text-white leading-none">
                      {spotsRemaining}
                      <span className="text-sm font-normal text-zinc-500">/{EARLY_BIRD_TOTAL}</span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-0.5">spots remaining</p>
                    <div className="w-24 h-1 rounded-full bg-white/10 mt-1.5 mx-auto sm:ml-auto sm:mr-0 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#00e5c0] to-teal-400"
                        style={{ width: `${Math.max(4, (EARLY_BIRD_CLAIMED / EARLY_BIRD_TOTAL) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </AnimateOnScroll>
        )}

        {/* Header */}
        <AnimateOnScroll className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#00e5c0]/40 bg-[#00e5c0]/10 px-3 py-1 text-sm text-[#00e5c0] mb-4">
            Pricing
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-white">
            Simple, transparent pricing
          </h2>
          <p className="text-zinc-400 text-lg max-w-xl mx-auto mb-8">
            Start for free. Upgrade when you&apos;re ready to scale your content creation.
          </p>

          {/* Billing toggle */}
          <div className="inline-flex items-center gap-1 rounded-xl border border-white/[0.08] bg-white/[0.04] p-1">
            <button
              onClick={() => setBilling("monthly")}
              className={cn(
                "px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200",
                billing === "monthly"
                  ? "bg-white/10 text-white shadow-sm"
                  : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling("annual")}
              className={cn(
                "px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1.5",
                billing === "annual"
                  ? "bg-[#00e5c0]/20 text-[#00e5c0] shadow-sm"
                  : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              Annual
              <span className="text-[10px] font-bold bg-[#00e5c0]/20 text-[#00e5c0] border border-[#00e5c0]/30 rounded px-1.5 py-0.5">
                Save 17%
              </span>
            </button>
          </div>
        </AnimateOnScroll>

        {/* Plan cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
          {plans.map((plan, i) => (
            <AnimateOnScroll key={plan.name} delay={i * 80}>
              <PlanCard plan={plan} billing={billing} />
            </AnimateOnScroll>
          ))}
        </div>

        <p className="text-center text-sm text-zinc-600 mt-10">
          All plans include a 7-day money-back guarantee. No questions asked.
        </p>
      </div>
    </section>
  )
}

function PlanCard({
  plan,
  billing,
}: {
  plan: (typeof plans)[number]
  billing: Billing
}) {
  const showEarlyBird = EARLY_BIRD_ACTIVE && plan.regularMonthlyINR > 0 && !plan.tealHighlight
  const baseMonthly = showEarlyBird ? plan.earlyMonthlyINR : plan.regularMonthlyINR
  const displayPrice = billing === "annual" && baseMonthly > 0 ? annualPrice(baseMonthly) : baseMonthly
  const regularDisplay = billing === "annual" && plan.regularMonthlyINR > 0
    ? annualPrice(plan.regularMonthlyINR)
    : plan.regularMonthlyINR
  const Icon = plan.icon

  if (plan.tealHighlight) {
    return (
      <div
        className="relative flex flex-col rounded-2xl p-[1.5px] h-full"
        style={{
          background: "linear-gradient(135deg, #00e5c0 0%, #00b89c 50%, #007a68 100%)",
          boxShadow: "0 0 40px -10px rgba(0,229,192,0.4)",
        }}
      >
        <div className="relative flex flex-col rounded-[calc(1rem-1.5px)] bg-[#07090f] p-6 h-full">
          <CardInner plan={plan} displayPrice={displayPrice} regularDisplay={regularDisplay} showEarlyBird={showEarlyBird} billing={billing} Icon={Icon} isTeal />
        </div>
      </div>
    )
  }

  if (plan.highlighted) {
    return (
      <div className="animated-grad-border p-[1.5px] rounded-[1.1rem] h-full animate-float-bob">
        <div className="relative flex flex-col rounded-[calc(1.1rem-1.5px)] bg-[#0d0a1e] p-6 h-full">
          {plan.badge && (
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
              <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-blue-600 shadow-lg shadow-violet-500/40">
                <Zap className="size-3" />
                {plan.badge}
              </div>
            </div>
          )}
          <CardInner plan={plan} displayPrice={displayPrice} regularDisplay={regularDisplay} showEarlyBird={showEarlyBird} billing={billing} Icon={Icon} isHighlighted />
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex flex-col rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 h-full hover:border-white/[0.14] hover:bg-white/[0.05] transition-all duration-300">
      <CardInner plan={plan} displayPrice={displayPrice} regularDisplay={regularDisplay} showEarlyBird={showEarlyBird} billing={billing} Icon={Icon} />
    </div>
  )
}

function CardInner({
  plan,
  displayPrice,
  regularDisplay,
  showEarlyBird,
  billing,
  Icon,
  isHighlighted = false,
  isTeal = false,
}: {
  plan: (typeof plans)[number]
  displayPrice: number
  regularDisplay: number
  showEarlyBird: boolean
  billing: Billing
  Icon: React.ElementType | null
  isHighlighted?: boolean
  isTeal?: boolean
}) {
  const checkColor = isTeal ? "text-[#00e5c0]" : isHighlighted ? "text-violet-400" : "text-zinc-400"

  return (
    <>
      <div className="mb-5 mt-1">
        <div className="flex items-center gap-2 mb-3">
          {Icon && (
            <div className={cn(
              "size-7 rounded-lg flex items-center justify-center",
              isTeal ? "bg-[#00e5c0]/20 text-[#00e5c0]" : isHighlighted ? "bg-violet-500/20 text-violet-400" : "bg-white/10 text-zinc-400"
            )}>
              <Icon className="size-4" />
            </div>
          )}
          <h3 className="text-base font-bold text-white">{plan.name}</h3>
          {plan.tealHighlight && plan.badge && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold text-[#00e5c0] bg-[#00e5c0]/15 border border-[#00e5c0]/30">
              {plan.badge}
            </span>
          )}
          {showEarlyBird && plan.launchBadge && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30">
              <Rocket className="size-2.5" />
              Launch
            </span>
          )}
        </div>

        <div className="flex items-baseline gap-1.5 mb-1">
          <span className="text-3xl font-bold tracking-tight text-white">
            {plan.regularMonthlyINR === 0 ? "Free" : `₹${displayPrice}`}
          </span>
          {plan.regularMonthlyINR > 0 && (
            <span className="text-zinc-500 text-xs">
              /mo{billing === "annual" ? " · billed annually" : ""}
            </span>
          )}
          {showEarlyBird && plan.launchBadge && billing === "monthly" && (
            <span className="text-zinc-600 text-xs line-through">₹{regularDisplay}</span>
          )}
        </div>

        {showEarlyBird && plan.launchBadge && (
          <p className="text-xs text-emerald-400 font-medium mb-1">
            Save ₹{plan.regularMonthlyINR - plan.earlyMonthlyINR}/mo early-bird discount
          </p>
        )}

        <p className="text-zinc-500 text-xs">{plan.scripts}</p>
      </div>

      <div className={cn(
        "h-px mb-5",
        isTeal
          ? "bg-gradient-to-r from-transparent via-[#00e5c0]/40 to-transparent"
          : isHighlighted
          ? "bg-gradient-to-r from-transparent via-violet-500/50 to-transparent"
          : "bg-white/[0.07]"
      )} />

      <ul className="space-y-2.5 flex-1 mb-6">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-xs">
            <Check className={cn("size-3.5 mt-0.5 shrink-0", checkColor)} />
            <span className="text-zinc-300">{f}</span>
          </li>
        ))}
      </ul>

      <Link
        href={plan.href}
        className={cn(
          "w-full inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200",
          isTeal
            ? "bg-[#00e5c0] text-black hover:bg-[#00ccaa] shadow-[0_4px_20px_-4px_rgba(0,229,192,0.5)] hover:shadow-[0_4px_24px_-2px_rgba(0,229,192,0.7)]"
            : isHighlighted
            ? "bg-gradient-to-r from-violet-600 to-blue-600 text-white hover:from-violet-500 hover:to-blue-500 shadow-lg shadow-violet-500/30"
            : "border border-white/15 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white hover:border-white/25"
        )}
      >
        {plan.cta}
      </Link>
    </>
  )
}
