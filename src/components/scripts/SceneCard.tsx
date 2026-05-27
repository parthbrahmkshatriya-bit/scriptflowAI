"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import type { Scene } from "@/types/database";

interface Props {
  scene: Scene;
  canGenerateVoiceover?: boolean;
}

export default function SceneCard({ scene, canGenerateVoiceover = false }: Props) {
  const [copied, setCopied] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [generatingAudio, setGeneratingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  async function copyPrompt() {
    try {
      await navigator.clipboard.writeText(scene.ai_generation_prompt);
      setCopied(true);
      toast.success("Prompt copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const el = document.createElement("textarea");
      el.value = scene.ai_generation_prompt;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      toast.success("Prompt copied!");
      setTimeout(() => setCopied(false), 2000);
    }
  }

  async function generateVoiceover() {
    if (!scene.voiceover_text) return;
    setGeneratingAudio(true);
    try {
      const res = await fetch("/api/voiceover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: scene.voiceover_text }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error ?? "Voiceover generation failed");
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      // Revoke old URL if any
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      setAudioUrl(url);
      toast.success("Voiceover ready!");
    } catch {
      toast.error("Failed to generate voiceover. Please try again.");
    } finally {
      setGeneratingAudio(false);
    }
  }

  function downloadAudio() {
    if (!audioUrl) return;
    const a = document.createElement("a");
    a.href = audioUrl;
    a.download = `scene-${scene.scene_number}-voiceover.mp3`;
    a.click();
  }

  return (
    <Card>
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Badge variant="default" className="text-xs px-2">
              Scene {scene.scene_number}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {scene.duration_seconds}s
            </span>
            {scene.transition && (
              <span className="text-xs text-muted-foreground">
                → {scene.transition}
              </span>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-3">
        {/* Visual description */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
            Visual
          </p>
          <p className="text-sm">{scene.visual_description}</p>
        </div>

        {/* Camera */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
            Camera
          </p>
          <p className="text-sm">{scene.camera_direction}</p>
        </div>

        {/* Voiceover */}
        {scene.voiceover_text && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Voiceover
              </p>
              {canGenerateVoiceover && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 text-xs px-2 gap-1"
                  onClick={generateVoiceover}
                  disabled={generatingAudio}
                >
                  {generatingAudio ? (
                    <>
                      <span className="animate-spin inline-block w-3 h-3 border border-current border-t-transparent rounded-full" />
                      Generating…
                    </>
                  ) : (
                    <>🎙 Generate Audio</>
                  )}
                </Button>
              )}
            </div>
            <p className="text-sm italic">&quot;{scene.voiceover_text}&quot;</p>

            {/* Audio player */}
            {audioUrl && (
              <div className="mt-2 flex items-center gap-2">
                <audio
                  ref={audioRef}
                  src={audioUrl}
                  controls
                  className="h-8 flex-1 min-w-0"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 text-xs px-2 shrink-0"
                  onClick={downloadAudio}
                >
                  ↓ MP3
                </Button>
              </div>
            )}

            {/* Upgrade nudge for free users */}
            {!canGenerateVoiceover && scene.voiceover_text && (
              <p className="text-xs text-muted-foreground mt-1">
                🎙 <a href="/dashboard/upgrade" className="underline hover:text-foreground">Upgrade to Creator</a> to generate audio
              </p>
            )}
          </div>
        )}

        {/* On-screen text */}
        {scene.onscreen_text && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
              Text Overlay
            </p>
            <p className="text-sm font-medium">{scene.onscreen_text}</p>
          </div>
        )}

        {/* Music */}
        {scene.suggested_music && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
              Music / SFX
            </p>
            <p className="text-sm text-muted-foreground">{scene.suggested_music}</p>
          </div>
        )}

        <Separator />

        {/* AI Generation Prompt (highlighted) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-primary uppercase tracking-wide">
              AI Generation Prompt
            </p>
            <Button
              size="sm"
              variant={copied ? "default" : "outline"}
              className="h-7 text-xs"
              onClick={copyPrompt}
            >
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>
          <div className="bg-muted/60 rounded-md p-3 border border-primary/20">
            <p className="text-sm font-mono leading-relaxed whitespace-pre-wrap">
              {scene.ai_generation_prompt}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
