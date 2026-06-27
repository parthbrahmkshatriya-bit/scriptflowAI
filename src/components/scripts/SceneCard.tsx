"use client";

import { useState, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import type { Scene } from "@/types/database";

interface Props {
  scene: Scene;
  canGenerateVideo?: boolean;
  onChange?: (updated: Scene) => void;
}

type EditableField =
  | "visual_description"
  | "camera_direction"
  | "voiceover_text"
  | "onscreen_text"
  | "ai_generation_prompt";

function EditableText({
  value,
  placeholder,
  onChange,
  mono = false,
  italic = false,
  className = "",
}: {
  value: string | null;
  placeholder: string;
  onChange: (val: string) => void;
  mono?: boolean;
  italic?: boolean;
  className?: string;
}) {
  const [editing, setEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function startEdit() {
    setEditing(true);
    setTimeout(() => {
      const el = textareaRef.current;
      if (el) {
        el.focus();
        el.selectionStart = el.value.length;
      }
    }, 0);
  }

  function commit() {
    setEditing(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Escape") setEditing(false);
  }

  function autoResize(el: HTMLTextAreaElement) {
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }

  if (editing) {
    return (
      <textarea
        ref={textareaRef}
        defaultValue={value ?? ""}
        className={`w-full resize-none rounded-md border border-primary/40 bg-background px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-primary ${mono ? "font-mono" : ""} ${italic ? "italic" : ""} ${className}`}
        rows={3}
        onInput={(e) => autoResize(e.currentTarget)}
        onChange={(e) => onChange(e.target.value)}
        onBlur={commit}
        onKeyDown={handleKeyDown}
      />
    );
  }

  const display = value?.trim() || placeholder;
  const isEmpty = !value?.trim();

  return (
    <p
      onClick={startEdit}
      title="Click to edit"
      className={`cursor-text rounded px-1 -mx-1 text-sm hover:bg-muted/50 transition-colors min-h-[1.5rem] ${
        mono ? "font-mono whitespace-pre-wrap leading-relaxed" : ""
      } ${italic ? "italic" : ""} ${isEmpty ? "text-muted-foreground/50" : ""} ${className}`}
    >
      {display}
    </p>
  );
}

type VideoStatus = "idle" | "submitting" | "queued" | "processing" | "done" | "failed";

export default function SceneCard({ scene, canGenerateVideo = false, onChange }: Props) {
  const [local, setLocal] = useState<Scene>(scene);
  const [copied, setCopied] = useState(false);
  const [videoStatus, setVideoStatus] = useState<VideoStatus>(scene.video_url ? "done" : "idle");
  const [videoUrl, setVideoUrl] = useState<string | null>(scene.video_url ?? null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const updateField = useCallback(
    (field: EditableField, value: string) => {
      const updated: Scene = {
        ...local,
        [field]: value === "" && (field === "voiceover_text" || field === "onscreen_text") ? null : value,
      };
      setLocal(updated);
      onChange?.(updated);
    },
    [local, onChange]
  );

  async function copyPrompt() {
    const text = local.voiceover_text
      ? `${local.ai_generation_prompt}\n\nVoiceover: "${local.voiceover_text}"`
      : local.ai_generation_prompt;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Prompt copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      toast.success("Prompt copied!");
      setTimeout(() => setCopied(false), 2000);
    }
  }

  async function generateVideo() {
    setVideoStatus("submitting");
    setVideoUrl(null);
    setAudioUrl(null);

    try {
      const promptWithVoiceover = local.voiceover_text
        ? `${local.ai_generation_prompt}\n\nVoiceover: "${local.voiceover_text}"`
        : local.ai_generation_prompt;

      const res = await fetch("/api/generate-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: promptWithVoiceover,
          duration_seconds: local.duration_seconds,
          voiceover_text: local.voiceover_text ?? null,
        }),
      });

      const data = await res.json() as {
        request_id?: string;
        audio_url?: string | null;
        error?: string;
      };

      if (!res.ok) {
        toast.error(data.error ?? "Failed to start generation");
        setVideoStatus("failed");
        return;
      }

      // Audio is ready immediately from ElevenLabs
      if (data.audio_url) {
        setAudioUrl(data.audio_url);
        toast.success("Voiceover audio ready — video generating in background…");
      } else {
        toast.info("Video queued — Kling 2.0 takes 2–5 minutes, please wait…");
      }

      const requestId = data.request_id!;
      setVideoStatus("queued");

      const timeoutId = setTimeout(() => {
        clearInterval(pollRef.current!);
        setVideoStatus("failed");
        toast.error("Video generation timed out. Please try again.");
      }, 600_000);

      let consecutiveErrors = 0;

      pollRef.current = setInterval(async () => {
        try {
          const statusRes = await fetch(
            `/api/generate-video/status?request_id=${requestId}&scene_id=${local.id}`
          );
          const statusData = await statusRes.json() as { status: string; video_url?: string };
          consecutiveErrors = 0;

          if (statusData.status === "IN_PROGRESS") {
            setVideoStatus("processing");
          } else if (statusData.status === "COMPLETED") {
            clearInterval(pollRef.current!);
            clearTimeout(timeoutId);
            if (statusData.video_url) {
              setVideoUrl(statusData.video_url);
              setVideoStatus("done");
              toast.success("Video ready! Press play to watch with voiceover.");
            } else {
              setVideoStatus("failed");
              toast.error("Video completed but no URL returned. Please try again.");
            }
          } else if (statusData.status === "FAILED") {
            clearInterval(pollRef.current!);
            clearTimeout(timeoutId);
            setVideoStatus("failed");
            toast.error("Video generation failed. Please try again.");
          }
        } catch {
          consecutiveErrors += 1;
          if (consecutiveErrors >= 3) {
            clearInterval(pollRef.current!);
            clearTimeout(timeoutId);
            setVideoStatus("failed");
            toast.error("Lost connection while generating video.");
          }
        }
      }, 8000);
    } catch {
      setVideoStatus("failed");
      toast.error("Failed to start generation.");
    }
  }

  // Keep audio in sync with video
  function onVideoPlay() {
    const audio = audioRef.current;
    const video = videoRef.current;
    if (!audio || !video) return;
    audio.currentTime = video.currentTime;
    audio.play().catch(() => {/* autoplay may be blocked — user tapped play so it should be fine */});
  }

  function onVideoPause() {
    audioRef.current?.pause();
  }

  function onVideoSeeked() {
    const audio = audioRef.current;
    const video = videoRef.current;
    if (audio && video) audio.currentTime = video.currentTime;
  }

  function onVideoEnded() {
    audioRef.current?.pause();
  }

  function downloadVideo() {
    if (!videoUrl) return;
    const a = document.createElement("a");
    a.href = videoUrl;
    a.download = `scene-${local.scene_number}-video.mp4`;
    a.click();
  }

  const hasVoiceover = !!local.voiceover_text?.trim();

  const videoStatusLabel: Record<VideoStatus, string> = {
    idle: hasVoiceover ? "🎬 Generate Video + Audio" : "🎬 Generate Video",
    submitting: "Preparing…",
    queued: "Video in queue…",
    processing: "Generating video…",
    done: hasVoiceover ? "🎬 Regenerate Video + Audio" : "🎬 Regenerate",
    failed: hasVoiceover ? "🎬 Retry Video + Audio" : "🎬 Retry",
  };

  return (
    <Card>
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex items-center gap-2">
          <Badge variant="default" className="text-xs px-2">
            Scene {local.scene_number}
          </Badge>
          <span className="text-xs text-muted-foreground">{local.duration_seconds}s</span>
          {local.transition && (
            <span className="text-xs text-muted-foreground">→ {local.transition}</span>
          )}
          {onChange && (
            <span className="ml-auto text-[10px] text-muted-foreground/50 select-none">
              click any field to edit
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className="px-4 pb-4 space-y-3">
        {/* Visual description */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
            Visual
          </p>
          <EditableText
            value={local.visual_description}
            placeholder="Describe what the viewer sees…"
            onChange={(v) => updateField("visual_description", v)}
          />
        </div>

        {/* Camera */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
            Camera
          </p>
          <EditableText
            value={local.camera_direction}
            placeholder="Camera angle, movement, framing…"
            onChange={(v) => updateField("camera_direction", v)}
          />
        </div>

        {/* On-screen text */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
            Text Overlay
          </p>
          <EditableText
            value={local.onscreen_text}
            placeholder="Short text overlay (max 10 words)…"
            onChange={(v) => updateField("onscreen_text", v)}
            className="font-medium"
          />
        </div>

        {/* Music */}
        {local.suggested_music && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
              Music / SFX
            </p>
            <p className="text-sm text-muted-foreground">{local.suggested_music}</p>
          </div>
        )}

        <Separator />

        {/* AI Generation Prompt + Voiceover + Video */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-primary uppercase tracking-wide">
              AI Generation Prompt
            </p>
            <div className="flex items-center gap-2">
              {canGenerateVideo && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs gap-1"
                  onClick={generateVideo}
                  disabled={
                    videoStatus === "submitting" ||
                    videoStatus === "queued" ||
                    videoStatus === "processing"
                  }
                >
                  {(videoStatus === "submitting" ||
                    videoStatus === "queued" ||
                    videoStatus === "processing") && (
                    <span className="animate-spin inline-block w-3 h-3 border border-current border-t-transparent rounded-full" />
                  )}
                  {videoStatusLabel[videoStatus]}
                </Button>
              )}
              <Button
                size="sm"
                variant={copied ? "default" : "outline"}
                className="h-7 text-xs"
                onClick={copyPrompt}
              >
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
          </div>

          {/* Prompt + voiceover in one box */}
          <div className="bg-muted/60 rounded-md p-3 border border-primary/20 space-y-3">
            <EditableText
              value={local.ai_generation_prompt}
              placeholder="AI generation prompt…"
              onChange={(v) => updateField("ai_generation_prompt", v)}
              mono
            />
            {local.voiceover_text && (
              <>
                <div className="border-t border-white/10" />
                <div>
                  <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wide mb-1">
                    Voiceover
                  </p>
                  <EditableText
                    value={local.voiceover_text}
                    placeholder="Add voiceover narration…"
                    onChange={(v) => updateField("voiceover_text", v)}
                    italic
                  />
                </div>
              </>
            )}
          </div>

          {/* Video + synced audio player */}
          {videoStatus !== "idle" && (
            <div className="mt-3">
              {videoUrl ? (
                <div className="space-y-2">
                  <video
                    ref={videoRef}
                    src={videoUrl}
                    controls
                    className="w-full rounded-md max-h-80 bg-black"
                    playsInline
                    onPlay={onVideoPlay}
                    onPause={onVideoPause}
                    onSeeked={onVideoSeeked}
                    onEnded={onVideoEnded}
                  />
                  {/* Hidden audio element — synced to video via event handlers */}
                  {audioUrl && (
                    <audio ref={audioRef} src={audioUrl} preload="auto" />
                  )}
                  {audioUrl && (
                    <p className="text-[10px] text-muted-foreground">
                      🔊 Voiceover audio included — press play to hear it
                    </p>
                  )}
                  <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={downloadVideo}>
                    ↓ Download MP4
                  </Button>
                </div>
              ) : videoStatus === "failed" ? (
                <p className="text-xs text-destructive">Generation failed — try again.</p>
              ) : (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="animate-spin inline-block w-3 h-3 border border-current border-t-transparent rounded-full" />
                    {videoStatus === "queued"
                      ? "Video in queue — Kling 2.0 takes 2–5 min…"
                      : "Generating your video…"}
                  </div>
                  {audioUrl && (
                    <p className="text-[10px] text-green-500">✓ Voiceover audio ready</p>
                  )}
                </div>
              )}
            </div>
          )}

          {!canGenerateVideo && (
            <p className="text-xs text-muted-foreground mt-2">
              🎬{" "}
              <a href="/dashboard/upgrade" className="underline hover:text-foreground">
                Upgrade your plan
              </a>{" "}
              to generate videos
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
