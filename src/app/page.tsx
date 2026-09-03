import type { Metadata } from "next"
import Link from "next/link"
import {
  Sparkles, ArrowRight, Star, Check, X,
  Video, Mic, Scissors, Image, FileText,
  Copy, Zap, Share2, Play,
} from "lucide-react"
import { FaqSection } from "@/components/landing/FaqSection"
import { PricingSection } from "@/components/landing/PricingSection"
import { faqs } from "@/components/landing/faq-data"
import { AnimateOnScroll } from "@/components/landing/AnimateOnScroll"
import { WorkflowPipeline } from "@/components/landing/WorkflowPipeline"
import { LiveDemoSection } from "@/components/landing/LiveDemoSection"

const BASE_URL = "https://scriptflowai.co"

export const metadata: Metadata = {
  title: { absolute: "ScriptFlow AI — Write, Generate & Export AI Videos End-to-End" },
  description: "From concept to finished video in minutes. AI script + Veo 3 video generation + audio + one-click export.",
  alternates: { canonical: BASE_URL },
  openGraph: {
    title: "ScriptFlow AI — Write, Generate & Export AI Videos End-to-End",
    description: "Script → Video → Audio → Final cut. All in one place.",
    url: BASE_URL, type: "website",
  },
}

const TOOLS = [
  { name: "VEO 3", emoji: "🎬", color: "#a855f7" },
  { name: "Kling 2.0", emoji: "⚡", color: "#f97316" },
  { name: "Runway Gen-4", emoji: "🚀", color: "#3b82f6" },
  { name: "Pika 2.0", emoji: "✨", color: "#ec4899" },
  { name: "Midjourney", emoji: "🎨", color: "#22d3ee" },
  { name: "Universal", emoji: "🔧", color: "#a1a1aa" },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#030305] text-white overflow-x-hidden">

      {/* ═══════════════════════════════════
          NAVBAR — glass blur
      ═══════════════════════════════════ */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/[0.05]"
        style={{ background: "rgba(3,3,5,0.75)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}>
        <div className="max-w-7xl mx-auto px-5 h-[60px] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 font-bold text-sm tracking-tight">
            <div className="size-7 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#a855f7,#ec4899)" }}>
              <Sparkles className="size-3.5 text-white" />
            </div>
            <span className="text-white">ScriptFlow AI</span>
          </Link>

          <div className="hidden md:flex items-center gap-7 text-sm text-zinc-500">
            {["How it works", "Features", "Demo", "Pricing", "FAQ"].map((label, i) => (
              <a key={label} href={["#workflow","#features","#demo","#pricing","#faq"][i]}
                className="hover:text-white transition-colors duration-200">{label}</a>
            ))}
            <Link href="/contact" className="hover:text-white transition-colors duration-200">Contact us</Link>
          </div>

          <div className="flex items-center gap-2.5">
            <Link href="/login"
              className="hidden sm:inline-flex px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-white/5">
              Sign in
            </Link>
            <Link href="/signup"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all duration-200 animate-violet-glow"
              style={{ background: "linear-gradient(135deg,#9333ea,#ec4899)" }}>
              Get Started
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ═══════════════════════════════════
          HERO — aurora + noise + oversized type
      ═══════════════════════════════════ */}
      <section className="relative min-h-[100svh] flex flex-col items-center justify-center pt-20 pb-16 px-5 overflow-hidden aurora-bg noise">
        {/* Gradient blobs */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute top-[-20%] left-[10%] h-[700px] w-[700px] rounded-full opacity-20 blur-[120px]"
            style={{ background: "radial-gradient(circle,#9333ea,transparent 70%)" }} />
          <div className="absolute bottom-[-10%] right-[5%] h-[600px] w-[600px] rounded-full opacity-15 blur-[110px]"
            style={{ background: "radial-gradient(circle,#ec4899,transparent 70%)" }} />
          <div className="absolute top-[40%] right-[20%] h-[400px] w-[400px] rounded-full opacity-10 blur-[100px]"
            style={{ background: "radial-gradient(circle,#22d3ee,transparent 70%)" }} />
          <div className="absolute inset-0 dot-grid opacity-[0.08]" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium mb-8 border"
            style={{ animation: "reveal-up 0.6s cubic-bezier(0.16,1,0.3,1) 0.1s both",
              background: "rgba(147,51,234,0.12)", borderColor: "rgba(147,51,234,0.3)", color: "#d8b4fe" }}>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: "#a855f7" }} />
              <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: "#a855f7" }} />
            </span>
            Script · Video · Audio · Export — end to end
          </div>

          {/* Headline */}
          <h1 className="font-black tracking-tight leading-[0.95] mb-6"
            style={{ fontSize: "clamp(3rem, 9vw, 7rem)", animation: "reveal-up 0.9s cubic-bezier(0.16,1,0.3,1) 0.2s both" }}>
            <span className="block text-white">From idea to</span>
            <span className="block" style={{
              backgroundImage: "linear-gradient(90deg, #a855f7 0%, #ec4899 45%, #f97316 100%)",
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
              animation: "shimmer-sweep 4s linear infinite",
            }}>
              upload-ready video.
            </span>
          </h1>

          {/* Subtext */}
          <p className="text-base sm:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed"
            style={{ animation: "reveal-up 0.8s cubic-bezier(0.16,1,0.3,1) 0.4s both" }}>
            AI writes your scene-by-scene script, generates each clip as a real video with narration via{" "}
            <span className="text-violet-300 font-semibold">Veo 3 Fast</span>, then stitches it all into one final MP4.
            No camera. No editing software. Just post.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-14"
            style={{ animation: "reveal-up 0.7s cubic-bezier(0.16,1,0.3,1) 0.55s both" }}>
            <Link href="/signup"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-base font-bold text-white transition-all duration-200 animate-violet-glow"
              style={{ background: "linear-gradient(135deg,#9333ea 0%,#ec4899 100%)" }}>
              <Sparkles className="size-4" />
              Create my first video free
            </Link>
            <a href="#demo"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-base font-medium border transition-all duration-200 hover:bg-white/[0.06]"
              style={{ borderColor: "rgba(255,255,255,0.12)", color: "#a1a1aa" }}>
              <Play className="size-4 fill-current" />
              Watch demo
            </a>
          </div>

          {/* Social proof pills */}
          <div className="flex items-center justify-center gap-6 flex-wrap text-sm"
            style={{ animation: "reveal-up 0.6s cubic-bezier(0.16,1,0.3,1) 0.7s both" }}>
            <div className="flex items-center gap-2 text-zinc-500">
              <div className="flex -space-x-1.5">
                {["🧑‍💻","👩‍🎨","🧑‍🎬","👨‍💼","🧑‍🚀"].map((e, i) => (
                  <div key={i} className="w-7 h-7 rounded-full border-2 border-[#030305] flex items-center justify-center text-sm"
                    style={{ background: `hsl(${i * 60}, 70%, 15%)` }}>{e}</div>
                ))}
              </div>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => <Star key={i} className="size-3 fill-yellow-400 text-yellow-400" />)}
                <span className="ml-1 text-zinc-400">50+ creators</span>
              </div>
            </div>
            <span className="h-4 w-px bg-zinc-800 hidden sm:block" />
            <span className="flex items-center gap-1.5 text-zinc-500">
              <Check className="size-3.5 text-violet-400" /> 3 free scripts/month
            </span>
            <span className="h-4 w-px bg-zinc-800 hidden sm:block" />
            <span className="flex items-center gap-1.5 text-zinc-500">
              <Check className="size-3.5 text-violet-400" /> No credit card
            </span>
          </div>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 opacity-30">
          <div className="w-px h-8 bg-gradient-to-b from-transparent to-zinc-400" />
          <p className="text-[10px] tracking-widest uppercase text-zinc-500">scroll</p>
        </div>
      </section>

      {/* ═══════════════════════════════════
          MARQUEE — tool logos
      ═══════════════════════════════════ */}
      <div className="relative py-5 border-y border-white/[0.05] overflow-hidden"
        style={{ background: "rgba(255,255,255,0.01)" }}>
        <div className="marquee-track">
          {[...TOOLS, ...TOOLS, ...TOOLS, ...TOOLS].map((tool, i) => (
            <div key={i} className="flex items-center gap-2 px-8 shrink-0">
              <span className="text-xl">{tool.emoji}</span>
              <span className="text-sm font-semibold text-zinc-500 whitespace-nowrap">{tool.name}</span>
              <span className="ml-6 h-3.5 w-px bg-zinc-800" />
            </div>
          ))}
        </div>
        <div className="absolute inset-y-0 left-0 w-32 pointer-events-none"
          style={{ background: "linear-gradient(to right, #030305, transparent)" }} />
        <div className="absolute inset-y-0 right-0 w-32 pointer-events-none"
          style={{ background: "linear-gradient(to left, #030305, transparent)" }} />
      </div>

      {/* ═══════════════════════════════════
          PIPELINE — how it works
      ═══════════════════════════════════ */}
      <section id="workflow" className="py-28 px-5 relative">
        <div className="absolute inset-x-0 top-0 h-px" style={{ background: "linear-gradient(90deg,transparent,rgba(168,85,247,0.3),transparent)" }} />
        <div className="max-w-6xl mx-auto">
          <AnimateOnScroll className="text-center mb-14">
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-violet-400 mb-4">End-to-end pipeline</p>
            <h2 className="font-black text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.05] mb-5">
              Concept in.{" "}
              <span style={{
                backgroundImage: "linear-gradient(90deg,#a855f7,#ec4899)",
                WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
              }}>
                Video out.
              </span>
            </h2>
            <p className="text-zinc-500 text-lg max-w-xl mx-auto">
              What used to take 90 minutes of prompt engineering now takes under 5 minutes — start to finish.
            </p>
          </AnimateOnScroll>
          <AnimateOnScroll delay={100}><WorkflowPipeline /></AnimateOnScroll>
        </div>
      </section>

      {/* ═══════════════════════════════════
          BENTO FEATURES
      ═══════════════════════════════════ */}
      <section id="features" className="py-24 px-5 relative">
        <div className="absolute inset-x-0 top-0 h-px" style={{ background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.06),transparent)" }} />
        <div className="max-w-6xl mx-auto">
          <AnimateOnScroll className="text-center mb-14">
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-pink-400 mb-4">What&apos;s inside</p>
            <h2 className="font-black text-4xl sm:text-5xl tracking-tight leading-[1.05] mb-4">
              Not just a script writer.{" "}
              <br className="hidden sm:block" />
              <span style={{
                backgroundImage: "linear-gradient(90deg,#ec4899,#f97316)",
                WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
              }}>A full video studio.</span>
            </h2>
          </AnimateOnScroll>

          {/* Bento grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-auto">

            {/* Large card — script gen */}
            <AnimateOnScroll delay={0} className="lg:col-span-2 lg:row-span-1">
              <div className="glass-card grad-border noise rounded-2xl p-7 h-full min-h-[220px] relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10 blur-3xl pointer-events-none"
                  style={{ background: "radial-gradient(circle,#a855f7,transparent)" }} />
                <div className="relative z-10">
                  <div className="inline-flex items-center justify-center size-12 rounded-2xl mb-5"
                    style={{ background: "linear-gradient(135deg,rgba(168,85,247,0.3),rgba(168,85,247,0.1))", border: "1px solid rgba(168,85,247,0.3)" }}>
                    <FileText className="size-5 text-violet-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Scene-by-Scene AI Script</h3>
                  <p className="text-zinc-500 text-sm leading-relaxed max-w-md">
                    Type one line. Get a full production script with visual descriptions, camera directions, voiceover, on-screen text, and music cues — all structured scene by scene.
                  </p>
                  <div className="mt-5 flex items-center gap-2 text-xs text-violet-400 font-semibold">
                    <Zap className="size-3.5" /> Under 10 seconds
                  </div>
                </div>
              </div>
            </AnimateOnScroll>

            {/* Video generation */}
            <AnimateOnScroll delay={60}>
              <div className="glass-card grad-border noise rounded-2xl p-7 h-full min-h-[220px] relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10 blur-3xl pointer-events-none"
                  style={{ background: "radial-gradient(circle,#f97316,transparent)" }} />
                <div className="relative z-10">
                  <div className="inline-flex items-center justify-center size-12 rounded-2xl mb-5"
                    style={{ background: "linear-gradient(135deg,rgba(249,115,22,0.3),rgba(249,115,22,0.1))", border: "1px solid rgba(249,115,22,0.3)" }}>
                    <Video className="size-5 text-orange-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">One-Click Video Generation</h3>
                  <p className="text-zinc-500 text-sm leading-relaxed">
                    Generate each scene as a real video inside ScriptFlow via Veo 3 Fast — no third-party tools needed.
                  </p>
                </div>
              </div>
            </AnimateOnScroll>

            {/* Audio */}
            <AnimateOnScroll delay={90}>
              <div className="glass-card grad-border noise rounded-2xl p-7 h-full min-h-[180px] relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10 blur-3xl pointer-events-none"
                  style={{ background: "radial-gradient(circle,#ec4899,transparent)" }} />
                <div className="relative z-10">
                  <div className="inline-flex items-center justify-center size-12 rounded-2xl mb-5"
                    style={{ background: "linear-gradient(135deg,rgba(236,72,153,0.3),rgba(236,72,153,0.1))", border: "1px solid rgba(236,72,153,0.3)" }}>
                    <Mic className="size-5 text-pink-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Audio + Narration Included</h3>
                  <p className="text-zinc-500 text-sm leading-relaxed">
                    Veo 3 generates synchronized narration, ambient sound, and SFX automatically. No separate TTS step.
                  </p>
                </div>
              </div>
            </AnimateOnScroll>

            {/* Tool prompts */}
            <AnimateOnScroll delay={120}>
              <div className="glass-card grad-border noise rounded-2xl p-7 h-full min-h-[180px] relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10 blur-3xl pointer-events-none"
                  style={{ background: "radial-gradient(circle,#3b82f6,transparent)" }} />
                <div className="relative z-10">
                  <div className="inline-flex items-center justify-center size-12 rounded-2xl mb-5"
                    style={{ background: "linear-gradient(135deg,rgba(59,130,246,0.3),rgba(59,130,246,0.1))", border: "1px solid rgba(59,130,246,0.3)" }}>
                    <Copy className="size-5 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Tool-Specific Prompts</h3>
                  <p className="text-zinc-500 text-sm leading-relaxed">
                    Each scene includes a copy-paste prompt formatted for your chosen tool — VEO 3, Kling, Runway, Pika, Midjourney.
                  </p>
                </div>
              </div>
            </AnimateOnScroll>

            {/* Stitch — wide */}
            <AnimateOnScroll delay={150} className="sm:col-span-2 lg:col-span-1">
              <div className="glass-card grad-border noise rounded-2xl p-7 h-full min-h-[180px] relative overflow-hidden group">
                <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-10 blur-3xl pointer-events-none"
                  style={{ background: "radial-gradient(circle,#22d3ee,transparent)" }} />
                <div className="relative z-10">
                  <div className="inline-flex items-center justify-center size-12 rounded-2xl mb-5"
                    style={{ background: "linear-gradient(135deg,rgba(34,211,238,0.3),rgba(34,211,238,0.1))", border: "1px solid rgba(34,211,238,0.3)" }}>
                    <Scissors className="size-5 text-cyan-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Auto Video Stitching</h3>
                  <p className="text-zinc-500 text-sm leading-relaxed">
                    All scene clips stitched into one complete MP4. Download and post — no editing software.
                  </p>
                </div>
              </div>
            </AnimateOnScroll>

            {/* Avatar */}
            <AnimateOnScroll delay={180}>
              <div className="glass-card grad-border noise rounded-2xl p-7 h-full min-h-[180px] relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-40 h-40 rounded-full opacity-10 blur-3xl pointer-events-none"
                  style={{ background: "radial-gradient(circle,#f59e0b,transparent)" }} />
                <div className="relative z-10">
                  <div className="inline-flex items-center justify-center size-12 rounded-2xl mb-5"
                    style={{ background: "linear-gradient(135deg,rgba(245,158,11,0.3),rgba(245,158,11,0.1))", border: "1px solid rgba(245,158,11,0.3)" }}>
                    <Image className="size-5 text-amber-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Avatar Reference</h3>
                  <p className="text-zinc-500 text-sm leading-relaxed">
                    Upload a photo and AI builds the script around that character — consistent across every scene.
                  </p>
                </div>
              </div>
            </AnimateOnScroll>

            {/* Share — wide */}
            <AnimateOnScroll delay={210} className="lg:col-span-2">
              <div className="glass-card grad-border noise rounded-2xl p-7 h-full min-h-[160px] relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-8 blur-3xl pointer-events-none"
                  style={{ background: "radial-gradient(circle,#a855f7,transparent)" }} />
                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-5">
                  <div className="inline-flex items-center justify-center size-12 rounded-2xl shrink-0"
                    style={{ background: "linear-gradient(135deg,rgba(168,85,247,0.3),rgba(168,85,247,0.1))", border: "1px solid rgba(168,85,247,0.3)" }}>
                    <Share2 className="size-5 text-violet-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">Share, Export & Remix</h3>
                    <p className="text-zinc-500 text-sm leading-relaxed">
                      Share any script with a public link. Export as plain text. Remix to generate a new variation. Script history saved forever on paid plans.
                    </p>
                  </div>
                </div>
              </div>
            </AnimateOnScroll>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════
          LIVE DEMO
      ═══════════════════════════════════ */}
      <section id="demo" className="py-24 px-5 relative">
        <div className="absolute inset-x-0 top-0 h-px" style={{ background: "linear-gradient(90deg,transparent,rgba(236,72,153,0.3),transparent)" }} />
        <div className="max-w-6xl mx-auto">
          <AnimateOnScroll className="text-center mb-12">
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-pink-400 mb-4">Live demo</p>
            <h2 className="font-black text-4xl sm:text-5xl tracking-tight leading-[1.05] mb-4">
              See a real script.{" "}
              <span style={{ backgroundImage: "linear-gradient(90deg,#ec4899,#f97316)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>Right now.</span>
            </h2>
            <p className="text-zinc-500 text-lg max-w-xl mx-auto">
              Pick any concept and explore the scene-by-scene breakdown — visuals, voiceover, on-screen text, and the AI prompt for each scene.
            </p>
          </AnimateOnScroll>
          <AnimateOnScroll delay={100}><LiveDemoSection /></AnimateOnScroll>
        </div>
      </section>

      {/* ═══════════════════════════════════
          SUPPORTED TOOLS
      ═══════════════════════════════════ */}
      <section className="py-20 px-5 relative">
        <div className="absolute inset-x-0 top-0 h-px" style={{ background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.06),transparent)" }} />
        <div className="max-w-5xl mx-auto">
          <AnimateOnScroll className="text-center mb-10">
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-zinc-500 mb-6">
              Prompt formatting for every major AI video tool
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {TOOLS.map((tool) => (
                <div key={tool.name}
                  className="glass-card rounded-2xl p-4 text-center hover:scale-[1.05] hover:-translate-y-1 transition-all duration-300 cursor-default">
                  <div className="text-2xl mb-2">{tool.emoji}</div>
                  <p className="font-bold text-[11px] text-white">{tool.name}</p>
                </div>
              ))}
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll delay={80}>
            <div className="glass-card grad-border rounded-2xl overflow-hidden mt-8">
              <div className="px-5 py-4 border-b border-white/[0.06]">
                <p className="text-xs font-medium text-zinc-500">Same scene — ScriptFlow formats it right for each tool</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/[0.06]">
                {[
                  { label: "VEO 3 — with audio", color: "#a855f7", text: "A person walks through a quiet forest at dawn, morning light filtering through pine trees, handheld camera, 9:16 vertical, 5 seconds. A narrator says: \"Every step forward is a step away from who you used to be.\" Birdsong and soft wind." },
                  { label: "Kling 2.0 — structured", color: "#f97316", text: "[Person] [walking through forest] [dawn, pine trees, morning light] --duration 5 --ar 9:16 --style cinematic --camera handheld-follow" },
                  { label: "Runway Gen-4 — motion", color: "#3b82f6", text: "Person walking forward through pine forest, camera dolly tracking from behind, dappled morning light, atmospheric depth, slow gentle motion, 9:16" },
                ].map((col) => (
                  <div key={col.label} className="p-5">
                    <p className="text-xs font-bold mb-3 flex items-center gap-2" style={{ color: col.color }}>
                      <span className="size-2 rounded-full inline-block" style={{ background: col.color }} />
                      {col.label}
                    </p>
                    <p className="text-xs font-mono text-zinc-600 leading-relaxed">{col.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ═══════════════════════════════════
          BEFORE / AFTER
      ═══════════════════════════════════ */}
      <section className="py-24 px-5 relative">
        <div className="absolute inset-x-0 top-0 h-px" style={{ background: "linear-gradient(90deg,transparent,rgba(239,68,68,0.2),transparent)" }} />
        <div className="max-w-5xl mx-auto">
          <AnimateOnScroll className="text-center mb-12">
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-zinc-500 mb-4">Why switch</p>
            <h2 className="font-black text-4xl sm:text-5xl tracking-tight leading-[1.05]">
              Stop wasting hours on what{" "}
              <span style={{ backgroundImage: "linear-gradient(90deg,#a855f7,#ec4899)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
                AI does in seconds.
              </span>
            </h2>
          </AnimateOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <AnimateOnScroll delay={0}>
              <div className="rounded-2xl border border-red-500/15 p-7 h-full noise"
                style={{ background: "rgba(239,68,68,0.04)" }}>
                <div className="flex items-center gap-2.5 mb-6">
                  <div className="size-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)" }}>
                    <X className="size-4 text-red-400" />
                  </div>
                  <h3 className="font-bold text-red-300">Before ScriptFlow</h3>
                </div>
                <ul className="space-y-4">
                  {[
                    ["15 min","Thinking through scene structure mentally"],
                    ["20 min","Writing visual descriptions for each scene"],
                    ["30 min","Crafting prompts for each AI tool — different syntax every time"],
                    ["15 min","Iterating on failed or wrong-format prompts"],
                    ["10 min","Writing voiceover and on-screen text"],
                  ].map(([time, pain]) => (
                    <li key={pain} className="flex items-start gap-3">
                      <span className="text-xs font-mono text-red-500 rounded px-2 py-0.5 shrink-0 mt-0.5" style={{ background: "rgba(239,68,68,0.1)" }}>{time}</span>
                      <span className="text-sm text-zinc-500">{pain}</span>
                    </li>
                  ))}
                  <li className="flex items-start gap-3 pt-2 border-t border-red-500/10">
                    <span className="text-xs font-mono font-bold text-red-400 rounded px-2 py-0.5 shrink-0 mt-0.5" style={{ background: "rgba(239,68,68,0.1)" }}>90 min</span>
                    <span className="text-sm font-semibold text-red-300">Per video, before you&apos;ve created anything</span>
                  </li>
                </ul>
              </div>
            </AnimateOnScroll>

            <AnimateOnScroll delay={100}>
              <div className="glass-card grad-border rounded-2xl p-7 h-full noise"
                style={{ boxShadow: "0 0 50px -15px rgba(168,85,247,0.3)" }}>
                <div className="flex items-center gap-2.5 mb-6">
                  <div className="size-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.35)" }}>
                    <Check className="size-4 text-violet-400" />
                  </div>
                  <h3 className="font-bold text-violet-300">With ScriptFlow AI</h3>
                </div>
                <ul className="space-y-4">
                  {[
                    ["30s","Type your concept, pick platform and style"],
                    ["8s","Full scene-by-scene script with voiceover generated"],
                    ["60s","Review scenes, edit any field inline"],
                    ["2 min","Generate real videos with audio for each scene"],
                    ["10s","Stitch all scenes into one final downloadable video"],
                  ].map(([time, win]) => (
                    <li key={win} className="flex items-start gap-3">
                      <span className="text-xs font-mono text-violet-400 rounded px-2 py-0.5 shrink-0 mt-0.5" style={{ background: "rgba(168,85,247,0.1)" }}>{time}</span>
                      <span className="text-sm text-zinc-400">{win}</span>
                    </li>
                  ))}
                  <li className="flex items-start gap-3 pt-2 border-t border-violet-500/10">
                    <span className="text-xs font-mono font-bold text-violet-400 rounded px-2 py-0.5 shrink-0 mt-0.5" style={{ background: "rgba(168,85,247,0.1)" }}>&lt; 5 min</span>
                    <span className="text-sm font-semibold text-violet-300">Concept to upload-ready video</span>
                  </li>
                </ul>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════
          PRICING
      ═══════════════════════════════════ */}
      <div className="relative">
        <div className="absolute inset-x-0 top-0 h-px" style={{ background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.05),transparent)" }} />
        <PricingSection />
      </div>

      {/* ═══════════════════════════════════
          FAQ
      ═══════════════════════════════════ */}
      <div className="relative">
        <div className="absolute inset-x-0 top-0 h-px" style={{ background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.05),transparent)" }} />
        <FaqSection />
      </div>

      {/* ═══════════════════════════════════
          FINAL CTA
      ═══════════════════════════════════ */}
      <section className="py-32 px-5 relative overflow-hidden aurora-bg noise">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[800px] rounded-full opacity-25 blur-[140px]"
            style={{ background: "radial-gradient(ellipse,#9333ea,transparent 70%)" }} />
          <div className="absolute bottom-0 right-1/4 h-[300px] w-[300px] rounded-full opacity-15 blur-[100px]"
            style={{ background: "radial-gradient(circle,#ec4899,transparent)" }} />
        </div>
        <AnimateOnScroll className="relative z-10 max-w-3xl mx-auto text-center">
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-violet-400 mb-5">Ready to create?</p>
          <h2 className="font-black leading-[0.95] tracking-tight mb-6"
            style={{ fontSize: "clamp(2.5rem,7vw,5rem)" }}>
            Your next video is
            <br />
            <span style={{
              backgroundImage: "linear-gradient(90deg,#a855f7 0%,#ec4899 50%,#f97316 100%)",
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
              animation: "shimmer-sweep 3s linear infinite",
            }}>
              5 minutes away.
            </span>
          </h2>
          <p className="text-zinc-400 text-lg mb-10 max-w-xl mx-auto">
            Write a concept. Get a full script. Generate videos with audio. Download the final cut.
            No other tool does all of this in one place.
          </p>
          <Link href="/signup"
            className="inline-flex items-center justify-center gap-2.5 px-10 py-4 rounded-2xl text-base font-bold text-white transition-all duration-200 animate-violet-glow"
            style={{ background: "linear-gradient(135deg,#9333ea 0%,#ec4899 60%,#f97316 100%)" }}>
            <Sparkles className="size-4" />
            Start for free — no card needed
          </Link>
          <p className="text-[11px] text-zinc-600 mt-5">3 free scripts/month · Cancel anytime</p>
        </AnimateOnScroll>
      </section>

      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org", "@type": "Organization",
        name: "ScriptFlow AI", url: BASE_URL,
        contactPoint: { "@type": "ContactPoint", email: "parthbrahmkshatriya@gmail.com", contactType: "customer support" },
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org", "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })),
      }) }} />

      {/* ═══════════════════════════════════
          FOOTER
      ═══════════════════════════════════ */}
      <footer className="py-12 px-5 border-t border-white/[0.05]" style={{ background: "#020204" }}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-8">
          <div className="flex flex-col items-center sm:items-start gap-2">
            <Link href="/" className="flex items-center gap-2 font-bold text-sm">
              <div className="size-6 rounded-lg flex items-center justify-center"
                style={{ background: "linear-gradient(135deg,#9333ea,#ec4899)" }}>
                <Sparkles className="size-3.5 text-white" />
              </div>
              <span className="text-white">ScriptFlow AI</span>
            </Link>
            <p className="text-xs text-zinc-700">Concept to finished video in minutes.</p>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-zinc-600">
            {[
              { label: "Dashboard", href: "/dashboard" },
              { label: "Blog", href: "/blog" },
              { label: "Login", href: "/login" },
              { label: "Sign Up", href: "/signup" },
              { label: "Pricing", href: "#pricing" },
              { label: "FAQ", href: "#faq" },
              { label: "Contact us", href: "/contact" },
            ].map(({ label, href }) => (
              <Link key={label} href={href} className="hover:text-white transition-colors">{label}</Link>
            ))}
          </nav>
        </div>
        <div className="max-w-6xl mx-auto mt-8 pt-8 border-t border-white/[0.04] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-700">
          <p>© {new Date().getFullYear()} ScriptFlow AI. All rights reserved.</p>
          <p>Made with ❤️ in India</p>
        </div>
      </footer>
    </div>
  )
}
