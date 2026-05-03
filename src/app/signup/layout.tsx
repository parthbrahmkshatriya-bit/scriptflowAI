import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Create Free Account",
  description:
    "Create a free ScriptFlow AI account. Get 3 AI video scripts per month — no credit card required. Turn ideas into production-ready scripts in 10 seconds.",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: "https://scriptflow-ai-omega.vercel.app/signup",
  },
}

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
