import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "YouTube Shorts Script Template: How to Write Scripts That Go Viral (2026)",
  description:
    "Proven Shorts script templates, hook frameworks, and structure guides used by creators with millions of views. Includes free templates for every niche.",
  alternates: { canonical: "https://scriptflowai.com/blog/youtube-shorts-script-template" },
  openGraph: {
    title: "YouTube Shorts Script Template: How to Write Scripts That Go Viral",
    description: "Proven YouTube Shorts script templates and hook frameworks for creators.",
    url: "https://scriptflowai.com/blog/youtube-shorts-script-template",
  },
}

export default function YouTubeShortsScriptTemplatePage() {
  return (
    <article className="max-w-3xl mx-auto px-4 py-16">
      <div className="mb-3 flex items-center gap-2 text-sm text-zinc-500">
        <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
        <span>→</span>
        <span>Scripting</span>
      </div>

      <h1 className="text-4xl font-bold leading-tight mb-4 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
        YouTube Shorts Script Template: How to Write Scripts That Go Viral
      </h1>

      <div className="flex items-center gap-3 text-sm text-zinc-500 mb-10 pb-10 border-b border-white/[0.07]">
        <span>May 5, 2026</span>
        <span>·</span>
        <span>7 min read</span>
        <span>·</span>
        <span className="text-emerald-400">Scripting</span>
      </div>

      <div className="prose prose-invert prose-zinc max-w-none space-y-6 text-zinc-300 leading-relaxed">
        <p className="text-xl text-zinc-200 leading-relaxed">
          The algorithm doesn&apos;t care how good your video looks if viewers leave in the first 2 seconds. The script is what keeps them watching — and what determines whether YouTube pushes your Short to millions of people or nobody. Here are the templates that actually work.
        </p>

        <h2 className="text-2xl font-bold text-white mt-10 mb-4">Why Script Structure Matters for Shorts</h2>
        <p>
          YouTube Shorts has a unique retention challenge: viewers can swipe away instantly, and swipe-aways tank your reach. The algorithm is trained to detect watch-through rate — videos that hold viewers to the end get pushed aggressively.
        </p>
        <p>
          The scripts that go viral follow predictable structures. They&apos;re not random. Once you internalize these templates, scripting a Short takes 5 minutes, not 45.
        </p>

        <h2 className="text-2xl font-bold text-white mt-10 mb-4">The 3-Act Shorts Structure</h2>
        <p>Every successful Short — regardless of niche — follows this structure:</p>

        <div className="grid gap-4 my-6">
          {[
            {
              act: "Act 1: Hook (0-3 seconds)",
              purpose: "Stop the scroll",
              description: "Make a bold claim, show something unexpected, or ask a question that creates an information gap. The viewer must feel they need to watch more.",
              color: "border-rose-500/20 bg-rose-500/5 text-rose-300",
            },
            {
              act: "Act 2: Delivery (3-50 seconds)",
              purpose: "Fulfill the promise",
              description: "Deliver on the hook's promise with clear, fast-moving content. Cut any sentence that doesn't advance the story. Every scene should earn its place.",
              color: "border-blue-500/20 bg-blue-500/5 text-blue-300",
            },
            {
              act: "Act 3: Punchline/CTA (50-60 seconds)",
              purpose: "Reward and redirect",
              description: "End with a payoff that makes watching worth it — a surprising fact, a satisfying conclusion, or a result that validates the hook. Then add a soft CTA.",
              color: "border-emerald-500/20 bg-emerald-500/5 text-emerald-300",
            },
          ].map((item) => (
            <div key={item.act} className={`border rounded-xl p-5 ${item.color}`}>
              <h3 className="font-bold text-white text-base mb-1">{item.act}</h3>
              <p className="text-xs font-medium opacity-70 mb-2">Goal: {item.purpose}</p>
              <p className="text-sm opacity-80">{item.description}</p>
            </div>
          ))}
        </div>

        <h2 className="text-2xl font-bold text-white mt-10 mb-4">5 Hook Templates That Work in Every Niche</h2>
        <p>Your hook determines 80% of your video&apos;s performance. Here are the five frameworks used by top Shorts creators:</p>

        <div className="space-y-5">
          {[
            {
              name: "The Counterintuitive Statement",
              template: "\"[Widely believed thing] is [surprising contradiction].\"",
              example: "\"Working longer hours is actually killing your productivity.\"",
            },
            {
              name: "The Specific Result Claim",
              template: "\"I [achieved specific result] in [timeframe] by doing [one thing].\"",
              example: "\"I grew to 10K subscribers in 30 days without showing my face.\"",
            },
            {
              name: "The Question with Stakes",
              template: "\"What would you do if [high-stakes scenario]?\"",
              example: "\"What would you do if your AI video went viral overnight and you weren't ready?\"",
            },
            {
              name: "The Mistake Confession",
              template: "\"I spent [time/money] doing [common thing] before I realized [truth].\"",
              example: "\"I wasted 3 months writing scripts manually before discovering this workflow.\"",
            },
            {
              name: "The List Tease",
              template: "\"[Number] things [target audience] wishes they knew about [topic].\"",
              example: "\"5 things AI video creators don't tell you about going viral.\"",
            },
          ].map((hook) => (
            <div key={hook.name} className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-5">
              <h3 className="text-base font-semibold text-white mb-2">{hook.name}</h3>
              <p className="text-sm text-violet-300 font-mono mb-2">{hook.template}</p>
              <p className="text-sm text-zinc-400">Example: <em>{hook.example}</em></p>
            </div>
          ))}
        </div>

        <h2 className="text-2xl font-bold text-white mt-10 mb-4">Full Script Templates by Duration</h2>

        <h3 className="text-lg font-semibold text-white mb-3">15-Second Short (Punchy, single point)</h3>
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-5 font-mono text-sm space-y-2">
          <p className="text-rose-300">[0-2s] HOOK: Bold claim or shocking visual</p>
          <p className="text-blue-300">[2-11s] POINT: One clear takeaway, maximum 2 sentences</p>
          <p className="text-emerald-300">[11-15s] CTA: &quot;Follow for more&quot; or tag someone this applies to</p>
        </div>

        <h3 className="text-lg font-semibold text-white mb-3 mt-6">30-Second Short (Tutorial or tip)</h3>
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-5 font-mono text-sm space-y-2">
          <p className="text-rose-300">[0-3s] HOOK: Problem or bold promise</p>
          <p className="text-blue-300">[3-10s] CONTEXT: Why this matters</p>
          <p className="text-blue-300">[10-22s] CONTENT: Step-by-step or 3 key points</p>
          <p className="text-amber-300">[22-27s] RESULT: Show the outcome</p>
          <p className="text-emerald-300">[27-30s] CTA: Follow / comment / save</p>
        </div>

        <h3 className="text-lg font-semibold text-white mb-3 mt-6">60-Second Short (Story or deep dive)</h3>
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-5 font-mono text-sm space-y-2">
          <p className="text-rose-300">[0-4s] HOOK: Teaser of the payoff or a question</p>
          <p className="text-blue-300">[4-15s] SETUP: Context and stakes</p>
          <p className="text-blue-300">[15-30s] CONFLICT: Problem, challenge, or turning point</p>
          <p className="text-blue-300">[30-50s] RESOLUTION: How it was solved or what you learned</p>
          <p className="text-amber-300">[50-56s] PAYOFF: The surprising result or key insight</p>
          <p className="text-emerald-300">[56-60s] CTA: Comment your situation, follow, share</p>
        </div>

        <h2 className="text-2xl font-bold text-white mt-10 mb-4">On-Screen Text Rules</h2>
        <p>On-screen text boosts retention by 40% in most niches. But most creators use it wrong:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong className="text-white">Max 10 words per screen</strong> — more than 10 and viewers read instead of watch</li>
          <li><strong className="text-white">Mirror the voiceover</strong> — show what you&apos;re saying, not extra info</li>
          <li><strong className="text-white">Change text every 3-5 seconds</strong> — stale text = viewers stop reading</li>
          <li><strong className="text-white">High contrast always</strong> — white text with black drop shadow, or vice versa</li>
          <li><strong className="text-white">Upper third or lower third</strong> — center-screen text competes with your video</li>
        </ul>

        <h2 className="text-2xl font-bold text-white mt-10 mb-4">Automate Your Scripting Workflow</h2>
        <p>
          These templates give you the structure. But filling in every scene — voiceover text, visual descriptions, on-screen text, music suggestions, and AI video prompts — still takes time if you&apos;re doing it manually.
        </p>
        <p>
          ScriptFlow AI takes your concept and the template structure and generates a complete script with every field filled in, including copy-paste-ready AI video prompts for VEO 3, Kling, or Runway.
        </p>

        <div className="bg-gradient-to-br from-violet-600/10 to-blue-600/10 border border-violet-500/20 rounded-2xl p-8 text-center mt-10">
          <h3 className="text-xl font-bold mb-2">Generate a Full Short Script in 10 Seconds</h3>
          <p className="text-zinc-400 mb-5 text-sm">Type your concept → get voiceover, scenes, text overlays, and AI prompts instantly</p>
          <Link
            href="/youtube-shorts-script-generator"
            className="inline-block bg-violet-600 hover:bg-violet-500 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            Try YouTube Shorts Script Generator →
          </Link>
        </div>
      </div>
    </article>
  )
}
