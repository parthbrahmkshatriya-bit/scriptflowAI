import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "The Complete VEO 3 Prompt Guide for YouTube Shorts (2026)",
  description:
    "Master VEO 3 prompt structure, best practices, and real examples. Learn the exact format that gets the best results from Google's AI video generator for Shorts.",
  alternates: { canonical: "https://scriptflowai.com/blog/veo3-prompt-guide" },
  openGraph: {
    title: "The Complete VEO 3 Prompt Guide for YouTube Shorts (2026)",
    description:
      "Master VEO 3 prompt structure, best practices, and real examples for YouTube Shorts.",
    url: "https://scriptflowai.com/blog/veo3-prompt-guide",
  },
}

export default function Veo3PromptGuidePage() {
  return (
    <article className="max-w-3xl mx-auto px-4 py-16">
      <div className="mb-3 flex items-center gap-2 text-sm text-zinc-500">
        <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
        <span>→</span>
        <span>AI Tools</span>
      </div>

      <h1 className="text-4xl font-bold leading-tight mb-4 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
        The Complete VEO 3 Prompt Guide for YouTube Shorts (2026)
      </h1>

      <div className="flex items-center gap-3 text-sm text-zinc-500 mb-10 pb-10 border-b border-white/[0.07]">
        <span>May 1, 2026</span>
        <span>·</span>
        <span>8 min read</span>
        <span>·</span>
        <span className="text-violet-400">AI Tools</span>
      </div>

      <div className="prose prose-invert prose-zinc max-w-none space-y-6 text-zinc-300 leading-relaxed">
        <p className="text-xl text-zinc-200 leading-relaxed">
          Google&apos;s VEO 3 is the most powerful AI video generation model available right now. But getting consistently great results requires understanding exactly how to structure your prompts. This guide covers everything — from the basic formula to advanced techniques for cinematic YouTube Shorts.
        </p>

        <h2 className="text-2xl font-bold text-white mt-10 mb-4">What Makes VEO 3 Different</h2>
        <p>
          Unlike older AI video tools, VEO 3 understands complex natural language instructions. It can generate realistic motion, maintain subject consistency across frames, and produce cinematic lighting — all from a well-written text prompt. The model was trained on professional film and video content, which means it responds best to prompts written in a descriptive, cinematic language.
        </p>
        <p>
          VEO 3 also natively supports 9:16 vertical video, making it purpose-built for YouTube Shorts, Instagram Reels, and TikTok. You don&apos;t need to crop or reframe; just specify the aspect ratio and the model handles the rest.
        </p>

        <h2 className="text-2xl font-bold text-white mt-10 mb-4">The VEO 3 Prompt Formula</h2>
        <p>Every high-performing VEO 3 prompt follows this structure:</p>
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-5 font-mono text-sm">
          <p className="text-violet-300">[Subject] + [Action] + [Setting] + [Lighting] + [Camera movement] + [Duration] + [Aspect ratio]</p>
        </div>
        <p>Here&apos;s a real example:</p>
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-5 text-sm">
          <p className="text-emerald-300">&quot;A young woman in a leather jacket walks confidently through a neon-lit Tokyo street at night, rain reflecting colorful signs on wet pavement, slow tracking shot following from behind, 4 seconds, 9:16 vertical&quot;</p>
        </div>
        <p>This prompt works because it:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Defines a clear subject (young woman)</li>
          <li>Specifies action (walks confidently)</li>
          <li>Gives a vivid setting (Tokyo street at night)</li>
          <li>Describes atmospheric lighting (neon-lit, rain reflection)</li>
          <li>Indicates camera behavior (slow tracking shot from behind)</li>
          <li>States duration (4 seconds)</li>
          <li>Confirms format (9:16 vertical)</li>
        </ul>

        <h2 className="text-2xl font-bold text-white mt-10 mb-4">5 Lighting Styles That Always Work</h2>
        <p>Lighting is the biggest factor in whether a VEO 3 clip looks cinematic or flat. Here are five reliable descriptors:</p>
        <ol className="list-decimal pl-6 space-y-3">
          <li><strong className="text-white">Golden hour sunlight</strong> — warm, soft side lighting. Works for lifestyle, travel, outdoor scenes.</li>
          <li><strong className="text-white">Neon backlight</strong> — vibrant colored light from behind subject. Best for urban, tech, and music content.</li>
          <li><strong className="text-white">Studio softbox lighting</strong> — professional, even illumination. Ideal for talking-head style or product shots.</li>
          <li><strong className="text-white">Dramatic single-source spotlight</strong> — high contrast, theatrical. Great for dramatic monologues or reveals.</li>
          <li><strong className="text-white">Blue hour ambient</strong> — the 20 minutes after sunset. Naturally cinematic with cool, moody tones.</li>
        </ol>

        <h2 className="text-2xl font-bold text-white mt-10 mb-4">Camera Direction Keywords VEO 3 Understands</h2>
        <p>VEO 3 is particularly good at following camera movement instructions. These terms reliably produce the described motion:</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            ["Slow dolly push", "Camera moves toward subject"],
            ["Tracking shot", "Camera follows subject movement"],
            ["Low angle looking up", "Heroic, powerful perspective"],
            ["Bird&apos;s eye overhead", "Top-down view of subject"],
            ["Close-up on face", "Tight shot, emotional focus"],
            ["Rack focus reveal", "Focus pulls from foreground to background"],
          ].map(([term, desc]) => (
            <div key={term} className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-3">
              <p className="text-violet-300 font-medium text-sm">{term}</p>
              <p className="text-zinc-500 text-xs mt-1">{desc}</p>
            </div>
          ))}
        </div>

        <h2 className="text-2xl font-bold text-white mt-10 mb-4">Scene Duration Best Practices</h2>
        <p>VEO 3 generates clips in increments. For YouTube Shorts, these durations work best:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong className="text-white">2-3 seconds</strong> — Fast cuts, high-energy montages, reaction clips</li>
          <li><strong className="text-white">4-5 seconds</strong> — Standard establishing shots, action sequences</li>
          <li><strong className="text-white">6-8 seconds</strong> — Slow reveals, atmospheric scene-setting</li>
          <li><strong className="text-white">10+ seconds</strong> — Dialogue scenes, demonstrations (use sparingly)</li>
        </ul>
        <p>A 60-second Short typically needs 8-12 scenes. Keep most scenes at 4-6 seconds for the best pacing.</p>

        <h2 className="text-2xl font-bold text-white mt-10 mb-4">Common VEO 3 Prompt Mistakes</h2>
        <p>These mistakes consistently produce low-quality output:</p>
        <ol className="list-decimal pl-6 space-y-3">
          <li><strong className="text-white">Too abstract</strong> — &quot;A feeling of loneliness&quot; doesn&apos;t work. VEO 3 needs concrete visual information.</li>
          <li><strong className="text-white">Multiple subjects competing</strong> — Focus on one primary subject per scene. Multiple characters doing different things confuse the model.</li>
          <li><strong className="text-white">No camera direction</strong> — Without a camera instruction, VEO 3 defaults to a static wide shot.</li>
          <li><strong className="text-white">Missing duration</strong> — Always specify how long the clip should be.</li>
          <li><strong className="text-white">Ignoring aspect ratio</strong> — VEO 3 defaults to 16:9 landscape. Always add &quot;9:16 vertical&quot; for Shorts.</li>
        </ol>

        <h2 className="text-2xl font-bold text-white mt-10 mb-4">Real Prompt Examples by Niche</h2>

        <h3 className="text-lg font-semibold text-white mb-2">Finance / Money Content</h3>
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-4 text-sm text-emerald-300">
          &quot;Stacks of dollar bills fan out across a black marble surface in slow motion, dramatic overhead spotlight, macro close-up with shallow depth of field, 5 seconds, 9:16 vertical&quot;
        </div>

        <h3 className="text-lg font-semibold text-white mb-2 mt-6">Tech / AI Content</h3>
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-4 text-sm text-emerald-300">
          &quot;Glowing blue data streams flow through a dark server room, camera slowly pushes through rows of blinking servers, cinematic depth of field, cool blue lighting, 6 seconds, 9:16 vertical&quot;
        </div>

        <h3 className="text-lg font-semibold text-white mb-2 mt-6">Lifestyle / Travel Content</h3>
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-4 text-sm text-emerald-300">
          &quot;Person stands on a mountain peak at sunrise, arms outstretched, golden light breaking through clouds below, slow aerial pull-back revealing vast mountain range, 8 seconds, 9:16 vertical&quot;
        </div>

        <h2 className="text-2xl font-bold text-white mt-10 mb-4">Skip the Manual Prompting</h2>
        <p>
          Writing VEO 3 prompts for every scene of every video takes 60-90 minutes per video. ScriptFlow AI generates a complete scene-by-scene script with VEO 3-formatted prompts in under 10 seconds.
        </p>
        <p>
          You enter one line — your video concept — and get back a full production script with voiceover, on-screen text, and copy-paste-ready VEO 3 prompts for every scene.
        </p>

        <div className="bg-gradient-to-br from-violet-600/10 to-blue-600/10 border border-violet-500/20 rounded-2xl p-8 text-center mt-10">
          <h3 className="text-xl font-bold mb-2">Generate VEO 3 Prompts Automatically</h3>
          <p className="text-zinc-400 mb-5 text-sm">Enter your concept → get a complete script with scene-by-scene VEO 3 prompts</p>
          <Link
            href="/veo3-script-generator"
            className="inline-block bg-violet-600 hover:bg-violet-500 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            Try VEO 3 Script Generator →
          </Link>
        </div>
      </div>
    </article>
  )
}
