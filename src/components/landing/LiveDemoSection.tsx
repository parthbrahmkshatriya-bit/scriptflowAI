"use client"

import { useState } from "react"
import { Copy, Lock } from "lucide-react"
import { cn } from "@/lib/utils"

interface Scene {
  num: number
  dur: string
  visual: string
  voiceover: string | null
  prompt: string | null
}

interface Demo {
  label: string
  tool: string
  toolColor: string
  concept: string
  scenes: Scene[]
}

const DEMOS: Demo[] = [
  {
    label: "Cinematic",
    tool: "VEO 3",
    toolColor: "text-blue-400",
    concept: "A time-lapse of Tokyo streets transitioning from midnight to dawn",
    scenes: [
      {
        num: 1,
        dur: "5s",
        visual: "Overhead drone shot of Shibuya crossing at midnight, neon reflections on wet pavement",
        voiceover: "Tokyo never sleeps — but it does dream.",
        prompt:
          "Overhead aerial drone view of Shibuya crossing at midnight, neon signs reflecting on wet pavement, time-lapse crowd motion, vertical 9:16 format, cinematic, 5 seconds",
      },
      {
        num: 2,
        dur: "6s",
        visual: "Street-level empty alleyway during blue hour, lanterns glowing",
        voiceover: "In the quiet before sunrise, the city exhales.",
        prompt:
          "Empty Tokyo alleyway at blue hour 4am, red lanterns glowing warmly, mist rising from drains, handheld camera slow pan right, vertical 9:16, cinematic mood, 6 seconds",
      },
      {
        num: 3,
        dur: "4s",
        visual: "First rays of sunlight hitting a torii gate, warm golden haze",
        voiceover: null,
        prompt: null,
      },
    ],
  },
  {
    label: "Educational",
    tool: "Kling 2.0",
    toolColor: "text-orange-400",
    concept: "5 surprising ocean facts that will completely change how you see the sea",
    scenes: [
      {
        num: 1,
        dur: "3s",
        visual: "Wide underwater shot, sunbeams cutting through deep blue ocean, particles floating",
        voiceover: "The ocean covers 71% of Earth — yet 95% of it remains unexplored.",
        prompt:
          "[Wide underwater shot] [Sunbeams cutting through deep ocean] [Bioluminescent particles floating] --duration 3 --ar 9:16 --style realistic --camera slow-zoom-out",
      },
      {
        num: 2,
        dur: "4s",
        visual: "Close-up of bioluminescent wave breaking on a dark beach",
        voiceover: "Some beaches glow electric blue at night. It's not magic — it's alive.",
        prompt:
          "[Extreme close-up] [Bioluminescent wave breaking on dark sand] [Blue particle light spray] --duration 4 --ar 9:16 --style realistic --camera ground-level-static",
      },
      {
        num: 3,
        dur: "4s",
        visual: "Deep sea anglerfish drifting in pitch-black water, lure glowing",
        voiceover: null,
        prompt: null,
      },
    ],
  },
  {
    label: "Lifestyle",
    tool: "Runway Gen-4",
    toolColor: "text-purple-400",
    concept: "A satisfying before/after of a minimal bedroom transformation in one weekend",
    scenes: [
      {
        num: 1,
        dur: "3s",
        visual: "Pull-back reveal of cluttered, overstuffed bedroom at harsh morning light",
        voiceover: "One weekend. Same room. Completely different life.",
        prompt:
          "Camera dolly back revealing cluttered bedroom, pile of clothes, dark curtains, messy desk, harsh morning light contrast, vertical 9:16, editorial style",
      },
      {
        num: 2,
        dur: "5s",
        visual: "Time-lapse: clearing, painting walls white, natural light shifting",
        voiceover: "One rule: if it doesn't earn its place, it goes.",
        prompt:
          "Time-lapse montage of bedroom transformation, hands clearing objects, white paint roller on walls, natural afternoon light shifting, smooth tracking shot, 9:16",
      },
      {
        num: 3,
        dur: "5s",
        visual: "Slow reveal of finished minimal bedroom — white walls, warm wood, single plant",
        voiceover: null,
        prompt: null,
      },
    ],
  },
]

