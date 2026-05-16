import type { Metadata } from "next"
import Link from "next/link"
import {
  Sparkles,
  ArrowRight,
  Star,
  Check,
  TrendingUp,
  Clock,
  Layers,
  X,
} from "lucide-react"
import { buttonVariants } from "@/lib/button-variants"
import { cn } from "@/lib/utils"
import { PricingSection } from "@/components/landing/PricingSection"
import { FaqSection } from "@/components/landing/FaqSection"
import { faqs } from "@/components/landing/faq-data"
import { AnimateOnScroll } from "@/components/landing/AnimateOnScroll"
import { TerminalAnimation } from "@/components/landing/TerminalAnimation"
import { WorkflowPipeline } from "@/components/landing/WorkflowPipeline"
import { LiveDemoSection } from "@/components/landing/LiveDemoSection"

const BASE_URL = "https://scriptflow-ai-omega.vercel.app"

export const metadata: Metadata = {
  title: {
    absolute:
      "ScriptFlow AI — The Complete AI Video Studio for Viral Creators",
  },
  description:
    "Turn any video idea into a production-ready scene-by-scene script in 10 seconds. Copy-paste AI prompts for VEO 3, Kling, Runway, and Pika. Built for Indian creators.",
  keywords: [
    "AI video script generator",
    "video script AI",
    "YouTube Shorts script",
    "TikTok script generator",
    "Instagram Reels script",
    "VEO 3 prompts",
    "Kling prompts",
    "Runway prompts",
    "Pika prompts",
    "AI video prompts",
    "scene-by-scene script",
    "short-form video script",
    "AI video studio India",
    "faceless YouTube channel",
  ],
  alternates: {
    canonical: BASE_URL,
  },
  openGraph: {
    title: "ScriptFlow AI — The Complete AI Video Studio for Viral Creators",
    description:
      "Turn any video idea into a production-ready scene-by-scene script in 10 seconds. Copy-paste AI prompts for VEO 3, Kling, Runway, and Pika.",
    url: BASE_URL,
    type: "website",
  },
}

