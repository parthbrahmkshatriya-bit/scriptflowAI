import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sign in",
  description:
    "Sign in to your ScriptFlow AI account to generate AI video scripts for YouTube Shorts, Reels, and TikTok.",
  robots: {
    index: false,
    follow: false,
  },
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
