import type { Metadata } from "next"
import Link from "next/link"
import { Sparkles, Zap, Copy, Film, TrendingUp } from "lucide-react"

export const metadata: Metadata = {
  title: "YouTube Shorts Script Generator — AI Script Writer for Shorts (2026)",
  description:
    "Generate complete YouTube Shorts scripts with hooks, voiceover, on-screen text, and AI video prompts in 10 seconds. Free to start — no credit card required.",
  alternates: { canonical: "https://scriptflowai.com/youtube-shorts-script-generator" },
  openGraph: {
    title: "YouTube Shorts Script Generator — AI Script Writer for Shorts",
    description: "Generate complete YouTube Shorts scripts with hooks and AI prompts in 10 seconds.",
    url: "https://scriptflowai.com/youtube-shorts-script-generator",
  },
}

const features = [
  {
    icon: TrendingUp,
    title: "Viral Hook Frameworks",
    description:
      "Every script opens with a hook designed to maximize watch-through rate — counterintuitive statements, specific result claims, and curiosity gaps.",
  },
  {
    icon: Film,
    title: "Scene-by-Scene Breakdown",
    description:
      "Get timing, visual descriptions, camera directions, and AI generation prompts for every scene. Full production-ready output, not just a voiceover script.",
  },
  {
    icon: Zap,
    title: "Works with All AI Tools",
    description:
      "Select your AI video tool (VEO 3, Kling, Runway, Pika) and get prompts formatted for that specific tool. Switch tools without rewriting anything.",
  },
  {
    icon: Copy,
    title: "Copy-Paste Ready",
    description:
      "Every AI prompt, voiceover line, and on-screen text is ready to use. No editing — just copy and produce.",
  },
]

const exampleScript = [
  {
    scene: "Scene 1 — Hook (0-3s)",
    visual: "Close-up of phone screen showing viral notification counter climbing",
    voiceover: "Most YouTube Shorts fail for the same reason — and it's not the algorithm.",
    onScreen: "WHY YOUR SHORTS AREN'T GOING VIRAL",
    prompt: "Close-up of smartphone screen with viral notification counter rapidly climbing, dramatic blue light, slow push-in camera, 3 seconds, 9:16 vertical",
  },
  {
    scene: "Scene 2 — Setup (3-12s)",
    visual: "Creator at desk looking frustrated, multiple browser tabs open",
    voiceover: "Most creators spend hours on production and 30 seconds on their hook. The hook is literally 80% of your video's performance.",
    onScreen: "THE HOOK = 80% OF YOUR RESULTS",
    prompt: "Frustrated content creator at desk, multiple monitors showing analytics with low numbers, overhead studio lighting, slow tracking shot, 9 seconds, 9:16 vertical",
  },
  {
    scene: "Scene 3 — Solution (12-52s)",
    visual: "Screen recording showing ScriptFlow AI generating a script",
    voiceover: "Here are the 5 hook frameworks that work in any niche...",
    onScreen: "5 HOOK FRAMEWORKS THAT WORK",
    prompt: "Screen recording of AI tool generating video script, animated text appearing, clean dark interface, overhead perspective, 40 seconds, 9:16 vertical",
  },
  {
    scene: "Scene 4 — CTA (52-60s)",
    visual: "Creator looking confident at camera, subscribe animation",
    voiceover: "Follow for the full hook swipe file — I post one every week.",
    onScreen: "FOLLOW FOR MORE",
    prompt: "Confident creator looking directly at camera, warm studio lighting, slight zoom in, subscribe button animation in corner, 8 seconds, 9:16 vertical",
  },
]

