"use client";

import { useState, useRef, useEffect } from "react";
import { Download, Loader2, Video, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Plan } from "@/types/database";

interface Props {
  prompt: string;
  sceneNumber: number;
  sceneId: string;
  userPlan: Plan;
}

export function VideoPlayer({ prompt, sceneNumber, sceneId, userPlan }: Props) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const errorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    };
  }, []);

  async function generate() {
    setIsGenerating(true);
    setError(null);
    setElapsedSeconds(0);
    if (errorTimerRef.current) clearTimeout(errorTimerRef.current);

    timerRef.current = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);

    try {
      const res = await fetch("/api/video/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sceneId, prompt }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Video generation failed. Please try again.");
      }

      setVideoUrl(data.videoUrl as string);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Video generation failed. Please try again.";
      setError(msg);
      errorTimerRef.current = setTimeout(() => setError(null), 8000);
    } finally {
      setIsGenerating(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }

  function download() {
    if (!videoUrl) return;
    const a = document.createElement("a");
    a.href = videoUrl;
    a.download = `scriptflow-scene-${sceneNumber}-kling.mp4`;
    a.click();
  }

  const isProPlan = ["studio", "agency"].includes(userPlan);

  return (
    <div className="space-y-2.5 pt-1">
      <p className="text-xs font-mono font-semibold text-muted-foreground uppercase tracking-wide">
        AI Video
      </p>

      {/* Prompt preview — read-only, truncated */}
      <p className="text-xs text-zinc-500 font-mono leading-relaxed line-clamp-2 select-all">
        {prompt}
      </p>

      {/* Buttons row */}
      <div className="flex items-center gap-2 flex-wrap">
        {isProPlan ? (
          <button
            onClick={generate}
            disabled={isGenerating}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all duration-200",
              "border-[#00e5c0]/40 text-[#00e5c0] hover:border-[#00e5c0]/80 hover:bg-[#00e5c0]/10",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {isGenerating ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                Generating... {elapsedSeconds}s
              </>
            ) : videoUrl ? (
              <>
                <RefreshCw className="size-3.5" />
                Regenerate
              </>
            ) : (
              <>
                <Video className="size-3.5" />
                Generate with Kling 2.0
              </>
            )}
          </button>
        ) : (
          <div className="group relative inline-block">
            <button
              disabled
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 text-xs font-medium text-zinc-600 cursor-not-allowed"
            >
              <Video className="size-3.5" />
              Generate with Kling 2.0
            </button>
            {/* Upgrade tooltip */}
            <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-20 w-60 pointer-events-none">
              <div className="rounded-lg border border-white/10 bg-zinc-900 px-3 py-2 text-xs text-zinc-300 shadow-xl">
                Upgrade to Pro plan to generate videos.{" "}
                <a
                  href="/pricing"
                  className="text-[#00e5c0] hover:underline pointer-events-auto"
                >
                  Upgrade now →
                </a>
              </div>
              <div className="w-2 h-2 bg-zinc-900 border-l border-b border-white/10 rotate-[-45deg] ml-3 -mt-1" />
            </div>
          </div>
        )}

        {videoUrl && (
          <button
            onClick={download}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/15 text-xs font-medium text-zinc-400 hover:text-white hover:border-white/30 transition-all duration-200"
          >
            <Download className="size-3.5" />
            Download MP4
          </button>
        )}
      </div>

      {/* Error */}
      {error && <p className="text-xs text-red-400">{error}</p>}

      {/* Video player — 9:16 container */}
      {videoUrl && (
        <div className="rounded-xl border border-[#00e5c0]/20 bg-black overflow-hidden">
            {/* Video has no dialogue track — captions not applicable */}
          <video
            src={videoUrl}
            autoPlay
            muted
            loop
            controls
            className="w-full"
            style={{ aspectRatio: "9/16", maxHeight: "400px", objectFit: "cover" }}
          />
        </div>
      )}
    </div>
  );
}
