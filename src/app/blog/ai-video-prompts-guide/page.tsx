import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "How to Write AI Video Prompts: The Ultimate Guide for Creators (2026)",
  description:
    "The complete guide to prompt engineering for AI video tools. Covers VEO 3, Kling, Runway, Pika, and Midjourney with real examples and templates.",
  alternates: { canonical: "https://scriptflowai.com/blog/ai-video-prompts-guide" },
  openGraph: {
    title: "How to Write AI Video Prompts: The Ultimate Guide for Creators",
    description: "Complete prompt engineering guide for VEO 3, Kling, Runway, Pika, and Midjourney.",
    url: "https://scriptflowai.com/blog/ai-video-prompts-guide",
  },
}

export default function AiVideoPromptsGuidePage() {
  return (
    <article className="max-w-3xl mx-auto px-4 py-16">
      <div className="mb-3 flex items-center gap-2 text-sm text-zinc-500">
        <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
        <span>→</span>
        <span>Prompt Engineering</span>
      </div>

      <h1 className="text-4xl font-bold leading-tight mb-4 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
        How to Write AI Video Prompts: The Ultimate Guide for Creators (2026)
      </h1>

      <div className="flex items-center gap-3 text-sm text-zinc-500 mb-10 pb-10 border-b border-white/[0.07]">
        <span>May 7, 2026</span>
        <span>·</span>
        <span>10 min read</span>
        <span>·</span>
        <span className="text-amber-400">Prompt Engineering</span>
      </div>

      <div className="prose prose-invert prose-zinc max-w-none space-y-6 text-zinc-300 leading-relaxed">
        <p className="text-xl text-zinc-200 leading-relaxed">
          AI video tools have transformed what&apos;s possible for solo creators. But the gap between a mediocre output and a stunning clip comes down almost entirely to how you write the prompt. This guide covers universal principles that work across every major tool, plus tool-specific tips for VEO 3, Kling, Runway, Pika, and Midjourney.
        </p>

        <h2 className="text-2xl font-bold text-white mt-10 mb-4">The 7 Elements of a Great AI Video Prompt</h2>
        <p>Every excellent AI video prompt includes some combination of these seven elements:</p>

        <div className="grid gap-3 my-6">
          {[
            { n: "1", label: "Subject", desc: "Who or what is in the shot. Be specific — not 'a person' but 'a young man in his 30s with curly hair'." },
            { n: "2", label: "Action", desc: "What the subject is doing. Use active, specific verbs: walks briskly, pours carefully, gazes into distance." },
            { n: "3", label: "Setting", desc: "Where the scene takes place. Include environment, time of day, and any notable details." },
            { n: "4", label: "Lighting", desc: "How the scene is lit. This is the most underrated element — lighting defines the mood." },
            { n: "5", label: "Camera", desc: "Where the camera is and how it moves. Static, tracking, dolly push, aerial, close-up, wide, etc." },
            { n: "6", label: "Style", desc: "The visual aesthetic: cinematic, anime, cartoon, minimal, realistic, etc." },
            { n: "7", label: "Technical", desc: "Duration, aspect ratio (9:16 for Shorts), and any tool-specific parameters." },
          ].map((item) => (
            <div key={item.n} className="flex gap-4 bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
              <div className="size-7 rounded-full bg-violet-600/20 text-violet-300 flex items-center justify-center text-sm font-bold shrink-0">
                {item.n}
              </div>
              <div>
                <p className="font-semibold text-white text-sm mb-1">{item.label}</p>
                <p className="text-sm text-zinc-400">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <h2 className="text-2xl font-bold text-white mt-10 mb-4">Universal Prompt Principles</h2>

        <h3 className="text-lg font-semibold text-white mb-3">Be specific, not generic</h3>
        <p>AI models interpret vague prompts by averaging their training data. &quot;A nice sunset&quot; produces a mediocre sunset. &quot;A fiery orange and crimson sunset over the Pacific Ocean, sun partially below the horizon, long shadows stretching across wet sand&quot; produces something cinematic.</p>
        <div className="grid grid-cols-2 gap-3 my-4">
          <div className="bg-rose-500/5 border border-rose-500/20 rounded-xl p-4">
            <p className="text-xs text-rose-400 font-medium mb-2">❌ Weak</p>
            <p className="text-sm text-zinc-300">&quot;A person running in the city&quot;</p>
          </div>
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4">
            <p className="text-xs text-emerald-400 font-medium mb-2">✓ Strong</p>
            <p className="text-sm text-zinc-300">&quot;A woman in athletic gear sprints through empty Manhattan streets at dawn, camera tracks low beside her, morning mist, golden light between skyscrapers&quot;</p>
          </div>
        </div>

        <h3 className="text-lg font-semibold text-white mb-3">One subject per scene</h3>
        <p>Every AI video tool struggles when you give it too many subjects doing different things. Focus each prompt on one primary subject. If you need multiple subjects, write it as a wide establishing shot or keep them in the background.</p>

        <h3 className="text-lg font-semibold text-white mb-3">Lead with the most important element</h3>
        <p>Most AI models weight the beginning of prompts more heavily. Put your subject and primary action first, then add context and technical details at the end.</p>

        <h2 className="text-2xl font-bold text-white mt-10 mb-4">Tool-Specific Prompt Formats</h2>

        <h3 className="text-lg font-semibold text-blue-300 mb-3">VEO 3</h3>
        <p>VEO 3 uses pure natural language. Write as if describing the scene to a cinematographer. It responds best to specific cinematic language.</p>
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-4 text-sm text-emerald-300 mb-2">
          &quot;[Subject doing action] in [setting with atmosphere], [lighting description], [camera movement], [duration in seconds], 9:16 vertical format&quot;
        </div>
        <p className="text-sm text-zinc-500">Key tip: Always end with &quot;9:16 vertical format&quot; — VEO 3 defaults to landscape.</p>

        <h3 className="text-lg font-semibold text-violet-300 mb-3 mt-6">Kling 2.0</h3>
        <p>Kling uses a semi-structured format with square bracket notation and parameters.</p>
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-4 text-sm text-violet-300 mb-2">
          [Subject] [Action] [Setting and atmosphere] --duration [seconds] --ar 9:16 --style [realistic/anime/cartoon]
        </div>
        <p className="text-sm text-zinc-500">Key tip: The --style flag dramatically changes output. Test both &quot;realistic&quot; and your target style.</p>

        <h3 className="text-lg font-semibold text-emerald-300 mb-3 mt-6">Runway Gen-4</h3>
        <p>Runway is motion-obsessed. Lead with camera movement and reference Runway&apos;s native camera terms.</p>
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-4 text-sm text-emerald-300 mb-2">
          [Camera movement description] of [subject and action], [detailed setting], [lighting and atmosphere], [mood]
        </div>
        <p className="text-sm text-zinc-500">Key terms: dolly in/out, pan left/right, tilt up/down, orbit, handheld, smooth tracking.</p>

        <h3 className="text-lg font-semibold text-amber-300 mb-3 mt-6">Pika 2.0</h3>
        <p>Pika responds well to comma-separated descriptive tags combined with parameters.</p>
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-4 text-sm text-amber-300 mb-2">
          [subject], [action], [setting], [lighting style], [camera angle], [mood] -ar 9:16 -s [style]
        </div>

        <h3 className="text-lg font-semibold text-rose-300 mb-3 mt-6">Midjourney (stills for video)</h3>
        <p>Midjourney generates stills, not video. Use it for reference frames or thumbnails in your video workflow.</p>
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-4 text-sm text-rose-300 mb-2">
          [Scene description], [lighting style], [camera angle] --ar 9:16 --style raw --v 6.1
        </div>

        <h2 className="text-2xl font-bold text-white mt-10 mb-4">The 30-Second Prompt Test</h2>
        <p>Before generating, read your prompt out loud and ask: &quot;If I described this to a filmmaker on set, would they know exactly what to shoot?&quot;</p>
        <p>If any of these questions are unanswered, your prompt needs work:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Who/what is in the shot?</li>
          <li>What are they doing?</li>
          <li>What does the environment look like?</li>
          <li>What is the light source and quality?</li>
          <li>Where is the camera and how does it move?</li>
          <li>How long is the clip?</li>
          <li>What is the aspect ratio?</li>
        </ul>

        <h2 className="text-2xl font-bold text-white mt-10 mb-4">Stop Writing Prompts Manually</h2>
        <p>
          For a 60-second Short with 10 scenes, you&apos;re writing 10 individual prompts — each tailored to the specific AI tool you&apos;re using. That&apos;s 30-45 minutes of work before you&apos;ve generated a single frame.
        </p>
        <p>
          ScriptFlow AI generates complete scene-by-scene scripts with tool-specific prompts pre-formatted for whichever AI tool you select. Enter your concept once, select your tool, and get all 10 prompts in 10 seconds.
        </p>

        <div className="bg-gradient-to-br from-violet-600/10 to-blue-600/10 border border-violet-500/20 rounded-2xl p-8 text-center mt-10">
          <h3 className="text-xl font-bold mb-2">Generate Tool-Specific Prompts Automatically</h3>
          <p className="text-zinc-400 mb-5 text-sm">VEO 3, Kling, Runway, Pika — choose your tool and get formatted prompts for every scene</p>
          <Link
            href="/signup"
            className="inline-block bg-violet-600 hover:bg-violet-500 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            Try ScriptFlow AI Free →
          </Link>
        </div>
      </div>
    </article>
  )
}