export default function YouTubeShortsScriptGeneratorPage() {
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
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-medium mb-6">
          <TrendingUp className="size-3" />
          YouTube Shorts Script Generator
        </div>
        <h1 className="text-5xl font-bold leading-tight mb-6 bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
          Write YouTube Shorts Scripts<br />
          <span className="text-rose-400">10x Faster with AI</span>
        </h1>
        <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Enter your video concept and get a complete YouTube Short: hook, scenes, voiceover, on-screen text, and AI video prompts for every scene. Production-ready in 10 seconds.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            href="/signup"
            className="bg-violet-600 hover:bg-violet-500 text-white font-semibold px-8 py-4 rounded-xl transition-colors text-lg"
          >
            Generate Free Shorts Script
          </Link>
          <Link
            href="/blog/youtube-shorts-script-template"
            className="text-zinc-400 hover:text-white transition-colors text-sm"
          >
            Read the Shorts script guide →
          </Link>
        </div>
        <p className="text-sm text-zinc-600 mt-4">3 free scripts — no credit card required</p>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Everything in Every Script
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          {features.map((f) => (
            <div key={f.title} className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6 flex gap-4">
              <div className="size-10 rounded-xl bg-rose-500/15 flex items-center justify-center shrink-0">
                <f.icon className="size-5 text-rose-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{f.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Example script */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Example YouTube Shorts Script</h2>
          <p className="text-zinc-400">
            Concept: &quot;Why most YouTube Shorts fail and how to fix it&quot; — 60 seconds, VEO 3
          </p>
        </div>
        <div className="space-y-4">
          {exampleScript.map((scene) => (
            <div key={scene.scene} className="bg-white/[0.03] border border-white/[0.07] rounded-xl overflow-hidden">
              <div className="bg-white/[0.03] px-5 py-3 border-b border-white/[0.07]">
                <p className="text-sm font-medium text-rose-400">{scene.scene}</p>
              </div>
              <div className="p-5 grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Voiceover</p>
                  <p className="text-zinc-300">&quot;{scene.voiceover}&quot;</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">On-Screen Text</p>
                  <p className="text-zinc-300 font-semibold">{scene.onScreen}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">VEO 3 Prompt</p>
                  <p className="text-emerald-300 font-mono text-xs leading-relaxed">&quot;{scene.prompt}&quot;</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Durations */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Scripts for Every Duration</h2>
        <div className="grid md:grid-cols-3 gap-6 text-center">
          {[
            {
              duration: "15 Seconds",
              scenes: "3-4 scenes",
              best: "Product reveals, quick tips, reaction clips",
              desc: "Maximum punch. Single takeaway, bold hook, immediate CTA.",
            },
            {
              duration: "30 Seconds",
              scenes: "5-6 scenes",
              best: "Tutorials, listicles, how-tos",
              desc: "Sweet spot for tutorials. Enough time to deliver value, short enough to hold attention.",
            },
            {
              duration: "60 Seconds",
              scenes: "8-12 scenes",
              best: "Stories, deep dives, transformations",
              desc: "Maximum YouTube Shorts length. Best for storytelling and building connection.",
            },
          ].map((item) => (
            <div key={item.duration} className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6">
              <p className="text-2xl font-bold text-white mb-1">{item.duration}</p>
              <p className="text-xs text-zinc-500 mb-4">{item.scenes}</p>
              <p className="text-sm text-violet-300 font-medium mb-2">Best for:</p>
              <p className="text-sm text-zinc-400 mb-3">{item.best}</p>
              <p className="text-xs text-zinc-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* India CTA */}
      <section className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 text-center">
          <p className="text-zinc-400 text-sm">
            🇮🇳 Available in India — Creator plan starting at{" "}
            <span className="text-white font-semibold">₹599/mo</span> (introductory price). Pay with UPI, cards, or net banking.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-10">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {[
            {
              q: "What does a YouTube Shorts script generator do?",
              a: "It takes your video concept and produces a full production script: hook, scene-by-scene breakdown, voiceover text, on-screen text, AI video generation prompts, music suggestions, and transitions. ScriptFlow AI generates this in under 10 seconds.",
            },
            {
              q: "Does it work for any niche?",
              a: "Yes. ScriptFlow AI has generated scripts for finance, tech, travel, fitness, food, motivation, gaming, education, and dozens of other niches. The AI adapts the hook style and content structure to fit your specific concept.",
            },
            {
              q: "Which AI video tools does it support?",
              a: "VEO 3, Kling 2.0, Runway Gen-4, Pika 2.0, Midjourney, and a generic format that works with any tool. Select your tool before generating and the prompts are formatted appropriately.",
            },
            {
              q: "How many scripts can I generate for free?",
              a: "3 scripts on the free plan, no credit card required. Upgrade to Creator (₹599/mo) for 30 scripts/month, or Pro (₹1,199/mo) for unlimited.",
            },
            {
              q: "Can I use this for Instagram Reels and TikTok too?",
              a: "Yes. All scripts are in 9:16 vertical format and work for YouTube Shorts, Instagram Reels, and TikTok. Select your platform in the form and the pacing and CTA are adjusted accordingly.",
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
          <h2 className="text-3xl font-bold mb-4">Write Your First Shorts Script Free</h2>
          <p className="text-zinc-400 mb-8 text-lg">
            3 free scripts. No credit card. Works for any niche.
          </p>
          <Link
            href="/signup"
            className="inline-block bg-violet-600 hover:bg-violet-500 text-white font-semibold px-8 py-4 rounded-xl transition-colors text-lg"
          >
            Generate Free YouTube Shorts Script →
          </Link>
          <p className="text-zinc-600 text-sm mt-4">✓ 7-day money-back guarantee on paid plans</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-10">
        <div className="max-w-5xl mx-auto px-4 text-center text-sm text-zinc-500">
          <p className="mb-2">ScriptFlow AI — AI Video Script Generator for YouTube Shorts, Reels & TikTok</p>
          <p className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
            <Link href="/blog/youtube-shorts-script-template" className="hover:text-white transition-colors">Script Templates</Link>
            <Link href="/veo3-script-generator" className="hover:text-white transition-colors">VEO 3 Generator</Link>
            <Link href="/kling-script-generator" className="hover:text-white transition-colors">Kling Generator</Link>
          </p>
        </div>
      </footer>
    </div>
  )
}
