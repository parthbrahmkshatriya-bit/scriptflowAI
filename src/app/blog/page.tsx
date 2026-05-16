import type { Metadata } from "next"
import Link from "next/link"
import { blogPosts } from "@/lib/blog-posts"

export const metadata: Metadata = {
  title: "AI Video Script Generator Blog — Tips, Guides & Tool Comparisons",
  description:
    "Guides on VEO 3, Kling, Runway, and AI video creation. Learn prompt engineering, script templates, and how to build a faceless YouTube channel with AI tools.",
  alternates: {
    canonical: "https://scriptflowai.com/blog",
  },
  openGraph: {
    title: "AI Video Script Generator Blog — ScriptFlow AI",
    description:
      "Guides on VEO 3, Kling, Runway, and AI video creation for YouTube Shorts creators.",
    url: "https://scriptflowai.com/blog",
  },
}

const categoryColors: Record<string, string> = {
  "AI Tools": "bg-violet-500/15 text-violet-300 border-violet-500/20",
  Comparison: "bg-blue-500/15 text-blue-300 border-blue-500/20",
  Scripting: "bg-emerald-500/15 text-emerald-300 border-emerald-500/20",
  "Prompt Engineering": "bg-amber-500/15 text-amber-300 border-amber-500/20",
  "YouTube Strategy": "bg-rose-500/15 text-rose-300 border-rose-500/20",
}

export default function BlogIndexPage() {
  const sorted = [...blogPosts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="mb-14 text-center">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
          AI Video Creator Blog
        </h1>
        <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
          Prompt guides, tool comparisons, and script templates for AI video creators on YouTube Shorts, Reels, and TikTok.
        </p>
      </div>

      <div className="grid gap-6">
        {sorted.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group block bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6 hover:bg-white/[0.06] hover:border-white/[0.12] transition-all"
          >
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                      categoryColors[post.category] ?? "bg-zinc-500/15 text-zinc-300 border-zinc-500/20"
                    }`}
                  >
                    {post.category}
                  </span>
                  <span className="text-xs text-zinc-500">{post.readTime}</span>
                  <span className="text-xs text-zinc-600">
                    {new Date(post.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <h2 className="text-xl font-semibold text-white group-hover:text-violet-300 transition-colors mb-2 leading-snug">
                  {post.title}
                </h2>
                <p className="text-zinc-400 text-sm leading-relaxed">{post.description}</p>
              </div>
              <span className="text-zinc-600 group-hover:text-violet-400 transition-colors text-xl shrink-0 mt-1">
                →
              </span>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-16 bg-gradient-to-br from-violet-600/10 to-blue-600/10 border border-violet-500/20 rounded-2xl p-8 text-center">
        <h2 className="text-2xl font-bold mb-3">Ready to create faster?</h2>
        <p className="text-zinc-400 mb-6 max-w-lg mx-auto">
          Turn any video idea into a scene-by-scene production script with AI prompts formatted for VEO 3, Kling, and Runway.
        </p>
        <Link
          href="/signup"
          className="inline-block bg-violet-600 hover:bg-violet-500 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
        >
          Get 3 Free Scripts — No Credit Card
        </Link>
      </div>
    </div>
  )
}
