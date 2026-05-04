import type { Metadata } from "next"
import Link from "next/link"
import {
  Sparkles,
  Wand2,
  Copy,
  Film,
  Mic,
  Type,
  Layers,
  Clock,
  Palette,
  ArrowRight,
  Star,
  Play,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/lib/button-variants"
import { cn } from "@/lib/utils"
import { PricingSection } from "@/components/landing/PricingSection"
import { FaqSection } from "@/components/landing/FaqSection"
import { faqs } from "@/components/landing/faq-data"
import { AnimateOnScroll } from "@/components/landing/AnimateOnScroll"
import { TiltCard } from "@/components/landing/TiltCard"

const BASE_URL = "https://scriptflow-ai-omega.vercel.app"

export const metadata: Metadata = {
  title: {
    absolute:
      "ScriptFlow AI — AI Video Script Generator for YouTube Shorts, Reels & TikTok",
  },
  description:
    "Turn any video idea into a production-ready scene-by-scene script in 10 seconds. Copy-paste AI prompts for VEO 3, Kling, Runway, and Pika. Free to start.",
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
    "Midjourney video prompts",
  ],
  alternates: {
    canonical: BASE_URL,
  },
  openGraph: {
    title:
      "ScriptFlow AI — AI Video Script Generator for YouTube Shorts, Reels & TikTok",
    description:
      "Turn any video idea into a production-ready scene-by-scene script in 10 seconds. Copy-paste AI prompts for VEO 3, Kling, Runway, and Pika. Free to start.",
    url: BASE_URL,
    type: "website",
  },
}

/* ── Data ─────────────────────────────────────────────────────────── */

const steps = [
  {
    number: "01",
    icon: Wand2,
    title: "Describe Your Idea",
    description:
      "Type a one-line concept — as simple as 'a time-lapse of a city at night' or as specific as '60s cinematic reel about sustainable fashion'.",
    gradient: "from-violet-600 to-purple-500",
    shadow: "shadow-violet-500/50",
    glow: "bg-violet-500/20",
  },
  {
    number: "02",
    icon: Sparkles,
    title: "AI Generates Your Script",
    description:
      "Choose your platform, visual style, duration, and AI tool. ScriptFlow builds a complete scene-by-scene production script in under 10 seconds.",
    gradient: "from-blue-600 to-cyan-500",
    shadow: "shadow-blue-500/50",
    glow: "bg-blue-500/20",
  },
  {
    number: "03",
    icon: Copy,
    title: "Copy & Create",
    description:
      "Paste the tool-specific prompts directly into VEO 3, Kling, Runway, or Pika. Each scene prompt is pre-formatted for your chosen tool.",
    gradient: "from-emerald-600 to-teal-500",
    shadow: "shadow-emerald-500/50",
    glow: "bg-emerald-500/20",
  },
]

const features = [
  {
    icon: Layers,
    title: "Tool-Specific Prompt Formatting",
    description:
      "VEO 3, Kling 2.0, Runway Gen-4, Pika 2.0, and Midjourney each have different prompt syntax. ScriptFlow formats perfectly for each.",
    iconGrad: "from-violet-600 to-purple-500",
    iconGlow: "shadow-violet-500/40",
    hoverBorder: "hover:border-violet-500/40",
    hoverShadow: "hover:shadow-violet-500/10",
  },
  {
    icon: Film,
    title: "Scene-by-Scene Breakdown",
    description:
      "Every script includes visual descriptions, camera angles, movement directions, and exact timing — ready to shoot.",
    iconGrad: "from-blue-600 to-cyan-500",
    iconGlow: "shadow-blue-500/40",
    hoverBorder: "hover:border-blue-500/40",
    hoverShadow: "hover:shadow-blue-500/10",
  },
  {
    icon: Mic,
    title: "Voiceover & Narration",
    description:
      "Conversational voiceover text for every scene. Natural, platform-native language that viewers actually watch through.",
    iconGrad: "from-pink-600 to-rose-500",
    iconGlow: "shadow-pink-500/40",
    hoverBorder: "hover:border-pink-500/40",
    hoverShadow: "hover:shadow-pink-500/10",
  },
  {
    icon: Type,
    title: "On-Screen Text Overlays",
    description:
      "Hook-first text overlays, max 10 words per scene. Optimized for silent viewers scrolling their feed.",
    iconGrad: "from-orange-600 to-amber-500",
    iconGlow: "shadow-orange-500/40",
    hoverBorder: "hover:border-orange-500/40",
    hoverShadow: "hover:shadow-orange-500/10",
  },
  {
    icon: Clock,
    title: "15s, 30s & 60s Durations",
    description:
      "Automatic scene count calculation based on duration. 15s gets 3–4 scenes; 60s gets 8–12. Always precisely timed.",
    iconGrad: "from-emerald-600 to-teal-500",
    iconGlow: "shadow-emerald-500/40",
    hoverBorder: "hover:border-emerald-500/40",
    hoverShadow: "hover:shadow-emerald-500/10",
  },
  {
    icon: Palette,
    title: "Multiple Visual Styles",
    description:
      "Cinematic, Cartoon, Realistic, Minimal, or Anime. The style influences every visual description and AI prompt output.",
    iconGrad: "from-cyan-600 to-sky-500",
    iconGlow: "shadow-cyan-500/40",
    hoverBorder: "hover:border-cyan-500/40",
    hoverShadow: "hover:shadow-cyan-500/10",
  },
]

