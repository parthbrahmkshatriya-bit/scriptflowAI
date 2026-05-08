import type { Metadata } from "next"
import Link from "next/link"
import { Sparkles, Zap, Copy, Film } from "lucide-react"

export const metadata: Metadata = {
  title: "Kling AI Script Generator — AI Script Writer for Kling 2.0 Video",
  description:
    "Generate complete Kling 2.0 production scripts with formatted prompts for every scene. Turn any video idea into a Kling-formatted script in 10 seconds.",
  alternates: { canonical: "https://scriptflowai.com/kling-script-generator" },
  openGraph: {
    title: "Kling AI Script Generator — Script Writer for Kling 2.0",
    description: "Generate Kling 2.0-formatted scripts with scene-by-scene prompts in 10 seconds.",
    url: "https://scriptflowai.com/kling-script-generator",
  },
}

const features = [
  {
    icon: Film,
    title: "Kling 2.0-Formatted Prompts",
    description:
      "Every scene gets a structured Kling prompt with subject, action, setting, --duration, --ar 9:16, and --style parameters ready to paste.",
  },
  {
    icon: Zap,
    title: "Optimized for Kling's Strengths",
    description:
      "Prompts are written to leverage Kling's best capabilities: anime styles, consistent subjects, fast generation, and stylized aesthetics.",
  },
  {
    icon: Copy,
    title: "Full Production Package",
    description:
      "Beyond just Kling prompts — voiceover scripts, on-screen text, music suggestions, and transitions so you can complete the full video.",
  },
]

const examplePrompts = [
  {
    scene: "Scene 1 — Hook (3s)",
    prompt:
      "[Glowing data streams] [Flow through abstract neural network visualization] [Dark void background with purple and blue accent lights] --duration 3 --ar 9:16 --style cinematic",
  },
  {
    scene: "Scene 2 — Content (5s)",
    prompt:
      "[Professional developer] [Types rapidly at futuristic holographic keyboard] [Modern minimalist office, ambient blue lighting] --duration 5 --ar 9:16 --style realistic",
  },
  {
    scene: "Scene 3 — Payoff (4s)",
    prompt:
      "[Success notification popup] [Expands dramatically with particle celebration effects] [Clean dark background, vibrant green and gold colors] --duration 4 --ar 9:16 --style stylized",
  },
]

