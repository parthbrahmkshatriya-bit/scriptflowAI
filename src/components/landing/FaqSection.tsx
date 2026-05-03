"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { AnimateOnScroll } from "@/components/landing/AnimateOnScroll"
import { faqs } from "@/components/landing/faq-data"

export { faqs }

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section id="faq" className="py-28 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-950/5 to-transparent pointer-events-none" />

      <div className="max-w-3xl mx-auto">
        <AnimateOnScroll className="text-center mb-14">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/35 bg-violet-500/10 px-3 py-1 text-sm text-violet-400 mb-4">
            FAQ
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-white">
            Frequently asked questions
          </h2>
          <p className="text-zinc-400 text-lg">
            Everything you need to know about ScriptFlow AI.
          </p>
        </AnimateOnScroll>

        <AnimateOnScroll delay={80}>
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className={cn(
                  "rounded-xl border overflow-hidden transition-all duration-200",
                  openIndex === index
                    ? "border-violet-500/35 bg-violet-950/20 shadow-[0_0_20px_-8px_rgba(139,92,246,0.4)]"
                    : "border-white/8 bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.04]"
                )}
              >
                <button
                  onClick={() =>
                    setOpenIndex(openIndex === index ? null : index)
                  }
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <span className="font-medium text-sm sm:text-base pr-4 text-zinc-200">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={cn(
                      "size-5 text-zinc-500 shrink-0 transition-transform duration-200",
                      openIndex === index && "rotate-180 text-violet-400"
                    )}
                  />
                </button>
                <div
                  className={cn(
                    "overflow-hidden transition-all duration-200",
                    openIndex === index ? "max-h-96" : "max-h-0"
                  )}
                >
                  <div className="px-5 pb-5">
                    <p className="text-zinc-400 text-sm leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </AnimateOnScroll>

        <div className="text-center mt-12">
          <p className="text-zinc-600 text-sm">
            Still have questions?{" "}
            <a
              href="mailto:hello@scriptflow.ai"
              className="text-violet-400 hover:text-violet-300 underline underline-offset-4 transition-colors"
            >
              Email us
            </a>
          </p>
        </div>
      </div>
    </section>
  )
}
