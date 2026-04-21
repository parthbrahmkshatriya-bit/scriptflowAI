"use client"

import { useState } from "react"
import Link from "next/link"
import { Check, Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import { AnimateOnScroll } from "@/components/landing/AnimateOnScroll"

const plans = [
  {
    name: "Free",
    priceUSD: 0,
    priceINR: 0,
    scripts: "3 scripts / month",
    badge: null,
    highlighted: false,
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
    priceUSD: 9,
    priceINR: 199,
    scripts: "30 scripts / month",
    badge: "Most Popular",
    highlighted: true,
    cta: "Start Creating",
    href: "/signup?plan=creator",
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
    priceUSD: 19,
    priceINR: 499,
    scripts: "Unlimited scripts",
    badge: null,
    highlighted: false,
    cta: "Go Pro",
    href: "/signup?plan=pro",
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
]

export function PricingSection() {
  const [currency, setCurrency] = useState<"USD" | "INR">("USD")

  return (
    <section id="pricing" className="py-28 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-pink-950/6 to-transparent pointer-events-none" />

      <div className="max-w-6xl mx-auto">
        <AnimateOnScroll className="text-center mb-14">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-pink-500/40 bg-pink-500/10 px-3 py-1 text-sm text-pink-400 mb-4">
            Pricing
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-white">
            Simple, transparent pricing
          </h2>
          <p className="text-zinc-400 text-lg max-w-xl mx-auto mb-8">
            Start for free. Upgrade when you&apos;re ready to scale your content
            creation.
          </p>

          {/* Pill toggle */}
          <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 p-1 gap-0.5">
            {(["USD", "INR"] as const).map((c) => (
              <button
                key={c}
                onClick={() => setCurrency(c)}
                className={cn(
                  "px-5 py-2 rounded-full text-sm font-medium transition-all duration-200",
                  currency === c
                    ? "bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-lg shadow-violet-500/30"
                    : "text-zinc-500 hover:text-zinc-300"
                )}
              >
                {c === "USD" ? "USD ($)" : "INR (₹)"}
              </button>
            ))}
          </div>
        </AnimateOnScroll>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {plans.map((plan, i) => (
            <AnimateOnScroll key={plan.name} delay={i * 110}>
              {plan.highlighted ? (
                /* ── Creator card: animated rotating gradient border + float ── */
                <div className="animated-grad-border p-[1.5px] rounded-[1.1rem] animate-float-bob">
                  <div className="relative flex flex-col rounded-[calc(1.1rem-1.5px)] bg-[#0d0a1e] p-7 h-full">
                    {/* Most Popular badge */}
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                      <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-blue-600 shadow-lg shadow-violet-500/40">
                        <Zap className="size-3" />
                        {plan.badge}
                      </div>
                    </div>

                    <PlanCardContent plan={plan} currency={currency} highlighted />
                  </div>
                </div>
              ) : (
                /* ── Free / Pro cards ── */
                <div className="relative flex flex-col rounded-2xl border border-white/8 bg-white/[0.03] p-7 hover:border-white/16 hover:bg-white/[0.05] transition-all duration-300">
                  <PlanCardContent plan={plan} currency={currency} highlighted={false} />
                </div>
              )}
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

/* ── Shared card content ─────────────────────────────────────────── */
function PlanCardContent({
  plan,
  currency,
  highlighted,
}: {
  plan: (typeof plans)[number]
  currency: "USD" | "INR"
  highlighted: boolean
}) {
  return (
    <>
      {/* Plan name + price */}
      <div className="mb-6 mt-2">
        <h3 className="text-lg font-bold text-white mb-3">{plan.name}</h3>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold tracking-tight text-white">
            {currency === "USD" ? `$${plan.priceUSD}` : `₹${plan.priceINR}`}
          </span>
          {plan.priceUSD > 0 && (
            <span className="text-zinc-500 text-sm">/month</span>
          )}
        </div>
        <p className="text-zinc-500 text-sm mt-1">{plan.scripts}</p>
      </div>

      {/* Divider */}
      <div
        className={cn(
          "h-px mb-6",
          highlighted
            ? "bg-gradient-to-r from-transparent via-violet-500/50 to-transparent"
            : "bg-white/8"
        )}
      />

      {/* Features */}
      <ul className="space-y-3 flex-1 mb-7">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5 text-sm">
            <Check
              className={cn(
                "size-4 mt-0.5 shrink-0",
                highlighted ? "text-violet-400" : "text-zinc-400"
              )}
            />
            <span className="text-zinc-300">{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <Link
        href={plan.href}
        className={cn(
          "w-full inline-flex items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200",
          highlighted
            ? "bg-gradient-to-r from-violet-600 to-blue-600 text-white hover:from-violet-500 hover:to-blue-500 shadow-lg shadow-violet-500/30 hover:shadow-violet-500/55"
            : "border border-white/15 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white hover:border-white/25"
        )}
      >
        {plan.cta}
      </Link>
    </>
  )
}
