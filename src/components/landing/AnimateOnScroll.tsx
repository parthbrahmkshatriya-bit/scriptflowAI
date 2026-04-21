"use client"

import { useEffect, useRef, type ReactNode } from "react"
import { cn } from "@/lib/utils"

interface Props {
  children: ReactNode
  className?: string
  delay?: number
}

export function AnimateOnScroll({ children, className, delay = 0 }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const timer = setTimeout(() => {
            el.classList.remove("anim-hidden")
            el.classList.add("anim-visible")
          }, delay)
          observer.unobserve(el)
          return () => clearTimeout(timer)
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [delay])

  return (
    <div ref={ref} className={cn("anim-hidden", className)}>
      {children}
    </div>
  )
}
