"use client";

import { useState, useRef, useEffect } from "react";
import { Download, Loader2, Mic, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Plan } from "@/types/database";

interface Props {
  voiceoverText: string;
  sceneNumber: number;
  sceneId: string;
  userPlan: Plan;
}

export function VoiceoverPlayer({
  voiceoverText,
  sceneNumber,
  sceneId,
  userPlan,
}: Props) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const errorTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevAudioUrl = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (prevAudioUrl.current) URL.revokeObjectURL(prevAudioUrl.current);
      if (errorTimer.current) clearTimeout(errorTimer.current);
    };
  }, []);

  async function generate() {
    setIsGenerating(true);
    setError(null);
    if (errorTimer.current) clearTimeout(errorTimer.current);

    try {
      const res = await fetch("/api/voiceover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: voiceoverText, sceneId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error ?? "Voiceover generation failed. Please try again."
        );
      }

      // base64 → blob → object URL
      const binary = atob(data.audio as string);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      const blob = new Blob([bytes], {
        type: (data.contentType as string) ?? "audio/mpeg",
      });

      // Revoke old URL before replacing
      if (audioUrl) {
        prevAudioUrl.current = audioUrl;
        URL.revokeObjectURL(audioUrl);
      }

      setAudioUrl(URL.createObjectURL(blob));
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Voiceover generation failed. Please try again.";
      setError(msg);
      errorTimer.current = setTimeout(() => setError(null), 5000);
    } finally {
      setIsGenerating(false);
    }
  }

  function download() {
    if (!audioUrl) return;
    const a = document.createElement("a");
    a.href = audioUrl;
    a.download = `scriptflow-scene-${sceneNumber}-voiceover.mp3`;
    a.click();
  }

  const isPaidPlan = userPlan === "creator" || userPlan === "pro";

  return (
    <div className="space-y-2.5 pt-1">
      <p className="text-xs font-mono font-semibold text-muted-foreground uppercase tracking-wide">
        Voiceover
      </p>
      <p className="text-sm italic text-muted-foreground">
        &quot;{voiceoverText}&quot;
      </p>

      {/* Buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        {isPaidPlan ? (
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
                Generating...
              </>
            ) : audioUrl ? (
              <>
                <RefreshCw className="size-3.5" />
                Regenerate
              </>
            ) : (
              <>
                <Mic className="size-3.5" />
                Generate Voiceover
              </>
            )}
          </button>
        ) : (
          <div className="group relative inline-block">
            <button
              disabled
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 text-xs font-medium text-zinc-600 cursor-not-allowed"
            >
              <Mic className="size-3.5" />
              Generate Voiceover
            </button>
            {/* Tooltip */}
            <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-20 w-56 pointer-events-none">
              <div className="rounded-lg border border-white/10 bg-zinc-900 px-3 py-2 text-xs text-zinc-300 shadow-xl">
                Upgrade to Creator plan to unlock voiceover.{" "}
                <a
                  href="/dashboard/upgrade"
                  className="text-[#00e5c0] hover:underline pointer-events-auto"
                >
                  Upgrade now →
                </a>
              </div>
              <div className="w-2 h-2 bg-zinc-900 border-l border-b border-white/10 rotate-[-45deg] ml-3 -mt-1" />
            </div>
          </div>
        )}

        {audioUrl && (
          <button
            onClick={download}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/15 text-xs font-medium text-zinc-400 hover:text-white hover:border-white/30 transition-all duration-200"
          >
            <Download className="size-3.5" />
            Download MP3
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}

      {/* Audio player */}
      {audioUrl && (
        <div className="rounded-lg border border-[#00e5c0]/20 bg-[#00e5c0]/[0.04] px-3 py-2.5">
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <audio
            src={audioUrl}
            controls
            className="w-full h-8"
            style={{ accentColor: "#00e5c0" }}
          />
        </div>
      )}
    </div>
  );
}
