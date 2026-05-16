"use client"

import { useState, useEffect } from "react"
import { PenLine, SlidersHorizontal, Sparkles, Eye, Clapperboard } from "lucide-react"
import { cn } from "@/lib/utils"

const STEPS = [
  {
    icon: PenLine,
    number: "01",
    title: "Describe",
    description: "Type your one-line video concept. As simple as a topic, as specific as a full brief.",
    gradient: "from-violet-500 to-purple-500",
    glow: "rgba(139,92,246,0.55)",
    activeText: "text-violet-400",
    activeBorder: "border-violet-500/55",
    activeBg: "bg-violet-500/10",
    activeLine: "from-violet-500 to-purple-500",
  },
  {
    icon: SlidersHorizontal,
    number: "02",
    title: "Configure",
    description: "Pick your platform, duration, visual style, and AI video tool in seconds.",
    gradient: "from-blue-500 to-cyan-500",
    glow: "rgba(59,130,246,0.55)",
    activeText: "text-blue-400",
    activeBorder: "border-blue-500/55",
    activeBg: "bg-blue-500/10",
    activeLine: "from-blue-500 to-cyan-500",
  },
  {
    icon: Sparkles,
    number: "03",
    title: "Generate",
    description: "AI builds a complete scene-by-scene production script in under 10 seconds.",
    gradient: "from-[#00e5c0] to-teal-400",
    glow: "rgba(0,229,192,0.55)",
    activeText: "text-[#00e5c0]",
    activeBorder: "border-[#00e5c0]/55",
    activeBg: "bg-[#00e5c0]/[0.08]",
    activeLine: "from-[#00e5c0] to-teal-400",
  },
  {
    icon: Eye,
    number: "04",
    title: "Review",
    description: "Check each scene: visuals, camera, voiceover, on-screen text, and AI prompts.",
    gradient: "from-amber-500 to-orange-400",
    glow: "rgba(245,158,11,0.55)",
    activeText: "text-amber-400",
    activeBorder: "border-amber-500/55",
    activeBg: "bg-amber-500/10",
    activeLine: "from-amber-500 to-orange-400",
  },
  {
    icon: Clapperboard,
    number: "05",
    title: "Create",
    description: "Paste tool-specific prompts into VEO 3, Kling, Runway, or Pika. Hit generate.",
    gradient: "from-pink-500 to-rose-500",
    glow: "rgba(236,72,153,0.55)",
    activeText: "text-pink-400",
    activeBorder: "border-pink-500/55",
    activeBg: "bg-pink-500/10",
    activeLine: "from-pink-500 to-rose-500",
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