export function LiveDemoSection() {
  const [active, setActive] = useState(0)
  const [copied, setCopied] = useState<number | null>(null)
  const demo = DEMOS[active]

  function copy(text: string, idx: number) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(idx)
      setTimeout(() => setCopied(null), 1500)
    })
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Concept selector */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        {DEMOS.map((d, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={cn(
              "flex-1 text-left rounded-xl border p-4 transition-all duration-300",
              i === active
                ? "border-[#00e5c0]/50 bg-[#00e5c0]/[0.07] shadow-[0_0_20px_-8px_rgba(0,229,192,0.5)]"
                : "border-white/[0.07] bg-white/[0.02] hover:border-white/[0.12]"
            )}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span className={cn(
                "text-[10px] font-bold tracking-wide uppercase",
                i === active ? "text-[#00e5c0]" : "text-zinc-600"
              )}>
                {d.label}
              </span>
              <span className={cn("text-[10px] font-mono px-1.5 py-0.5 rounded border border-current/30 bg-current/10", d.toolColor)}>
                {d.tool}
              </span>
            </div>
            <p className="text-xs text-zinc-400 leading-snug line-clamp-2">{d.concept}</p>
          </button>
        ))}
      </div>

      {/* Script preview */}
      <div className="rounded-2xl border border-white/[0.09] bg-[#070912]/80 overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.07] flex items-start sm:items-center justify-between gap-4 bg-white/[0.02]">
          <div className="min-w-0">
            <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-1">Concept</p>
            <p className="text-sm text-zinc-300 italic leading-snug">&ldquo;{demo.concept}&rdquo;</p>
          </div>
          <span className={cn(
            "shrink-0 text-[10px] font-mono px-2 py-1 rounded-md border border-current/30 bg-current/10",
            demo.toolColor
          )}>
            {demo.tool}
          </span>
        </div>

        <div className="p-5 space-y-3">
          {demo.scenes.map((scene, i) => {
            const isLocked = scene.prompt === null
            return (
              <div
                key={`${active}-${i}`}
                className={cn(
                  "relative rounded-xl border transition-all duration-200",
                  isLocked
                    ? "border-white/[0.04] bg-white/[0.01]"
                    : "border-white/[0.07] bg-white/[0.03] group hover:border-[#00e5c0]/30 hover:bg-[#00e5c0]/[0.03]"
                )}
              >
                {isLocked && (
                  <div className="absolute inset-0 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center z-10 bg-[#060810]/70">
                    <Lock className="size-4 text-[#00e5c0] mb-2" />
                    <p className="text-sm font-semibold text-white mb-0.5">Sign up to see full script</p>
                    <p className="text-xs text-zinc-500">Free · No credit card required</p>
                  </div>
                )}
                <div className={cn("p-4", isLocked && "opacity-10 select-none")}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-[#00e5c0] bg-[#00e5c0]/10 border border-[#00e5c0]/30 rounded px-2 py-0.5">
                        Scene {scene.num}
                      </span>
                      <span className="text-xs text-zinc-600">{scene.dur}</span>
                    </div>
                    {!isLocked && scene.prompt && (
                      <button
                        onClick={() => copy(scene.prompt!, i)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-zinc-500 hover:text-[#00e5c0] flex items-center gap-1"
                      >
                        <Copy className="size-3" />
                        {copied === i ? "Copied!" : "Copy prompt"}
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 mb-2">{scene.visual}</p>
                  {scene.voiceover && (
                    <p className="text-xs text-zinc-600 italic mb-2">&ldquo;{scene.voiceover}&rdquo;</p>
                  )}
                  {scene.prompt && (
                    <div className="rounded-lg bg-[#00e5c0]/[0.06] border border-[#00e5c0]/20 px-3 py-2">
                      <p className="text-xs font-mono text-[#00e5c0]/80 leading-relaxed">{scene.prompt}</p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <p className="text-center text-xs text-zinc-700 pb-4">
          ✨ Generated in &lt;10 seconds · Ready to paste into {demo.tool}
        </p>
      </div>
    </div>
  )
}