/* ── Supported tools ──────────────────────────────────────────────── */
const tools = [
  { name: "VEO 3", desc: "Google", color: "text-blue-400", border: "border-blue-500/25 hover:border-blue-400/55", bg: "bg-blue-950/40" },
  { name: "Kling 2.0", desc: "Kuaishou", color: "text-orange-400", border: "border-orange-500/25 hover:border-orange-400/55", bg: "bg-orange-950/40" },
  { name: "Runway Gen-4", desc: "Runway ML", color: "text-purple-400", border: "border-purple-500/25 hover:border-purple-400/55", bg: "bg-purple-950/40" },
  { name: "Pika 2.0", desc: "Pika Labs", color: "text-pink-400", border: "border-pink-500/25 hover:border-pink-400/55", bg: "bg-pink-950/40" },
  { name: "Midjourney", desc: "Stills", color: "text-emerald-400", border: "border-emerald-500/25 hover:border-emerald-400/55", bg: "bg-emerald-950/40" },
  { name: "Generic", desc: "Any tool", color: "text-zinc-400", border: "border-zinc-600/25 hover:border-zinc-400/55", bg: "bg-zinc-900/40" },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#060810] text-white overflow-x-hidden">

      {/* ══════════════════════════════════════════
          NAVBAR
      ══════════════════════════════════════════ */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/[0.06] bg-[#060810]/85 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-base">
            <div className="size-7 rounded-lg bg-[#00e5c0] flex items-center justify-center shadow-lg shadow-[#00e5c0]/30">
              <Sparkles className="size-3.5 text-black" />
            </div>
            <span className="text-white">ScriptFlow AI</span>
          </Link>

          <div className="hidden sm:flex items-center gap-6 text-sm text-zinc-400">
            {(["How it works", "Features", "Pricing", "FAQ"] as const).map((label, i) => (
              <a
                key={label}
                href={["#workflow", "#demo", "#pricing", "#faq"][i]}
                className="hover:text-white transition-colors"
              >
                {label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "text-zinc-400 hover:text-white"
              )}
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-black bg-[#00e5c0] hover:bg-[#00ccaa] shadow-lg shadow-[#00e5c0]/25 hover:shadow-[#00e5c0]/45 transition-all duration-200"
            >
              Get Started
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ══════════════════════════════════════════
          HERO — Two-column split
      ══════════════════════════════════════════ */}
      <section className="relative pt-32 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">

        {/* Background */}
        <div className="absolute inset-0 pointer-events-none select-none" aria-hidden>
          <div className="absolute inset-0 bg-[#060810]" />
          <div className="absolute -top-[15%] right-[5%] h-[600px] w-[600px] rounded-full bg-[#00e5c0]/8 blur-[140px] animate-blob-1" />
          <div className="absolute -bottom-[10%] -left-[5%] h-[550px] w-[550px] rounded-full bg-teal-700/12 blur-[130px] animate-blob-2" />
          <div className="absolute top-[25%] left-[15%] h-[400px] w-[400px] rounded-full bg-violet-600/10 blur-[110px] animate-blob-3" />
          <div className="absolute inset-0 dot-grid opacity-30" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,transparent_50%,#060810_100%)]" />
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* Left: content */}
            <div>
              {/* Badge */}
              <a
                href="#demo"
                className="inline-flex items-center gap-2 rounded-full border border-[#00e5c0]/40 bg-[#00e5c0]/10 px-4 py-1.5 text-sm text-[#00e5c0] mb-7 hover:border-[#00e5c0]/70 hover:bg-[#00e5c0]/20 transition-all duration-200"
                style={{ animation: "reveal-up 0.7s cubic-bezier(0.16,1,0.3,1) 0.05s both" }}
              >
                <Sparkles className="size-3.5" />
                <span>The Complete AI Video Studio</span>
                <ArrowRight className="size-3.5" />
              </a>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-5">
                <span className="block overflow-hidden pb-1">
                  <span
                    className="block"
                    style={{ animation: "reveal-up 0.9s cubic-bezier(0.16,1,0.3,1) 0.15s both" }}
                  >
                    From Idea to
                  </span>
                </span>
                <span className="block overflow-hidden pb-1">
                  <span
                    className="block"
                    style={{ animation: "reveal-up 0.9s cubic-bezier(0.16,1,0.3,1) 0.35s both" }}
                  >
                    <span
                      style={{
                        backgroundImage: "linear-gradient(90deg, #00e5c0 0%, #5eead4 40%, #00e5c0 100%)",
                        backgroundSize: "200% auto",
                        WebkitBackgroundClip: "text",
                        backgroundClip: "text",
                        color: "transparent",
                        animation: "shimmer-sweep 3s linear infinite",
                      }}
                    >
                      Production-Ready Script
                    </span>
                  </span>
                </span>
                <span className="block overflow-hidden pb-1">
                  <span
                    className="block text-white/90"
                    style={{ animation: "reveal-up 0.9s cubic-bezier(0.16,1,0.3,1) 0.55s both" }}
                  >
                    in 10 Seconds
                  </span>
                </span>
              </h1>

              {/* Sub */}
              <p
                className="text-lg text-zinc-400 mb-8 leading-relaxed max-w-lg"
                style={{ animation: "reveal-up 0.8s cubic-bezier(0.16,1,0.3,1) 0.75s both" }}
              >
                Scene-by-scene breakdowns with copy-paste prompts for{" "}
                <span className="text-blue-300 font-medium">VEO 3</span>,{" "}
                <span className="text-orange-300 font-medium">Kling</span>,{" "}
                <span className="text-purple-300 font-medium">Runway</span>, and{" "}
                <span className="text-pink-300 font-medium">Pika</span>.
                Built for the Indian creator economy.
              </p>

              {/* CTAs */}
              <div
                className="flex flex-col sm:flex-row gap-3 mb-8"
                style={{ animation: "reveal-up 0.8s cubic-bezier(0.16,1,0.3,1) 0.9s both" }}
              >
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-base font-semibold rounded-xl text-black bg-[#00e5c0] hover:bg-[#00ccaa] transition-all duration-200 animate-teal-pulse"
                >
                  <Sparkles className="size-4" />
                  Start Free — No Card Needed
                </Link>
                <a
                  href="#demo"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-base font-medium rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 hover:border-white/25 text-zinc-300 hover:text-white transition-all duration-200"
                >
                  See Live Demo
                  <ArrowRight className="size-4" />
                </a>
              </div>

              {/* Trust row */}
              <div
                className="flex items-center gap-5 text-sm text-zinc-500 flex-wrap"
                style={{ animation: "reveal-up 0.7s cubic-bezier(0.16,1,0.3,1) 1.05s both" }}
              >
                <div className="flex items-center gap-1.5">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="size-3 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <span>50+ creators</span>
                </div>
                <div className="h-3.5 w-px bg-zinc-700 hidden sm:block" />
                <span className="flex items-center gap-1.5">
                  <Check className="size-3.5 text-[#00e5c0]" />
                  3 free scripts/month
                </span>
                <div className="h-3.5 w-px bg-zinc-700 hidden sm:block" />
                <span className="flex items-center gap-1.5">
                  <Check className="size-3.5 text-[#00e5c0]" />
                  7-day money-back
                </span>
              </div>
            </div>

            {/* Right: terminal */}
            <div
              className="relative"
              style={{ animation: "reveal-up 1s cubic-bezier(0.16,1,0.3,1) 0.6s both" }}
            >
              {/* Outer glow */}
              <div className="absolute -inset-8 rounded-3xl bg-[#00e5c0]/8 blur-3xl pointer-events-none" />
              {/* Teal border glow */}
              <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-[#00e5c0]/30 via-teal-500/10 to-transparent pointer-events-none" />
              <TerminalAnimation />
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          WORKFLOW — 5-step pipeline
      ══════════════════════════════════════════ */}
      <section id="workflow" className="py-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00e5c0]/25 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#00e5c0]/[0.03] to-transparent pointer-events-none" />

        <div className="max-w-6xl mx-auto">
          <AnimateOnScroll className="text-center mb-12">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-[#00e5c0]/35 bg-[#00e5c0]/8 px-3 py-1 text-sm text-[#00e5c0] mb-4">
              How it works
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              5-step production flow
            </h2>
            <p className="text-zinc-400 text-lg max-w-xl mx-auto">
              What used to take 90 minutes of prompt engineering now takes under 2 minutes — start to finish.
            </p>
          </AnimateOnScroll>

          <AnimateOnScroll delay={100}>
            <WorkflowPipeline />
          </AnimateOnScroll>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          STATS — 3 teal numbers
      ══════════════════════════════════════════ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="max-w-4xl mx-auto">
          <AnimateOnScroll>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
              {[
                {
                  icon: Clock,
                  stat: "< 10s",
                  label: "Average script generation time",
                  sub: "From concept to full scene breakdown",
                },
                {
                  icon: Layers,
                  stat: "6",
                  label: "AI video tools supported",
                  sub: "VEO 3, Kling, Runway, Pika, Midjourney + Generic",
                },
                {
                  icon: TrendingUp,
                  stat: "90 → 2",
                  label: "Minutes of planning time",
                  sub: "The same work, 45× faster",
                },
              ].map(({ icon: Icon, stat, label, sub }, i) => (
                <AnimateOnScroll key={i} delay={i * 100}>
                  <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-8 group hover:border-[#00e5c0]/30 hover:bg-[#00e5c0]/[0.03] transition-all duration-300">
                    <Icon className="size-5 text-[#00e5c0] mx-auto mb-4 opacity-70" />
                    <div
                      className="text-4xl sm:text-5xl font-bold mb-2 tabular-nums"
                      style={{
                        backgroundImage: "linear-gradient(90deg, #00e5c0 0%, #5eead4 100%)",
                        WebkitBackgroundClip: "text",
                        backgroundClip: "text",
                        color: "transparent",
                      }}
                    >
                      {stat}
                    </div>
                    <p className="text-sm font-semibold text-white mb-1">{label}</p>
                    <p className="text-xs text-zinc-500">{sub}</p>
                  </div>
                </AnimateOnScroll>
              ))}
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          PROBLEM / SOLUTION
      ══════════════════════════════════════════ */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-500/20 to-transparent" />
        <div className="max-w-5xl mx-auto">
          <AnimateOnScroll className="text-center mb-12">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-sm text-zinc-400 mb-4">
              The problem we solve
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Stop spending hours on what AI should do in seconds
            </h2>
          </AnimateOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Before */}
            <AnimateOnScroll delay={0}>
              <div className="rounded-2xl border border-red-500/20 bg-red-950/10 p-7 h-full">
                <div className="flex items-center gap-2 mb-6">
                  <div className="size-8 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center">
                    <X className="size-4 text-red-400" />
                  </div>
                  <h3 className="font-bold text-red-300">Before ScriptFlow</h3>
                </div>
                <ul className="space-y-4">
                  {[
                    { time: "15 min", pain: "Thinking through scene structure mentally" },
                    { time: "20 min", pain: "Writing visual descriptions for each scene" },
                    { time: "30 min", pain: "Crafting prompts for each AI tool — different syntax every time" },
                    { time: "15 min", pain: "Iterating on failed or wrong-format prompts" },
                    { time: "10 min", pain: "Writing voiceover and on-screen text copy" },
                  ].map(({ time, pain }) => (
                    <li key={pain} className="flex items-start gap-3">
                      <span className="text-xs font-mono text-red-500 bg-red-500/10 rounded px-2 py-0.5 shrink-0 mt-0.5">
                        {time}
                      </span>
                      <span className="text-sm text-zinc-400">{pain}</span>
                    </li>
                  ))}
                  <li className="flex items-start gap-3 pt-2 border-t border-red-500/15">
                    <span className="text-xs font-mono font-bold text-red-400 bg-red-500/10 rounded px-2 py-0.5 shrink-0 mt-0.5">
                      90 min
                    </span>
                    <span className="text-sm font-semibold text-red-300">Per video, before you&apos;ve created anything</span>
                  </li>
                </ul>
              </div>
            </AnimateOnScroll>

            {/* After */}
            <AnimateOnScroll delay={120}>
              <div
                className="rounded-2xl border border-[#00e5c0]/25 bg-[#00e5c0]/[0.05] p-7 h-full"
                style={{ boxShadow: "0 0 40px -15px rgba(0,229,192,0.3)" }}
              >
                <div className="flex items-center gap-2 mb-6">
                  <div className="size-8 rounded-xl bg-[#00e5c0]/15 border border-[#00e5c0]/35 flex items-center justify-center">
                    <Check className="size-4 text-[#00e5c0]" />
                  </div>
                  <h3 className="font-bold text-[#00e5c0]">With ScriptFlow AI</h3>
                </div>
                <ul className="space-y-4">
                  {[
                    { time: "30s", win: "Type your concept, pick your settings" },
                    { time: "8s", win: "AI generates complete scene-by-scene script" },
                    { time: "30s", win: "Review scenes, voiceover, on-screen text" },
                    { time: "10s", win: "Copy tool-specific prompts — correct syntax, every time" },
                    { time: "0s", win: "ScriptFlow remembers your style preferences" },
                  ].map(({ time, win }) => (
                    <li key={win} className="flex items-start gap-3">
                      <span className="text-xs font-mono text-[#00e5c0] bg-[#00e5c0]/10 rounded px-2 py-0.5 shrink-0 mt-0.5">
                        {time}
                      </span>
                      <span className="text-sm text-zinc-300">{win}</span>
                    </li>
                  ))}
                  <li className="flex items-start gap-3 pt-2 border-t border-[#00e5c0]/15">
                    <span className="text-xs font-mono font-bold text-[#00e5c0] bg-[#00e5c0]/10 rounded px-2 py-0.5 shrink-0 mt-0.5">
                      &lt; 2 min
                    </span>
                    <span className="text-sm font-semibold text-[#00e5c0]">From idea to ready-to-generate script</span>
                  </li>
                </ul>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          LIVE DEMO
      ══════════════════════════════════════════ */}
      <section id="demo" className="py-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00e5c0]/25 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#00e5c0]/[0.02] to-transparent pointer-events-none" />

        <div className="max-w-6xl mx-auto">
          <AnimateOnScroll className="text-center mb-12">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-[#00e5c0]/35 bg-[#00e5c0]/8 px-3 py-1 text-sm text-[#00e5c0] mb-4">
              Live demo
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              See what a real script looks like
            </h2>
            <p className="text-zinc-400 text-lg max-w-xl mx-auto">
              Pick a concept below and explore the scene-by-scene output — including the copy-paste prompt for each AI tool.
            </p>
          </AnimateOnScroll>

          <AnimateOnScroll delay={100}>
            <LiveDemoSection />
          </AnimateOnScroll>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SUPPORTED TOOLS
      ══════════════════════════════════════════ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
        <div className="max-w-5xl mx-auto">
          <AnimateOnScroll className="text-center mb-10">
            <p className="text-sm text-zinc-500 mb-6 tracking-wide uppercase font-semibold">
              Prompt formatting built for every major AI video tool
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {tools.map((tool) => (
                <div
                  key={tool.name}
                  className={cn(
                    "rounded-xl border p-4 text-center transition-all duration-300 hover:scale-[1.04] hover:-translate-y-1",
                    tool.border, tool.bg
                  )}
                >
                  <p className={cn("font-bold text-xs mb-1", tool.color)}>{tool.name}</p>
                  <p className="text-[10px] text-zinc-600">{tool.desc}</p>
                </div>
              ))}
            </div>
          </AnimateOnScroll>

          {/* Format comparison strip */}
          <AnimateOnScroll delay={80}>
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] overflow-hidden mt-8">
              <div className="border-b border-white/[0.07] px-5 py-3.5 bg-white/[0.02]">
                <p className="text-xs font-medium text-zinc-400">
                  Same scene — ScriptFlow formats it correctly for each tool automatically
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/[0.07]">
                {[
                  { label: "VEO 3 (natural language)", color: "text-blue-400", dot: "bg-blue-400", text: "A person walks through a quiet forest at dawn, morning light filtering through pine trees, handheld camera following from behind, 9:16 vertical, cinematic mood, 5 seconds" },
                  { label: "Kling 2.0 (structured flags)", color: "text-orange-400", dot: "bg-orange-400", text: "[Person] [walking through forest] [dawn, pine trees, morning light] --duration 5 --ar 9:16 --style cinematic --camera handheld-follow" },
                  { label: "Runway Gen-4 (motion focus)", color: "text-purple-400", dot: "bg-purple-400", text: "Person walking forward through pine forest, camera dolly tracking from behind, dappled morning light, atmospheric depth, slow gentle motion, 9:16" },
                ].map((col) => (
                  <div key={col.label} className="p-5">
                    <p className={cn("text-xs font-semibold mb-3 flex items-center gap-1.5", col.color)}>
                      <span className={cn("size-2 rounded-full", col.dot)} />
                      {col.label}
                    </p>
                    <p className="text-xs font-mono text-zinc-500 leading-relaxed">{col.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ── Pricing ── */}
      <div className="relative">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00e5c0]/25 to-transparent" />
        <PricingSection />
      </div>

      {/* ── FAQ ── */}
      <div className="relative">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
        <FaqSection />
      </div>

      {/* ══════════════════════════════════════════
          FINAL CTA
      ══════════════════════════════════════════ */}
      <section className="py-28 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00e5c0]/25 to-transparent" />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[700px] rounded-full bg-[#00e5c0]/6 blur-[140px]" />
          <div className="absolute top-1/3 right-1/4 h-[300px] w-[300px] rounded-full bg-teal-700/8 blur-[100px]" />
        </div>

        <AnimateOnScroll className="relative max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#00e5c0]/35 bg-[#00e5c0]/8 px-3 py-1 text-sm text-[#00e5c0] mb-6">
            Get started today
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold mb-6 leading-tight">
            Your next script is{" "}
            <span
              style={{
                backgroundImage: "linear-gradient(90deg, #00e5c0 0%, #5eead4 50%, #00e5c0 100%)",
                backgroundSize: "200% auto",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
                animation: "shimmer-sweep 3s linear infinite",
              }}
            >
              10 seconds away
            </span>
          </h2>
          <p className="text-zinc-400 text-lg mb-10 max-w-xl mx-auto">
            Join creators who&apos;ve stopped spending hours on prompt engineering and started shipping more videos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 px-10 py-3.5 text-base font-semibold rounded-xl text-black bg-[#00e5c0] hover:bg-[#00ccaa] transition-all duration-200 animate-teal-pulse"
            >
              <Sparkles className="size-4" />
              Start for free — no card needed
            </Link>
          </div>
          <p className="text-xs text-zinc-600 mt-6">
            3 free scripts/month · No credit card required · Cancel anytime
          </p>
        </AnimateOnScroll>
      </section>

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "ScriptFlow AI",
            url: BASE_URL,
            logo: `${BASE_URL}/icon-512.png`,
            contactPoint: {
              "@type": "ContactPoint",
              email: "parthbrahmkshatriya@gmail.com",
              contactType: "customer support",
              availableLanguage: ["English", "Hindi"],
              areaServed: ["IN", "US", "GB", "AU", "CA"],
            },
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "ScriptFlow AI",
            description:
              "Turn any video idea into a production-ready scene-by-scene script in 10 seconds. Copy-paste AI prompts for VEO 3, Kling, Runway, and Pika.",
            applicationCategory: "Multimedia",
            operatingSystem: "Web",
            url: BASE_URL,
            offers: [
              { "@type": "Offer", name: "Free", price: "0", priceCurrency: "INR", description: "3 AI video scripts per month" },
              { "@type": "Offer", name: "Creator", price: "999", priceCurrency: "INR", description: "30 AI video scripts per month" },
              { "@type": "Offer", name: "Pro", price: "1999", priceCurrency: "INR", description: "Unlimited AI video scripts" },
            ],
            aggregateRating: { "@type": "AggregateRating", ratingValue: "4.9", reviewCount: "87" },
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((faq) => ({
              "@type": "Question",
              name: faq.question,
              acceptedAnswer: { "@type": "Answer", text: faq.answer },
            })),
          }),
        }}
      />

      {/* ══════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════ */}
      <footer className="relative py-12 px-4 sm:px-6 lg:px-8 bg-[#040508]">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00e5c0]/30 to-transparent" />

        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-8">
            <div className="flex flex-col items-center sm:items-start gap-2">
              <Link href="/" className="flex items-center gap-2 font-bold text-base">
                <div className="size-6 rounded-md bg-[#00e5c0] flex items-center justify-center">
                  <Sparkles className="size-3.5 text-black" />
                </div>
                <span className="text-white">ScriptFlow AI</span>
              </Link>
              <p className="text-xs text-zinc-600">AI video scripts in 10 seconds.</p>
            </div>

            <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-zinc-500">
              <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
              <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
              <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
              <Link href="/login" className="hover:text-white transition-colors">Login</Link>
              <Link href="/signup" className="hover:text-white transition-colors">Sign Up</Link>
              <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
              <a href="mailto:parthbrahmkshatriya@gmail.com" className="hover:text-white transition-colors">Contact</a>
            </nav>
          </div>

          <div className="mt-8 pt-8 border-t border-white/[0.05] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-600">
            <p>© {new Date().getFullYear()} ScriptFlow AI. All rights reserved.</p>
            <p
              className="text-zinc-500 hover:text-zinc-300 transition-colors"
              style={{ textShadow: "0 0 20px rgba(0,229,192,0.4)" }}
            >
              Made with ❤️ in India
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
