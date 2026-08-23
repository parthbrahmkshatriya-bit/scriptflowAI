"use client"

import { useState, useEffect } from "react"
import { PenLine, SlidersHorizontal, Sparkles, Video, Scissors } from "lucide-react"
import { cn } from "@/lib/utils"

const STEPS = [
  {
    icon: PenLine,
    number: "01",
    title: "Describe",
    description: "Type your one-line video concept. Upload an avatar or product image as a reference.",
    gradient: "from-violet-500 to-purple-600",
    glow: "rgba(139,92,246,0.6)",
    activeText: "text-violet-400",
    activeBorder: "border-violet-500/60",
    activeBg: "bg-violet-500/10",
    activeLine: "from-violet-500 to-purple-600",
  },
  {
    icon: SlidersHorizontal,
    number: "02",
    title: "Configure",
    description: "Pick platform, duration, visual style, AI tool, and scene count in seconds.",
    gradient: "from-blue-500 to-indigo-500",
    glow: "rgba(99,102,241,0.6)",
    activeText: "text-indigo-400",
    activeBorder: "border-indigo-500/60",
    activeBg: "bg-indigo-500/10",
    activeLine: "from-blue-500 to-indigo-500",
  },
  {
    icon: Sparkles,
    number: "03",
    title: "AI Script",
    description: "Scene-by-scene breakdown in under 10 seconds — visuals, camera, voiceover, on-screen text, and tool-specific prompts.",
    gradient: "from-fuchsia-500 to-pink-500",
    glow: "rgba(217,70,239,0.6)",
    activeText: "text-fuchsia-400",
    activeBorder: "border-fuchsia-500/60",
    activeBg: "bg-fuchsia-500/10",
    activeLine: "from-fuchsia-500 to-pink-500",
  },
  {
    icon: Video,
    number: "04",
    title: "Generate Videos",
    description: "One click generates each scene as a real video with synchronized audio and voiceover via Veo 3 Fast.",
    gradient: "from-orange-500 to-amber-500",
    glow: "rgba(249,115,22,0.6)",
    activeText: "text-orange-400",
    activeBorder: "border-orange-500/60",
    activeBg: "bg-orange-500/10",
    activeLine: "from-orange-500 to-amber-500",
  },
  {
    icon: Scissors,
    number: "05",
    title: "Stitch & Export",
    description: "All scene videos are stitched into one complete final video, ready to upload to YouTube, Reels, or TikTok.",
    gradient: "from-rose-500 to-pink-600",
    glow: "rgba(244,63,94,0.6)",
    activeText: "text-rose-400",
    activeBorder: "border-rose-500/60",
    activeBg: "bg-rose-500/10",
    activeLine: "from-rose-500 to-pink-600",
  },
]

export function WorkflowPipeline() {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setActive((a) => (a + 1) % STEPS.length), 2800)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
      {STEPS.map((step, i) => {
        const isActive = i === active
        const Icon = step.icon
        return (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={cn(
              "group relative text-left rounded-2xl border p-5 transition-all duration-500 cursor-pointer",
              isActive
                ? cn(step.activeBorder, step.activeBg, "shadow-lg")
                : "border-white/[0.07] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.04]"
            )}
            style={isActive ? { boxShadow: `0 0 32px -10px ${step.glow}` } : undefined}
          >
            <div className={cn(
              "text-[10px] font-bold tracking-widest mb-3 transition-colors duration-500",
              isActive ? step.activeText : "text-zinc-700"
            )}>
              {step.number}
            </div>
            <div
              className={cn(
                "size-9 rounded-xl bg-gradient-to-br flex items-center justify-center mb-4 transition-all duration-500",
                step.gradient,
                isActive ? "opacity-100" : "opacity-30 group-hover:opacity-50"
              )}
              style={isActive ? { boxShadow: `0 4px 18px -4px ${step.glow}` } : undefined}
            >
              <Icon className="size-4 text-white" />
            </div>
            <h3 className={cn(
              "font-semibold text-sm mb-2 transition-colors duration-500",
              isActive ? "text-white" : "text-zinc-500 group-hover:text-zinc-300"
            )}>
              {step.title}
            </h3>
            <p className={cn(
              "text-xs leading-relaxed transition-colors duration-500",
              isActive ? "text-zinc-300" : "text-zinc-700 group-hover:text-zinc-500"
            )}>
              {step.description}
            </p>
            {isActive && (
              <div className={cn(
                "absolute bottom-0 left-4 right-4 h-0.5 rounded-full bg-gradient-to-r",
                step.activeLine
              )} />
            )}
          </button>
        )
      })}
    </div>
  )
}
