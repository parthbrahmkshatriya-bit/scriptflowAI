"use client"

import Link from "next/link"
import { Check, Zap, Rocket, Crown } from "lucide-react"
import { cn } from "@/lib/utils"
import { AnimateOnScroll } from "@/components/landing/AnimateOnScroll"
import { REGULAR_PRICING } from "@/lib/constants"

/**
 * Video counts are shown as approximate. A generation's cost depends on the
 * model and clip length, so the allowance moves to credits shortly; an exact
 * number here would be a promise the credit system will not keep.
 */
const plans = [
  {
    name: "Free",
    icon: null,
    monthlyINR: 0,
    scripts: "3 scripts / month",
    videos: "No video generation",
    badge: null as string | null,
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
    icon: Zap,
    monthlyINR: REGULAR_PRICING.creator.inr,
    scripts: "30 scripts / month",
    videos: "~12 videos / month",
    badge: "Most Popular",
    highlighted: true,
    cta: "Get Started",
    href: "/signup",
    features: [
      "30 script generations / month",
      "~12 AI video generations / month",
      "Video with native audio",
      "Turn a product photo into video",
      "All platforms & visual styles",
      "Tool-specific prompt formatting",
      "Script history & favorites",
      "Share scripts publicly",
    ],
  },
  {
    name: "Studio",
    icon: Rocket,
    monthlyINR: REGULAR_PRICING.studio.inr,
    scripts: "150 scripts / month",
    videos: "~25 videos / month",
    badge: null,
    highlighted: false,
    cta: "Get Started",
    href: "/signup",
    features: [
      "150 script generations / month",
      "~25 AI video generations / month",
      "5x the scripts of Creator",
      "Everything in Creator",
    ],
  },
  {
    name: "Agency",
    icon: Crown,
    monthlyINR: REGULAR_PRICING.agency.inr,
    scripts: "300 scripts / month",
    videos: "~75 videos / month",
    badge: null,
    highlighted: false,
    cta: "Get Started",
    href: "/signup",
    features: [
      "300 script generations / month",
      "~75 AI video generations / month",
      "Highest monthly allowance",
      "Priority support",
      "Everything in Studio",
    ],
  },
]

export function PricingSection() {
  return (
    <section id="pricing" className="py-28 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#00e5c0]/[0.025] to-transparent pointer-events-none" />

      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <AnimateOnScroll className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#00e5c0]/40 bg-[#00e5c0]/10 px-3 py-1 text-sm text-[#00e5c0] mb-4">
            Pricing
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-white">
            Simple, transparent pricing
          </h2>
          <p className="text-zinc-400 text-lg max-w-xl mx-auto">
            Start for free. Upgrade when you&apos;re ready to scale your content creation.
          </p>
        </AnimateOnScroll>

        {/* Plan cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
          {plans.map((plan, i) => (
            <AnimateOnScroll key={plan.name} delay={i * 80}>
              <PlanCard plan={plan} />
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

function PlanCard({ plan }: { plan: (typeof plans)[number] }) {
  const Icon = plan.icon

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
          <CardInner plan={plan} Icon={Icon} isHighlighted />
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex flex-col rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 h-full hover:border-white/[0.14] hover:bg-white/[0.05] transition-all duration-300">
      <CardInner plan={plan} Icon={Icon} />
    </div>
  )
}

function CardInner({
  plan,
  Icon,
  isHighlighted = false,
}: {
  plan: (typeof plans)[number]
  Icon: React.ElementType | null
  isHighlighted?: boolean
}) {
  const checkColor = isHighlighted ? "text-violet-400" : "text-zinc-400"

  return (
    <>
      <div className="mb-5 mt-1">
        <div className="flex items-center gap-2 mb-3">
          {Icon && (
            <div className={cn(
              "size-7 rounded-lg flex items-center justify-center",
              isHighlighted ? "bg-violet-500/20 text-violet-400" : "bg-white/10 text-zinc-400"
            )}>
              <Icon className="size-4" />
            </div>
          )}
          <h3 className="text-base font-bold text-white">{plan.name}</h3>
        </div>

        <div className="flex items-baseline gap-1.5 mb-1">
          <span className="text-3xl font-bold tracking-tight text-white">
            {plan.monthlyINR === 0 ? "Free" : `₹${plan.monthlyINR.toLocaleString("en-IN")}`}
          </span>
          {plan.monthlyINR > 0 && <span className="text-zinc-500 text-xs">/mo</span>}
        </div>

        <p className="text-zinc-500 text-xs">{plan.scripts}</p>
        <p className="text-zinc-500 text-xs">{plan.videos}</p>
      </div>

      <div className={cn(
        "h-px mb-5",
        isHighlighted
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
          isHighlighted
            ? "bg-gradient-to-r from-violet-600 to-blue-600 text-white hover:from-violet-500 hover:to-blue-500 shadow-lg shadow-violet-500/30"
            : "border border-white/15 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white hover:border-white/25"
        )}
      >
        {plan.cta}
      </Link>
    </>
  )
}
