"use client"

import { useEffect, useRef, useState } from "react"

type LT = "prompt" | "info" | "loading" | "scene" | "done" | "blank"
interface L { text: string; type: LT }

const SEQ: Array<{ line: L; pause: number }> = [
  { line: { text: "$ scriptflow generate", type: "prompt" }, pause: 600 },
  { line: { text: "", type: "blank" }, pause: 200 },
  { line: { text: 'Concept  "Coffee shop morning routine"', type: "info" }, pause: 350 },
  { line: { text: "Platform  YouTube Shorts  ·  Tool  Kling 2.0  ·  30s", type: "info" }, pause: 700 },
  { line: { text: "", type: "blank" }, pause: 150 },
  { line: { text: "⠸  Generating 5-scene script...", type: "loading" }, pause: 1600 },
  { line: { text: "✓  Script ready", type: "done" }, pause: 350 },
  { line: { text: "", type: "blank" }, pause: 120 },
  { line: { text: "  [1/5] 4s  Espresso dripping in slow motion", type: "scene" }, pause: 300 },
  { line: { text: "  [2/5] 5s  Hands cradling warm mug, golden light", type: "scene" }, pause: 300 },
  { line: { text: "  [3/5] 6s  Gazing through window, city blurred", type: "scene" }, pause: 300 },
  { line: { text: "  [4/5] 8s  Notebook open, latte beside it", type: "scene" }, pause: 300 },
  { line: { text: "  [5/5] 7s  Empty table at golden hour", type: "scene" }, pause: 450 },
  { line: { text: "", type: "blank" }, pause: 100 },
  { line: { text: "✓  8.3s  ·  5 scenes  ·  Kling 2.0 prompts ready", type: "done" }, pause: 4200 },
]

export function TerminalAnimation() {
  const [count, setCount] = useState(0)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    function run() {
      setCount(0)
      timers.current.forEach(clearTimeout)
      timers.current = []
      let cum = 0
      SEQ.forEach((item, i) => {
        cum += item.pause
        const t = setTimeout(() => setCount(i + 1), cum)
        timers.current.push(t)
      })
      const restartT = setTimeout(run, cum + 1800)
      timers.current.push(restartT)
    }
    run()
    return () => timers.current.forEach(clearTimeout)
  }, [])

  const lines = SEQ.slice(0, count).map((s) => s.line)

  return (
    <div className="rounded-2xl border border-white/10 bg-[#070912]/90 overflow-hidden shadow-2xl shadow-black/60">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.07] bg-white/[0.025]">
        <div className="flex gap-1.5">
          <div className="size-3 rounded-full bg-[#ff5f57]" />
          <div className="size-3 rounded-full bg-[#febc2e]" />
          <div className="size-3 rounded-full bg-[#28c840]" />
        </div>
        <span className="ml-2 text-[11px] text-zinc-500 font-mono">scriptflow — terminal</span>
      </div>
      <div className="p-5 font-mono text-[11px] sm:text-xs leading-relaxed min-h-[300px] sm:min-h-[340px]">
        {lines.map((line, i) => {
          if (line.type === "blank") return <div key={i} className="h-2" />
          const isLast = i === lines.length - 1
          let cls = "text-zinc-500"
          if (line.type === "prompt") cls = "text-[#00e5c0] font-semibold"
          else if (line.type === "info") cls = "text-zinc-400"
          else if (line.type === "loading") cls = "text-[#00e5c0]/60"
          else if (line.type === "scene") cls = "text-emerald-400"
          else if (line.type === "done") cls = "text-[#00e5c0]"

          return (
            <div key={i} className={`${cls} mb-0.5`}>
              {line.text}
              {isLast && (
                <span className="inline-block w-1.5 h-[13px] bg-[#00e5c0] ml-0.5 align-middle animate-pulse" />
              )}
            </div>
          )
        })}
        {lines.length === 0 && (
          <div className="text-[#00e5c0] font-semibold">
            ${" "}
            <span className="inline-block w-1.5 h-[13px] bg-[#00e5c0] ml-0.5 align-middle animate-pulse" />
          </div>
        )}
      </div>
    </div>
  )
}
