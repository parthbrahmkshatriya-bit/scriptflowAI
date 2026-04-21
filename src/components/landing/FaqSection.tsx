"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { AnimateOnScroll } from "@/components/landing/AnimateOnScroll"

const faqs = [
  {
    question: "What is ScriptFlow AI?",
    answer:
      "ScriptFlow AI is an AI-powered script generator that turns any one-line video concept into a complete, scene-by-scene production script. Each script includes visual descriptions, camera directions, voiceover text, on-screen text overlays, and copy-paste-ready prompts formatted specifically for your AI video tool of choice.",
  },
  {
    question: "Which AI video tools are supported?",
    answer:
      "ScriptFlow generates prompts specifically formatted for VEO 3, Kling 2.0, Runway Gen-4, Pika 2.0, and Midjourney. Each tool has its own prompt syntax — ScriptFlow knows the difference and formats accordingly. We also support a universal 'Generic' format that works with any AI tool.",
  },
  {
    question: "How many scripts can I generate for free?",
    answer:
      "The Free plan includes 3 script generations per month with no credit card required. Usage resets on the 1st of every month. The Creator plan gives you 30 scripts/month for $9 (₹199), and the Pro plan gives you unlimited scripts for $19 (₹499) per month.",
  },
  {
    question: "How long does script generation take?",
    answer:
      "Script generation typically takes 5–15 seconds. The AI generates a complete scene-by-scene script including all formatting and tool-specific prompts in a single pass, so you get everything ready at once — no need to wait for multiple steps.",
  },
  {
    question: "What exactly is included in a 'production-ready' script?",
    answer:
      "Every ScriptFlow script includes: scene-by-scene breakdown with exact timing, visual descriptions of what the viewer sees, camera angles and movements, voiceover/narration text, on-screen text overlays (max 10 words), AI generation prompts formatted for your chosen tool, music/SFX suggestions, and scene transitions. Everything you need to go from idea to shooting.",
  },
  {
    question: "Can I use ScriptFlow for traditional video production?",
    answer:
      "Absolutely. The scripts work great for traditional video production too. Camera directions, scene descriptions, and voiceover text are valuable regardless of whether you use AI generation tools. Many creators use ScriptFlow purely for the structure and scripting, then shoot manually.",
  },
  {
    question: "Do you offer refunds?",
    answer:
      "Yes. If you're not satisfied within the first 7 days of a paid plan, contact us for a full refund — no questions asked. After 7 days, we handle refund requests on a case-by-case basis. We want you to feel confident trying ScriptFlow.",
  },
  {
    question: "Is my data secure and private?",
    answer:
      "Yes. All scripts are private by default — only you can access them. We use PostgreSQL with Row Level Security policies that ensure complete data isolation between users. Scripts can optionally be made public for sharing. We never use your scripts or ideas to train AI models.",
  },
]

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
