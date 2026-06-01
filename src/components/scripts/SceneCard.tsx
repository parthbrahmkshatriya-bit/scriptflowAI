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
  canGenerateVoiceover?: boolean;
  canGenerateVideo?: boolean;
  onChange?: (updated: Scene) => void;
}

// Editable fields users can click to modify
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
    // Focus after render
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
    if (e.key === "Escape") {
      setEditing(false);
    }
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

export default function SceneCard({ scene, canGenerateVoiceover = false, canGenerateVideo = false, onChange }: Props) {
  const [local, setLocal] = useState<Scene>(scene);
  const [copied, setCopied] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [generatingAudio, setGeneratingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [videoStatus, setVideoStatus] = useState<VideoStatus>("idle");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
    try {
      await navigator.clipboard.writeText(local.ai_generation_prompt);
      setCopied(true);
      toast.success("Prompt copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const el = document.createElement("textarea");
      el.value = local.ai_generation_prompt;
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
    if (!local.voiceover_text) return;
    setGeneratingAudio(true);
    try {
      const res = await fetch("/api/voiceover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: local.voiceover_text }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error ?? "Voiceover generation failed");
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
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
    a.download = `scene-${local.scene_number}-voiceover.mp3`;
    a.click();
  }

  async function generateVideo() {
    setVideoStatus("submitting");
    setVideoUrl(null);
    try {
      const res = await fetch("/api/generate-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: local.ai_generation_prompt }),
      });
      const data = await res.json() as { request_id?: string; error?: string; limit?: number };
      if (!res.ok) {
        toast.error(data.error ?? "Failed to start video generation");
        setVideoStatus("failed");
        return;
      }
      const requestId = data.request_id!;
      setVideoStatus("queued");
      toast.info("Video queued — generating in background…");

      // Poll for status every 5 seconds
      pollRef.current = setInterval(async () => {
        try {
          const statusRes = await fetch(`/api/generate-video/status?request_id=${requestId}`);
          const statusData = await statusRes.json() as { status: string; video_url?: string; error?: string };
          if (statusData.status === "IN_PROGRESS") {
            setVideoStatus("processing");
          } else if (statusData.status === "COMPLETED" && statusData.video_url) {
            clearInterval(pollRef.current!);
            setVideoUrl(statusData.video_url);
            setVideoStatus("done");
            toast.success("Video ready!");
          } else if (statusData.status === "FAILED") {
            clearInterval(pollRef.current!);
            setVideoStatus("failed");
            toast.error("Video generation failed. Please try again.");
          }
        } catch {
          clearInterval(pollRef.current!);
          setVideoStatus("failed");
          toast.error("Lost connection while generating video.");
        }
      }, 5000);
    } catch {
      setVideoStatus("failed");
      toast.error("Failed to start video generation.");
    }
  }

  function downloadVideo() {
    if (!videoUrl) return;
    const a = document.createElement("a");
    a.href = videoUrl;
    a.download = `scene-${local.scene_number}-video.mp4`;
    a.click();
  }

  const videoStatusLabel: Record<VideoStatus, string> = {
    idle: "🎬 Generate Video",
    submitting: "Submitting…",
    queued: "In queue…",
    processing: "Generating…",
    done: "🎬 Regenerate",
    failed: "🎬 Retry",
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

        {/* Voiceover */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Voiceover
            </p>
            {canGenerateVoiceover && local.voiceover_text && (
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
          <EditableText
            value={local.voiceover_text}
            placeholder="Add voiceover narration…"
            onChange={(v) => updateField("voiceover_text", v)}
            italic
          />
          {audioUrl && (
            <div className="mt-2 flex items-center gap-2">
              <audio ref={audioRef} src={audioUrl} controls className="h-8 flex-1 min-w-0" />
              <Button size="sm" variant="ghost" className="h-8 text-xs px-2 shrink-0" onClick={downloadAudio}>
                ↓ MP3
              </Button>
            </div>
          )}
          {!canGenerateVoiceover && (
            <p className="text-xs text-muted-foreground mt-1">
              🎙 <a href="/dashboard/upgrade" className="underline hover:text-foreground">Upgrade to Creator</a> to generate audio
            </p>
          )}
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

        {/* AI Generation Prompt */}
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
                  disabled={videoStatus === "submitting" || videoStatus === "queued" || videoStatus === "processing"}
                >
                  {(videoStatus === "submitting" || videoStatus === "queued" || videoStatus === "processing") && (
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
          <div className="bg-muted/60 rounded-md p-3 border border-primary/20">
            <EditableText
              value={local.ai_generation_prompt}
              placeholder="AI generation prompt…"
              onChange={(v) => updateField("ai_generation_prompt", v)}
              mono
            />
          </div>

          {/* Video player */}
          {videoStatus !== "idle" && (
            <div className="mt-3">
              {videoUrl ? (
                <div className="space-y-2">
                  <video
                    src={videoUrl}
                    controls
                    className="w-full rounded-md max-h-80 bg-black"
                    playsInline
                  />
                  <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={downloadVideo}>
                    ↓ Download MP4
                  </Button>
                </div>
              ) : videoStatus === "failed" ? (
                <p className="text-xs text-destructive">Generation failed — try again.</p>
              ) : (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="animate-spin inline-block w-3 h-3 border border-current border-t-transparent rounded-full" />
                  {videoStatus === "queued" ? "Waiting in queue (30–90s)…" : "Generating your video…"}
                </div>
              )}
            </div>
          )}

          {!canGenerateVideo && (
            <p className="text-xs text-muted-foreground mt-2">
              🎬 <a href="/dashboard/upgrade" className="underline hover:text-foreground">Upgrade to Creator</a> to generate videos (15/month)
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
