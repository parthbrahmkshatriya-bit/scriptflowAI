"use client"

import { useRef, type ReactNode, type MouseEvent } from "react"
import { cn } from "@/lib/utils"

interface Props {
  children: ReactNode
  className?: string
  maxTilt?: number
}

export function TiltCard({ children, className, maxTilt = 10 }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  function onMove(e: MouseEvent<HTMLDivElement>) {
    const el = ref.current
    if (!el) return
    const { left, top, width, height } = el.getBoundingClientRect()
    const x = (e.clientX - left) / width   // 0-1
    const y = (e.clientY - top)  / height  // 0-1
    const rotX = (y - 0.5) * -maxTilt
    const rotY = (x - 0.5) *  maxTilt
    el.style.transform = `perspective(1200px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.02,1.02,1.02)`
  }

  function onLeave() {
    const el = ref.current
    if (!el) return
    el.style.transform = "perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)"
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={cn("transition-transform duration-200 ease-out", className)}
      style={{ transformStyle: "preserve-3d", willChange: "transform" }}
    >
      {children}
    </div>
  )
}
