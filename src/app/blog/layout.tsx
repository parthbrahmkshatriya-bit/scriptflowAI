import Link from "next/link"
import { Sparkles } from "lucide-react"

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#050508] text-white">
      <header className="border-b border-white/[0.06] sticky top-0 z-50 bg-[#050508]/90 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-base">
            <div className="size-7 rounded-lg bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center">
              <Sparkles className="size-3.5 text-white" />
            </div>
            <span className="bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
              ScriptFlow AI
            </span>
          </Link>
          <nav className="flex items-center gap-6 text-sm text-zinc-400">
            <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
            <Link href="/#pricing" className="hover:text-white transition-colors">Pricing</Link>
            <Link
              href="/signup"
              className="bg-violet-600 hover:bg-violet-500 text-white px-4 py-1.5 rounded-lg transition-colors font-medium"
            >
              Get Started Free
            </Link>
          </nav>
        </div>
      </header>

      <main>{children}</main>

      <footer className="border-t border-white/[0.06] mt-24 py-12">
        <div className="max-w-4xl mx-auto px-4 text-center text-sm text-zinc-500">
          <p className="mb-2">
            <Link href="/" className="hover:text-white transition-colors">ScriptFlow AI</Link>
            {" — "}AI Video Script Generator for YouTube Shorts, Reels & TikTok
          </p>
          <p className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
            <Link href="/#pricing" className="hover:text-white transition-colors">Pricing</Link>
            <Link href="/signup" className="hover:text-white transition-colors">Sign Up Free</Link>
            <Link href="/veo3-script-generator" className="hover:text-white transition-colors">VEO 3 Generator</Link>
            <Link href="/youtube-shorts-script-generator" className="hover:text-white transition-colors">Shorts Generator</Link>
          </p>
        </div>
      </footer>
    </div>
  )
}