export default function KlingScriptGeneratorPage() {
  return (
    <div className="min-h-screen bg-[#050508] text-white">
      {/* Header */}
      <header className="border-b border-white/[0.06] sticky top-0 z-50 bg-[#050508]/90 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-base">
            <div className="size-7 rounded-lg bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center">
              <Sparkles className="size-3.5 text-white" />
            </div>
            <span className="bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
              ScriptFlow AI
            </span>
          </Link>
          <Link
            href="/signup"
            className="bg-violet-600 hover:bg-violet-500 text-white px-4 py-1.5 rounded-lg transition-colors text-sm font-medium"
          >
            Get Started Free
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-medium mb-6">
          <Film className="size-3" />
          Kling 2.0 Script Generator
        </div>
        <h1 className="text-5xl font-bold leading-tight mb-6 bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
          Generate Kling 2.0 Scripts<br />
          <span className="text-violet-400">in 10 Seconds</span>
        </h1>
        <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Enter your video concept and get a complete scene-by-scene script with Kling 2.0-formatted prompts. Structured parameter format, ready to paste directly into Kling.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            href="/signup"
            className="bg-violet-600 hover:bg-violet-500 text-white font-semibold px-8 py-4 rounded-xl transition-colors text-lg"
          >
            Generate Free Kling Script
          </Link>
          <Link
            href="/blog/kling-vs-runway-vs-veo3"
            className="text-zinc-400 hover:text-white transition-colors text-sm"
          >
            Compare Kling vs Runway vs VEO 3 →
          </Link>
        </div>
        <p className="text-sm text-zinc-600 mt-4">3 free scripts — no credit card required</p>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          What You Get with Every Kling Script
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6">
              <div className="size-10 rounded-xl bg-violet-500/15 flex items-center justify-center mb-4">
                <f.icon className="size-5 text-violet-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Example output */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Example Kling 2.0 Script Output</h2>
          <p className="text-zinc-400">
            Concept: &quot;Why AI is changing software development forever&quot;
          </p>
        </div>
        <div className="space-y-4">
          {examplePrompts.map((ex) => (
            <div key={ex.scene} className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-5">
              <p className="text-xs font-medium text-violet-400 mb-2">{ex.scene}</p>
              <p className="text-sm text-zinc-300 leading-relaxed font-mono">
                {ex.prompt}
              </p>
            </div>
          ))}
        </div>
        <p className="text-center text-zinc-500 text-sm mt-4">
          Full script includes voiceover text, on-screen text, music suggestions, and transitions
        </p>
      </section>

      {/* Kling strengths */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Best Niches for Kling 2.0</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { niche: "Anime & Animation", desc: "Native anime style support, consistent characters" },
            { niche: "Tech & AI Content", desc: "Abstract visuals, data visualization, futuristic" },
            { niche: "Gaming Content", desc: "Stylized renders, consistent game-adjacent aesthetics" },
            { niche: "Music Videos", desc: "Abstract motion, rhythmic scene changes" },
            { niche: "Fantasy & Sci-Fi", desc: "Creative environments that don't exist in reality" },
            { niche: "Faceless Channels", desc: "Fast batch generation for high-volume publishing" },
          ].map((item) => (
            <div key={item.niche} className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-4">
              <p className="font-semibold text-violet-300 text-sm mb-1">{item.niche}</p>
              <p className="text-zinc-500 text-xs">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-10">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {[
            {
              q: "What is a Kling script generator?",
              a: "A Kling script generator creates a complete video production script with prompts formatted for Kling 2.0's structured parameter system. ScriptFlow AI generates scene-by-scene scripts with [Subject] [Action] [Setting] --ar --style format ready to paste into Kling.",
            },
            {
              q: "Does Kling 2.0 support YouTube Shorts format?",
              a: "Yes. Kling 2.0 supports 9:16 vertical format via the --ar 9:16 parameter. All ScriptFlow AI scripts include this parameter in every scene prompt.",
            },
            {
              q: "Is Kling good for anime-style content?",
              a: "Kling 2.0 has the best anime and stylized video output of any major AI video tool. The --style parameter accepts 'anime', 'cartoon', 'realistic', and others. Our scripts include the optimal style flag for your content type.",
            },
            {
              q: "Can I generate scripts for other tools too?",
              a: "Yes — ScriptFlow AI supports VEO 3, Runway Gen-4, Pika 2.0, Midjourney, and generic prompts. Each tool gets properly formatted prompts for its specific system.",
            },
          ].map((item) => (
            <div key={item.q} className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-5">
              <h3 className="font-semibold text-white mb-2">{item.q}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="bg-gradient-to-br from-violet-600/10 to-blue-600/10 border border-violet-500/20 rounded-2xl p-10">
          <h2 className="text-3xl font-bold mb-4">Start Generating Kling 2.0 Scripts</h2>
          <p className="text-zinc-400 mb-8 text-lg">
            3 free scripts. No credit card. Formatted for Kling 2.0 out of the box.
          </p>
          <Link
            href="/signup"
            className="inline-block bg-violet-600 hover:bg-violet-500 text-white font-semibold px-8 py-4 rounded-xl transition-colors text-lg"
          >
            Generate Free Kling Script →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-10">
        <div className="max-w-5xl mx-auto px-4 text-center text-sm text-zinc-500">
          <p className="mb-2">ScriptFlow AI — AI Video Script Generator for YouTube Shorts, Reels & TikTok</p>
          <p className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
            <Link href="/blog/kling-vs-runway-vs-veo3" className="hover:text-white transition-colors">Kling vs VEO 3</Link>
            <Link href="/veo3-script-generator" className="hover:text-white transition-colors">VEO 3 Generator</Link>
            <Link href="/youtube-shorts-script-generator" className="hover:text-white transition-colors">Shorts Generator</Link>
          </p>
        </div>
      </footer>
    </div>
  )
}
