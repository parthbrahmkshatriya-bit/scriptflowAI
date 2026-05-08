import type { Metadata } from "next"
import Link from "next/link"
import { Sparkles, Zap, Copy, Film } from "lucide-react"

export const metadata: Metadata = {
  title: "VEO 3 Script Generator — AI Script Writer for YouTube Shorts",
  description:
    "Generate complete VEO 3 production scripts with copy-paste prompts for every scene. Turn any video idea into a VEO 3-formatted script in 10 seconds.",
  alternates: { canonical: "https://scriptflowai.com/veo3-script-generator" },
  openGraph: {
    title: "VEO 3 Script Generator — AI Script Writer for YouTube Shorts",
    description: "Generate VEO 3-formatted scripts with scene-by-scene prompts in 10 seconds.",
    url: "https://scriptflowai.com/veo3-script-generator",
  },
}

const features = [
  {
    icon: Film,
    title: "VEO 3-Formatted Prompts",
    description:
      "Every scene gets a natural language VEO 3 prompt with subject, action, lighting, camera direction, duration, and 9:16 vertical specification.",
  },
  {
    icon: Zap,
    title: "Complete Scene Breakdown",
    description:
      "Voiceover text, on-screen text, music suggestions, transitions — everything you need to produce the full video, not just the AI clips.",
  },
  {
    icon: Copy,
    title: "Copy-Paste Ready",
    description:
      "Each VEO 3 prompt is ready to paste directly into the generator. No editing required — just copy and generate.",
  },
]

const examplePrompts = [
  {
    scene: "Scene 1 — Hook (3s)",
    prompt:
      "A glowing smartphone screen lights up a dark room, slow push in toward the screen showing a viral notification counter climbing rapidly, dramatic blue-white light, cinematic close-up, 3 seconds, 9:16 vertical",
  },
  {
    scene: "Scene 2 — Establish (5s)",
    prompt:
      "Young content creator sits at a minimal desk setup, ring light illuminating confident expression, camera slowly pulls back to reveal dual monitor setup with analytics dashboard visible, warm studio lighting, 5 seconds, 9:16 vertical",
  },
  {
    scene: "Scene 3 — Payoff (4s)",
    prompt:
      "Screen recording of YouTube Studio dashboard showing subscriber count jumping from 1K to 100K, animated number counter, dark background with green growth indicators, overhead tracking shot, 4 seconds, 9:16 vertical",
  },
]

export default function Veo3ScriptGeneratorPage() {
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
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-medium mb-6">
          <Film className="size-3" />
          VEO 3 Script Generator
        </div>
        <h1 className="text-5xl font-bold leading-tight mb-6 bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
          Generate VEO 3 Scripts<br />
          <span className="text-blue-400">in 10 Seconds</span>
        </h1>
        <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Enter your video concept and get a complete scene-by-scene script with VEO 3-formatted prompts ready to paste. Includes voiceover, on-screen text, and timing for every scene.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            href="/signup"
            className="bg-violet-600 hover:bg-violet-500 text-white font-semibold px-8 py-4 rounded-xl transition-colors text-lg"
          >
            Generate Free VEO 3 Script
          </Link>
          <Link
            href="/blog/veo3-prompt-guide"
            className="text-zinc-400 hover:text-white transition-colors text-sm"
          >
            Read the VEO 3 prompt guide →
          </Link>
        </div>
        <p className="text-sm text-zinc-600 mt-4">3 free scripts — no credit card required</p>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          What You Get with Every VEO 3 Script
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6">
              <div className="size-10 rounded-xl bg-blue-500/15 flex items-center justify-center mb-4">
                <f.icon className="size-5 text-blue-400" />
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
          <h2 className="text-3xl font-bold mb-4">Example VEO 3 Script Output</h2>
          <p className="text-zinc-400">
            Concept: &quot;How I grew a YouTube channel to 100K subscribers without showing my face&quot;
          </p>
        </div>
        <div className="space-y-4">
          {examplePrompts.map((ex) => (
            <div key={ex.scene} className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-5">
              <p className="text-xs font-medium text-blue-400 mb-2">{ex.scene}</p>
              <p className="text-sm text-zinc-300 leading-relaxed">
                <span className="text-zinc-500 mr-2">VEO 3 Prompt:</span>
                &quot;{ex.prompt}&quot;
              </p>
            </div>
          ))}
        </div>
        <p className="text-center text-zinc-500 text-sm mt-4">
          Full script includes voiceover text, on-screen text, music suggestions, and transitions for each scene
        </p>
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-6 text-center">
          {[
            { n: "1", title: "Enter your concept", desc: "Type your video idea in plain English — one sentence is enough." },
            { n: "2", title: "Select VEO 3", desc: "Choose VEO 3 as your AI tool, set duration and style." },
            { n: "3", title: "Get your script", desc: "Download a complete script with VEO 3 prompts for every scene, ready to paste." },
          ].map((step) => (
            <div key={step.n} className="flex flex-col items-center">
              <div className="size-12 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-300 font-bold text-lg mb-4">
                {step.n}
              </div>
              <h3 className="font-semibold text-white mb-2">{step.title}</h3>
              <p className="text-zinc-400 text-sm">{step.desc}</p>
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
              q: "What is a VEO 3 script generator?",
              a: "A VEO 3 script generator takes your video concept and produces a complete scene-by-scene production script with prompts formatted specifically for Google's VEO 3 AI video model. ScriptFlow AI does this in under 10 seconds.",
            },
            {
              q: "Are the VEO 3 prompts ready to use directly?",
              a: "Yes. Each prompt follows the VEO 3 natural language format with subject, action, setting, lighting, camera direction, duration, and 9:16 aspect ratio specification. Copy and paste directly into VEO 3.",
            },
            {
              q: "Does this work for YouTube Shorts specifically?",
              a: "Yes — all scripts are optimized for 9:16 vertical format with durations of 15, 30, or 60 seconds, and include hooks, pacing, and CTAs appropriate for YouTube Shorts.",
            },
            {
              q: "Can I use it for other AI tools besides VEO 3?",
              a: "ScriptFlow AI also supports Kling 2.0, Runway Gen-4, Pika 2.0, Midjourney, and generic prompts. Switch tools from the dropdown and get tool-specific formatting.",
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
          <h2 className="text-3xl font-bold mb-4">Start Generating VEO 3 Scripts</h2>
          <p className="text-zinc-400 mb-8 text-lg">
            3 free scripts. No credit card. No prompting experience needed.
          </p>
          <Link
            href="/signup"
            className="inline-block bg-violet-600 hover:bg-violet-500 text-white font-semibold px-8 py-4 rounded-xl transition-colors text-lg"
          >
            Generate Free VEO 3 Script →
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
            <Link href="/blog/veo3-prompt-guide" className="hover:text-white transition-colors">VEO 3 Prompt Guide</Link>
            <Link href="/youtube-shorts-script-generator" className="hover:text-white transition-colors">Shorts Generator</Link>
            <Link href="/kling-script-generator" className="hover:text-white transition-colors">Kling Generator</Link>
          </p>
        </div>
      </footer>
    </div>
  )
}