const tools = [
  {
    name: "VEO 3",
    desc: "Google's flagship video AI",
    card: "bg-blue-950/60 border-blue-500/30 hover:border-blue-400/60",
    glow: "hover:shadow-[0_0_28px_-6px_rgba(59,130,246,0.75)]",
    nameColor: "text-blue-300",
  },
  {
    name: "Kling 2.0",
    desc: "Kuaishou's video model",
    card: "bg-orange-950/50 border-orange-500/30 hover:border-orange-400/60",
    glow: "hover:shadow-[0_0_28px_-6px_rgba(249,115,22,0.75)]",
    nameColor: "text-orange-300",
  },
  {
    name: "Runway Gen-4",
    desc: "Hollywood-grade AI video",
    card: "bg-purple-950/50 border-purple-500/30 hover:border-purple-400/60",
    glow: "hover:shadow-[0_0_28px_-6px_rgba(168,85,247,0.75)]",
    nameColor: "text-purple-300",
  },
  {
    name: "Pika 2.0",
    desc: "Fast creative video AI",
    card: "bg-pink-950/50 border-pink-500/30 hover:border-pink-400/60",
    glow: "hover:shadow-[0_0_28px_-6px_rgba(236,72,153,0.75)]",
    nameColor: "text-pink-300",
  },
  {
    name: "Midjourney",
    desc: "Stunning still frames",
    card: "bg-emerald-950/50 border-emerald-500/30 hover:border-emerald-400/60",
    glow: "hover:shadow-[0_0_28px_-6px_rgba(16,185,129,0.75)]",
    nameColor: "text-emerald-300",
  },
  {
    name: "Generic",
    desc: "Works with any AI tool",
    card: "bg-zinc-900/60 border-zinc-600/30 hover:border-zinc-400/60",
    glow: "hover:shadow-[0_0_28px_-6px_rgba(161,161,170,0.45)]",
    nameColor: "text-zinc-300",
  },
]

