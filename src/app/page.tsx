import Link from "next/link";
import { buttonVariants } from "@/lib/button-variants";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-8 p-8 text-center">
      <div className="max-w-2xl">
        <h1 className="text-5xl font-bold tracking-tight mb-4">
          ScriptFlow AI
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Turn any video idea into a production-ready AI script in 10 seconds.
          Complete scene breakdowns with copy-paste prompts for VEO 3, Kling,
          Runway, Pika, and Midjourney.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/signup" className={cn(buttonVariants({ size: "lg" }))}>
            Get Started Free
          </Link>
          <Link href="/login" className={cn(buttonVariants({ size: "lg", variant: "outline" }))}>
            Sign In
          </Link>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mt-8 text-left">
        {[
          { step: "1", title: "Enter your concept", desc: "One sentence describing your video idea" },
          { step: "2", title: "Choose your tools", desc: "Pick duration, platform, style, and AI tool" },
          { step: "3", title: "Get your script", desc: "Scene-by-scene breakdown with ready-to-use prompts" },
        ].map((item) => (
          <div key={item.step} className="p-4 rounded-lg border bg-card">
            <div className="text-2xl font-bold text-primary mb-2">{item.step}</div>
            <div className="font-semibold mb-1">{item.title}</div>
            <div className="text-sm text-muted-foreground">{item.desc}</div>
          </div>
        ))}
      </div>
    </main>
  );
}
