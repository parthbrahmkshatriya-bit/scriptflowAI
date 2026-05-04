import Link from "next/link"
import { Check, Zap, Rocket, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { AnimateOnScroll } from "@/components/landing/AnimateOnScroll"
import {
  EARLY_BIRD_ACTIVE,
  EARLY_BIRD_TOTAL,
  EARLY_BIRD_CLAIMED,
  EARLY_BIRD_PRICING,
  REGULAR_PRICING,
} from "@/lib/constants"

/* ── Spots remaining helper ─────────────────────────────────────── */
const spotsRemaining = EARLY_BIRD_TOTAL - EARLY_BIRD_CLAIMED

/* ── Plan definitions ────────────────────────────────────────────── */
const plans = [
  {
    name: "Free",
    regularUSD: 0,
    regularINR: 0,
    earlyUSD: 0,
    earlyINR: 0,
    scripts: "3 scripts / month",
    badge: null as string | null,
    launchBadge: false,
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
    regularUSD: REGULAR_PRICING.creator.usd,
    regularINR: REGULAR_PRICING.creator.inr,
    earlyUSD: EARLY_BIRD_PRICING.creator.usd,
    earlyINR: EARLY_BIRD_PRICING.creator.inr,
    scripts: "30 scripts / month",
    badge: "Most Popular",
    launchBadge: true,
    highlighted: true,
    cta: "Claim Launch Price",
    href: "/dashboard/upgrade",
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
    regularUSD: REGULAR_PRICING.pro.usd,
    regularINR: REGULAR_PRICING.pro.inr,
    earlyUSD: EARLY_BIRD_PRICING.pro.usd,
    earlyINR: EARLY_BIRD_PRICING.pro.inr,
    scripts: "Unlimited scripts",
    badge: null,
    launchBadge: true,
    highlighted: false,
    cta: "Claim Launch Price",
    href: "/dashboard/upgrade",
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
  return (
    <section id="pricing" className="py-28 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-pink-950/6 to-transparent pointer-events-none" />

      <div className="max-w-6xl mx-auto">

        {/* ── Early-bird banner ───────────────────────────────────── */}
        {EARLY_BIRD_ACTIVE && (
          <AnimateOnScroll className="mb-10">
            {/* Animated gradient border wrapper */}
            <div className="animated-grad-border p-[1.5px] rounded-2xl max-w-2xl mx-auto">
              <div className="rounded-[calc(1rem-1.5px)] bg-[#0a0812] px-6 py-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">

                  {/* Left: icon + text */}
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-xl bg-gradient-to-br from-violet-600/30 to-pink-600/30 border border-violet-500/30 flex items-center justify-center shrink-0">
                      <Rocket className="size-4 text-violet-300" />
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

                  {/* Right: spots counter */}
                  <div className="shrink-0 text-center sm:text-right">
                    <div className="text-2xl font-bold tabular-nums text-white leading-none">
                      {spotsRemaining}
                      <span className="text-sm font-normal text-zinc-500">/{EARLY_BIRD_TOTAL}</span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-0.5">spots remaining</p>
                    {/* Mini progress bar */}
                    <div className="w-24 h-1 rounded-full bg-white/10 mt-1.5 mx-auto sm:ml-auto sm:mr-0 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-pink-500"
                        style={{ width: `${Math.max(4, (EARLY_BIRD_CLAIMED / EARLY_BIRD_TOTAL) * 100)}%` }}
                      />
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </AnimateOnScroll>
        )}

        {/* ── Section header ──────────────────────────────────────── */}
        <AnimateOnScroll className="text-center mb-14">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-pink-500/40 bg-pink-500/10 px-3 py-1 text-sm text-pink-400 mb-4">
            Pricing
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-white">
            Simple, transparent pricing
          </h2>
          <p className="text-zinc-400 text-lg max-w-xl mx-auto">
            Start for free. Upgrade when you&apos;re ready to scale your content creation.
          </p>
        </AnimateOnScroll>

        {/* ── Plan cards ─────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {plans.map((plan, i) => (
            <AnimateOnScroll key={plan.name} delay={i * 110}>
              {plan.highlighted ? (
                <div className="animated-grad-border p-[1.5px] rounded-[1.1rem] animate-float-bob">
                  <div className="relative flex flex-col rounded-[calc(1.1rem-1.5px)] bg-[#0d0a1e] p-7 h-full">
                    {/* Badge row */}
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
                      <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-blue-600 shadow-lg shadow-violet-500/40">
                        <Zap className="size-3" />
                        {plan.badge}
                      </div>
                    </div>
                    <PlanCardContent plan={plan} highlighted />
                  </div>
                </div>
              ) : (
                <div className="relative flex flex-col rounded-2xl border border-white/8 bg-white/[0.03] p-7 hover:border-white/16 hover:bg-white/[0.05] transition-all duration-300">
                  <PlanCardContent plan={plan} highlighted={false} />
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
  highlighted,
}: {
  plan: (typeof plans)[number]
  highlighted: boolean
}) {
  const showEarlyBird = EARLY_BIRD_ACTIVE && plan.regularINR > 0

  const activePrice = showEarlyBird ? plan.earlyINR : plan.regularINR
  const regularPrice = plan.regularINR
  const symbol = "₹"

  return (
    <>
      {/* Plan name */}
      <div className="mb-6 mt-2">
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-lg font-bold text-white">{plan.name}</h3>
          {showEarlyBird && plan.launchBadge && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30">
              <Rocket className="size-2.5" />
              Launch Price
            </span>
          )}
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold tracking-tight text-white">
            {plan.regularINR === 0 ? "Free" : `${symbol}${activePrice}`}
          </span>
          {plan.regularINR > 0 && (
            <span className="text-zinc-500 text-sm">/month</span>
          )}
          {/* Strikethrough regular price */}
          {showEarlyBird && plan.launchBadge && (
            <span className="text-zinc-600 text-sm line-through">
              {symbol}{regularPrice}
            </span>
          )}
        </div>

        {/* Savings callout */}
        {showEarlyBird && plan.launchBadge && (
          <p className="text-xs text-emerald-400 font-medium mt-1">
            Save ₹{plan.regularINR - plan.earlyINR}/mo · Early-bird discount
          </p>
        )}

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