const exampleScript = {
  concept: "A coffee shop morning routine that makes viewers want to slow down",
  scenes: [
    {
      scene: 1,
      duration: "4s",
      visual: "Extreme close-up of coffee dripping in slow motion, steam rising",
      prompt:
        "Extreme close-up macro shot of dark espresso dripping into a ceramic cup, slow motion, warm amber lighting, steam wisps rising, 9:16 vertical, cinematic --ar 9:16",
    },
    {
      scene: 2,
      duration: "5s",
      visual: "Hands wrapping around a warm mug, morning light through window",
      prompt:
        "Close-up of two hands gently cradling a white ceramic mug, soft golden morning light streaming through window bokeh, shallow depth of field, 9:16 --ar 9:16",
    },
    {
      scene: 3,
      duration: "6s",
      visual: "Person gazing out a café window, city life blurred in background",
      prompt:
        "Medium shot of person at café window seat looking outward, city street blurred through glass, warm interior lighting contrast, contemplative mood, 9:16 --ar 9:16",
    },
  ],
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#050508] text-white overflow-x-hidden">

      {/* ── Navigation ─────────────────────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/[0.06] bg-[#050508]/85 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <div className="size-7 rounded-lg bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <Sparkles className="size-4 text-white" />
            </div>
            <span className="bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
              ScriptFlow AI
            </span>
          </Link>

          <div className="hidden sm:flex items-center gap-6 text-sm text-zinc-400">
            {(["How it works", "Features", "Pricing", "FAQ"] as const).map(
              (label, i) => (
                <a
                  key={label}
                  href={["#how-it-works", "#features", "#pricing", "#faq"][i]}
                  className="hover:text-white transition-colors"
                >
                  {label}
                </a>
              )
            )}
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
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 transition-all duration-200"
            >
              Get Started
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ══════════════════════════════════════════
          HERO
      ══════════════════════════════════════════ */}
      <section className="relative pt-32 pb-28 px-4 sm:px-6 lg:px-8 overflow-hidden">

        {/* ── Layered animated background ── */}
        <div className="absolute inset-0 pointer-events-none select-none" aria-hidden>
          {/* Dark base */}
          <div className="absolute inset-0 bg-[#050508]" />

          {/* Animated blobs */}
          <div className="absolute -top-[20%] -right-[5%] h-[700px] w-[700px] rounded-full bg-violet-600/35 blur-[120px] animate-blob-1" />
          <div className="absolute -bottom-[15%] -left-[5%] h-[650px] w-[650px] rounded-full bg-blue-600/28 blur-[120px] animate-blob-2" />
          <div className="absolute top-[30%] right-[15%] h-[450px] w-[450px] rounded-full bg-pink-600/22 blur-[100px] animate-blob-3" />
          <div className="absolute bottom-[10%] left-[20%] h-[500px] w-[500px] rounded-full bg-teal-500/18 blur-[110px] animate-blob-4" />

          {/* Dot grid overlay */}
          <div className="absolute inset-0 dot-grid opacity-40" />

          {/* Radial vignette so edges stay dark */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_85%_65%_at_50%_10%,transparent_40%,#050508_100%)]" />
        </div>

        {/* ── Hero content ── */}
        <div className="relative max-w-5xl mx-auto text-center">

          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 rounded-full border border-violet-500/40 bg-violet-500/10 px-4 py-1.5 text-sm text-violet-300 mb-8"
            style={{ animation: "reveal-up 0.7s cubic-bezier(0.16,1,0.3,1) 0.05s both" }}
          >
            <Sparkles className="size-3.5" />
            <span>Now with VEO 3 support</span>
            <ArrowRight className="size-3.5" />
          </div>

          {/* Headline — word-group reveal */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
            <span className="block overflow-hidden pb-1">
              <span
                className="block"
                style={{ animation: "reveal-up 0.9s cubic-bezier(0.16,1,0.3,1) 0.15s both" }}
              >
                Turn Any Video Idea Into a
              </span>
            </span>
            <span className="block overflow-hidden pb-1">
              <span
                className="block"
                style={{ animation: "reveal-up 0.9s cubic-bezier(0.16,1,0.3,1) 0.42s both" }}
              >
                <span className="shimmer-text">Production-Ready Script</span>
              </span>
            </span>
            <span className="block overflow-hidden pb-1">
              <span
                className="block text-white/90"
                style={{ animation: "reveal-up 0.9s cubic-bezier(0.16,1,0.3,1) 0.68s both" }}
              >
                in 10 Seconds
              </span>
            </span>
          </h1>

          {/* Subheadline */}
          <p
            className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed"
            style={{ animation: "reveal-up 0.8s cubic-bezier(0.16,1,0.3,1) 0.9s both" }}
          >
            AI-powered scene-by-scene scripts with copy-paste prompts for{" "}
            <span className="text-blue-300 font-medium">VEO 3</span>,{" "}
            <span className="text-orange-300 font-medium">Kling</span>,{" "}
            <span className="text-purple-300 font-medium">Runway</span>, and{" "}
            <span className="text-pink-300 font-medium">Pika</span>.
            Stop writing prompts. Start creating.
          </p>

          {/* CTAs */}
          <div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
            style={{ animation: "reveal-up 0.8s cubic-bezier(0.16,1,0.3,1) 1.05s both" }}
          >
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-8 py-3.5 text-base font-semibold rounded-xl text-white bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 hover:from-violet-500 hover:via-purple-500 hover:to-blue-500 transition-all duration-300 animate-cta-pulse"
            >
              <Sparkles className="size-4" />
              Get Started Free
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 px-8 py-3.5 text-base font-medium rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 hover:border-white/25 backdrop-blur-sm text-zinc-300 hover:text-white transition-all duration-300"
            >
              <Play className="size-4" />
              See How It Works
            </a>
          </div>

          {/* Social proof */}
          <div
            className="flex items-center justify-center gap-6 text-sm text-zinc-500 flex-wrap"
            style={{ animation: "reveal-up 0.7s cubic-bezier(0.16,1,0.3,1) 1.2s both" }}
          >
            <div className="flex items-center gap-1.5">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="size-3.5 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <span>Loved by creators</span>
            </div>
            <div className="h-4 w-px bg-zinc-700 hidden sm:block" />
            <span>No credit card required</span>
            <div className="h-4 w-px bg-zinc-700 hidden sm:block" />
            <span>3 free scripts/month</span>
          </div>
        </div>

        {/* ── Tilt preview card ── */}
        <div
          className="relative max-w-3xl mx-auto mt-20"
          style={{ animation: "reveal-up 1s cubic-bezier(0.16,1,0.3,1) 1.1s both" }}
        >
          {/* Outer glow halo */}
          <div className="absolute -inset-6 rounded-3xl bg-gradient-to-r from-violet-600/25 via-blue-600/15 to-teal-600/20 blur-3xl pointer-events-none" />
          {/* 1px gradient border */}
          <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-violet-500/35 via-purple-500/20 to-blue-500/35 pointer-events-none" />

          <TiltCard className="relative rounded-2xl border border-white/10 bg-[#0c0c14]/95 backdrop-blur-sm overflow-hidden shadow-2xl">
            {/* Window chrome */}
            <div className="border-b border-white/[0.07] px-5 py-4 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="size-3 rounded-full bg-red-500/70" />
                  <div className="size-3 rounded-full bg-yellow-500/70" />
                  <div className="size-3 rounded-full bg-green-500/70" />
                </div>
                <span className="text-xs text-zinc-500 font-mono">scriptflow.ai / generate</span>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline" className="text-xs border-orange-500/40 text-orange-300 bg-orange-950/30">Kling 2.0</Badge>
                <Badge variant="outline" className="text-xs border-purple-500/40 text-purple-300 bg-purple-950/30">Cinematic</Badge>
                <Badge variant="outline" className="text-xs border-zinc-600/40 text-zinc-400">30s</Badge>
              </div>
            </div>

            {/* Concept row */}
            <div className="px-5 py-4 border-b border-white/[0.05] bg-white/[0.01]">
              <p className="text-xs text-zinc-500 mb-1.5">Your concept</p>
              <p className="text-sm font-medium text-zinc-200 italic">
                &ldquo;{exampleScript.concept}&rdquo;
              </p>
            </div>

            {/* Scene cards */}
            <div className="p-5 space-y-3">
              {exampleScript.scenes.map((scene) => (
                <div
                  key={scene.scene}
                  className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-4 group hover:border-violet-500/35 hover:bg-white/[0.055] transition-all duration-200"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-violet-300 bg-violet-500/15 border border-violet-500/30 rounded-md px-2 py-0.5">
                        Scene {scene.scene}
                      </span>
                      <span className="text-xs text-zinc-500">{scene.duration}</span>
                    </div>
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1">
                      <Copy className="size-3" /> Copy prompt
                    </button>
                  </div>
                  <p className="text-xs text-zinc-500 mb-2">{scene.visual}</p>
                  <div className="rounded-lg bg-violet-500/8 border border-violet-500/20 px-3 py-2">
                    <p className="text-xs font-mono text-violet-300/80 leading-relaxed">
                      {scene.prompt}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="px-5 pb-5">
              <p className="text-center text-xs text-zinc-600">
                ✨ Generated in 8.3 seconds · 3 scenes · Ready to paste into Kling 2.0
              </p>
            </div>
          </TiltCard>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════ */}
      <section id="how-it-works" className="py-28 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-950/8 to-transparent pointer-events-none" />

        <div className="max-w-6xl mx-auto">
          <AnimateOnScroll className="text-center mb-16">
            <Badge variant="outline" className="mb-4 px-3 py-1 border-violet-500/40 text-violet-400">
              How it works
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">From idea to script in 3 steps</h2>
            <p className="text-zinc-400 text-lg max-w-xl mx-auto">
              What used to take 90 minutes of planning now takes under 10 seconds.
            </p>
          </AnimateOnScroll>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 relative">
            {/* Connecting gradient line */}
            <div className="hidden lg:block absolute top-10 left-[calc(33.33%+1rem)] right-[calc(33.33%+1rem)] h-px bg-gradient-to-r from-violet-500/50 via-blue-500/50 to-emerald-500/50" />

            {steps.map((step, i) => (
              <AnimateOnScroll key={i} delay={i * 130}>
                <div className="group flex flex-col items-center text-center px-2">
                  {/* Icon with radial glow */}
                  <div className="relative mb-8">
                    <div className={cn(
                      "absolute -inset-4 rounded-2xl blur-2xl opacity-30 group-hover:opacity-60 transition-opacity duration-500",
                      step.glow
                    )} />
                    <div className={cn(
                      "relative size-20 rounded-2xl bg-gradient-to-br flex flex-col items-center justify-center shadow-xl group-hover:scale-105 group-hover:shadow-2xl transition-all duration-300",
                      step.gradient, step.shadow
                    )}>
                      <step.icon className="size-8 text-white mb-0.5" />
                      <span className="text-[10px] font-bold text-white/50">{step.number}</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-3 group-hover:text-white transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-zinc-400 text-sm leading-relaxed max-w-xs group-hover:text-zinc-300 transition-colors">
                    {step.description}
                  </p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FEATURES
      ══════════════════════════════════════════ */}
      <section id="features" className="py-28 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-950/6 to-transparent pointer-events-none" />

        <div className="max-w-6xl mx-auto">
          <AnimateOnScroll className="text-center mb-16">
            <Badge variant="outline" className="mb-4 px-3 py-1 border-blue-500/40 text-blue-400">
              Features
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Everything you need to ship videos faster
            </h2>
            <p className="text-zinc-400 text-lg max-w-xl mx-auto">
              Built specifically for AI video creators. Every feature designed to cut
              production time, not add to it.
            </p>
          </AnimateOnScroll>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, i) => (
              <AnimateOnScroll key={i} delay={i * 75}>
                <div className={cn(
                  "group relative rounded-2xl border border-white/[0.08] p-6",
                  "bg-white/[0.03] backdrop-blur-sm",
                  "hover:-translate-y-1.5 hover:shadow-xl hover:bg-white/[0.06] transition-all duration-300",
                  feature.hoverBorder, feature.hoverShadow
                )}>
                  {/* Colorful icon with glow */}
                  <div className={cn(
                    "size-11 rounded-xl bg-gradient-to-br flex items-center justify-center mb-4 shadow-lg",
                    feature.iconGrad, feature.iconGlow
                  )}>
                    <feature.icon className="size-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-base text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed group-hover:text-zinc-300 transition-colors">
                    {feature.description}
                  </p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SUPPORTED TOOLS
      ══════════════════════════════════════════ */}
      <section className="py-28 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-teal-500/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-teal-950/5 to-transparent pointer-events-none" />

        <div className="max-w-6xl mx-auto">
          <AnimateOnScroll className="text-center mb-14">
            <Badge variant="outline" className="mb-4 px-3 py-1 border-teal-500/40 text-teal-400">
              Supported tools
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Prompts formatted for every major AI video tool
            </h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              VEO 3 wants natural language. Kling wants structured flags. Runway
              wants motion keywords. ScriptFlow knows the difference — and formats
              every prompt correctly, automatically.
            </p>
          </AnimateOnScroll>

          <AnimateOnScroll delay={100}>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
              {tools.map((tool) => (
                <div
                  key={tool.name}
                  className={cn(
                    "rounded-2xl border p-5 text-center transition-all duration-300 cursor-default",
                    "hover:scale-[1.05] hover:-translate-y-1.5",
                    tool.card, tool.glow
                  )}
                >
                  <div className={cn("font-bold text-sm mb-1.5", tool.nameColor)}>
                    {tool.name}
                  </div>
                  <div className="text-xs text-zinc-500">{tool.desc}</div>
                </div>
              ))}
            </div>
          </AnimateOnScroll>

          {/* Format comparison */}
          <AnimateOnScroll delay={150}>
            <div className="rounded-2xl border border-white/8 bg-white/[0.025] overflow-hidden">
              <div className="border-b border-white/8 px-5 py-3.5 bg-white/[0.02]">
                <p className="text-sm font-medium text-zinc-300">
                  Same scene, different tools — ScriptFlow formats each one correctly
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/8">
                {[
                  {
                    label: "VEO 3 (natural language)",
                    dot: "bg-blue-400",
                    color: "text-blue-400",
                    text: "A person walks through a quiet forest at dawn, morning light filtering through pine trees, handheld camera following from behind, 9:16 vertical, cinematic mood, 5 seconds",
                  },
                  {
                    label: "Kling 2.0 (structured flags)",
                    dot: "bg-orange-400",
                    color: "text-orange-400",
                    text: "[Person] [walking through forest] [dawn, pine trees, morning light] --duration 5 --ar 9:16 --style cinematic --camera handheld-follow",
                  },
                  {
                    label: "Runway Gen-4 (motion focus)",
                    dot: "bg-purple-400",
                    color: "text-purple-400",
                    text: "Person walking forward through pine forest, camera dolly tracking from behind, dappled morning light, atmospheric depth, slow gentle motion, 9:16",
                  },
                ].map((col) => (
                  <div key={col.label} className="p-5">
                    <p className={cn("text-xs font-semibold mb-3 flex items-center gap-1.5", col.color)}>
                      <span className={cn("size-2 rounded-full inline-block", col.dot)} />
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
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-pink-500/30 to-transparent" />
        <PricingSection />
      </div>

      {/* ── FAQ ── */}
      <div className="relative">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />
        <FaqSection />
      </div>

      {/* ══════════════════════════════════════════
          FOOTER CTA
      ══════════════════════════════════════════ */}
      <section className="py-28 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[700px] rounded-full bg-violet-600/8 blur-[120px]" />
          <div className="absolute top-1/2 left-1/3 -translate-y-1/2 h-[300px] w-[300px] rounded-full bg-blue-600/8 blur-[80px]" />
          <div className="absolute top-1/3 right-1/4 h-[250px] w-[250px] rounded-full bg-pink-600/6 blur-[80px]" />
        </div>

        <AnimateOnScroll className="relative max-w-3xl mx-auto text-center">
          <Badge variant="outline" className="mb-6 px-3 py-1 border-violet-500/40 text-violet-400">
            Get started today
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-bold mb-6 leading-tight">
            Your next video script is{" "}
            <span className="shimmer-text">10 seconds away</span>
          </h2>
          <p className="text-zinc-400 text-lg mb-10 max-w-xl mx-auto">
            Join creators who&apos;ve stopped spending hours on prompt engineering
            and started shipping more videos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 px-10 py-3.5 text-base font-semibold rounded-xl text-white bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 hover:from-violet-500 hover:via-purple-500 hover:to-blue-500 transition-all duration-300 animate-cta-pulse"
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
            "@type": "SoftwareApplication",
            name: "ScriptFlow AI",
            description:
              "Turn any video idea into a production-ready scene-by-scene script in 10 seconds. Copy-paste AI prompts for VEO 3, Kling, Runway, and Pika.",
            applicationCategory: "Multimedia",
            operatingSystem: "Web",
            url: BASE_URL,
            offers: [
              {
                "@type": "Offer",
                name: "Free",
                price: "0",
                priceCurrency: "USD",
                description: "3 AI video scripts per month",
              },
              {
                "@type": "Offer",
                name: "Creator",
                price: "9",
                priceCurrency: "USD",
                description: "30 AI video scripts per month",
              },
              {
                "@type": "Offer",
                name: "Pro",
                price: "19",
                priceCurrency: "USD",
                description: "Unlimited AI video scripts",
              },
            ],
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: "4.9",
              reviewCount: "87",
            },
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
              acceptedAnswer: {
                "@type": "Answer",
                text: faq.answer,
              },
            })),
          }),
        }}
      />

      {/* ══════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════ */}
      <footer className="relative py-12 px-4 sm:px-6 lg:px-8 bg-[#030306]">
        {/* Gradient divider */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-white/5 to-transparent" />

        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-8">
            <div className="flex flex-col items-center sm:items-start gap-2">
              <Link href="/" className="flex items-center gap-2 font-bold text-base">
                <div className="size-6 rounded-md bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center">
                  <Sparkles className="size-3.5 text-white" />
                </div>
                <span className="text-white">ScriptFlow AI</span>
              </Link>
              <p className="text-xs text-zinc-600">AI video scripts in 10 seconds.</p>
            </div>

            <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-zinc-500">
              <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
              <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
              <Link href="/login" className="hover:text-white transition-colors">Login</Link>
              <Link href="/signup" className="hover:text-white transition-colors">Sign Up</Link>
              <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
            </nav>
          </div>

          <div className="mt-8 pt-8 border-t border-white/[0.05] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-600">
            <p>© {new Date().getFullYear()} ScriptFlow AI. All rights reserved.</p>
            {/* Glow on Made with ❤️ */}
            <p className="text-zinc-500 hover:text-zinc-300 transition-colors [text-shadow:0_0_20px_rgba(236,72,153,0.5)]">
              Made with ❤️ in India
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
