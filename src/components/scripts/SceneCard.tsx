"use client";

import { useState, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { ImageIcon, X } from "lucide-react";
import type { Scene } from "@/types/database";
import ScriptFeedback from "@/components/scripts/ScriptFeedback";

interface Props {
  scene: Scene;
  canGenerateVideo?: boolean;
  totalVideoCredits?: number;
  monthlyVideoRemaining?: number;
  purchasedCredits?: number;
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
      if (el) { el.focus(); el.selectionStart = el.value.length; }
    }, 0);
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
        onBlur={() => setEditing(false)}
        onKeyDown={(e) => { if (e.key === "Escape") setEditing(false); }}
      />
    );
  }

  const display = value?.trim() || placeholder;
  const isEmpty = !value?.trim();
  return (
    <p
      onClick={startEdit}
      title="Click to edit"
      className={`cursor-text rounded px-1 -mx-1 text-sm hover:bg-muted/50 transition-colors min-h-[1.5rem] ${mono ? "font-mono whitespace-pre-wrap leading-relaxed" : ""} ${italic ? "italic" : ""} ${isEmpty ? "text-muted-foreground/50" : ""} ${className}`}
    >
      {display}
    </p>
  );
}

type VideoStatus = "idle" | "submitting" | "queued" | "processing" | "done" | "failed";
type VideoModel = "fast" | "pro";

export default function SceneCard({ scene, canGenerateVideo = false, totalVideoCredits = 0, monthlyVideoRemaining = 0, purchasedCredits = 0, onChange }: Props) {
  const [local, setLocal] = useState<Scene>(scene);
  const [copied, setCopied] = useState(false);
  const [videoStatus, setVideoStatus] = useState<VideoStatus>(scene.video_url ? "done" : "idle");
  const [videoUrl, setVideoUrl] = useState<string | null>(scene.video_url ?? null);
  // Defaults to the budget model. Veo 3.1 Lite costs $0.05/s against Veo 3.1
  // Fast at $0.10/s for the same clip, and both are the same model family, so
  // a Lite render still previews what Fast would look like. Users who want the
  // higher-fidelity render opt into it per scene.
  const [selectedModel, setSelectedModel] = useState<VideoModel>("fast");
  const [currentCredits, setCurrentCredits] = useState<number>(totalVideoCredits);
  const [referenceImageUrl, setReferenceImageUrl] = useState<string | null>(null);
  const [referenceImagePreview, setReferenceImagePreview] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
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
    const text = local.voiceover_text
      ? `${local.ai_generation_prompt}\n\nVoiceover: "${local.voiceover_text}"`
      : local.ai_generation_prompt;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    toast.success("Prompt copied!");
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleReferenceImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Only JPEG, PNG, and WebP images are supported");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be 10 MB or smaller");
      return;
    }

    // Show local preview immediately
    const reader = new FileReader();
    reader.onload = (ev) => setReferenceImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    setIsUploadingImage(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload-reference-image", { method: "POST", body: form });
      const data = await res.json() as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        toast.error(data.error ?? "Image upload failed");
        setReferenceImagePreview(null);
        return;
      }
      setReferenceImageUrl(data.url);
      toast.success("Reference image uploaded — video will use it as the product base");
    } catch {
      toast.error("Failed to upload image");
      setReferenceImagePreview(null);
    } finally {
      setIsUploadingImage(false);
    }
  }

  function removeReferenceImage() {
    setReferenceImageUrl(null);
    setReferenceImagePreview(null);
  }

  async function generateVideo() {
    setVideoStatus("submitting");
    setVideoUrl(null);

    try {
      const res = await fetch("/api/generate-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ai_generation_prompt: local.ai_generation_prompt,
          visual_description: local.visual_description,
          camera_direction: local.camera_direction,
          voiceover_text: local.voiceover_text ?? null,
          onscreen_text: local.onscreen_text ?? null,
          suggested_music: local.suggested_music ?? null,
          duration_seconds: local.duration_seconds,
          aspect_ratio: "9:16",
          model: selectedModel,
          image_url: referenceImageUrl ?? null,
        }),
      });

      const data = await res.json() as {
        request_id?: string;
        model?: string;
        model_type?: string;
        error?: string;
        total_remaining?: number;
      };
      if (!res.ok) {
        toast.error(data.error ?? "Failed to start generation");
        setVideoStatus("failed");
        return;
      }

      // Update local credit count from server response
      if (typeof data.total_remaining === "number") {
        setCurrentCredits(data.total_remaining);
      }

      const requestId = data.request_id!;
      const usedModelId = data.model;
      const usedModelType = data.model_type ?? selectedModel;
      setVideoStatus("queued");
      const modelLabel = usedModelType === "image" ? "Kling 2.1 (image-to-video)"
        : usedModelType === "fast" ? "Veo 3.1 Lite" : "Veo 3.1 Fast";
      const eta = usedModelType === "image" ? "~1–2 minutes"
        : usedModelType === "fast" ? "~40–90 seconds" : "1–3 minutes";
      toast.info(`Generating with ${modelLabel} — takes ${eta}…`);

      const timeoutId = setTimeout(() => {
        clearInterval(pollRef.current!);
        setVideoStatus("failed");
        toast.error("Generation timed out. Please try again.");
      }, 600_000);

      let consecutiveErrors = 0;

      pollRef.current = setInterval(async () => {
        try {
          const statusUrl = usedModelId
            ? `/api/generate-video/status?request_id=${requestId}&scene_id=${local.id}&model_id=${encodeURIComponent(usedModelId)}`
            : `/api/generate-video/status?request_id=${requestId}&scene_id=${local.id}&model=${usedModelType}`;
          const statusRes = await fetch(statusUrl);
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
              toast.success("Video + audio ready! Press play.");
              // Propagate video_url up so StitchButton knows this scene is ready
              const withVideo = { ...local, video_url: statusData.video_url };
              setLocal(withVideo);
              onChange?.(withVideo);
            } else {
              setVideoStatus("failed");
              toast.error("Generation completed but no URL returned. Please retry.");
            }
          } else if (statusData.status === "FAILED") {
            clearInterval(pollRef.current!);
            clearTimeout(timeoutId);
            setVideoStatus("failed");
            toast.error("Generation failed. Please try again.");
          }
        } catch {
          consecutiveErrors += 1;
          if (consecutiveErrors >= 3) {
            clearInterval(pollRef.current!);
            clearTimeout(timeoutId);
            setVideoStatus("failed");
            toast.error("Lost connection during generation.");
          }
        }
      }, 8000);
    } catch {
      setVideoStatus("failed");
      toast.error("Failed to start generation.");
    }
  }

  function downloadVideo() {
    if (!videoUrl) return;
    const a = document.createElement("a");
    a.href = videoUrl;
    a.download = `scene-${local.scene_number}-video.mp4`;
    a.click();
  }

  const hasVoiceover = !!local.voiceover_text?.trim();

  const isGenerating = videoStatus === "submitting" || videoStatus === "queued" || videoStatus === "processing";

  const videoStatusLabel: Record<VideoStatus, string> = {
    idle: hasVoiceover ? "Generate Video + Audio" : "Generate Video",
    submitting: "Preparing…",
    queued: "In queue…",
    processing: "Generating…",
    done: "Regenerate",
    failed: "Retry",
  };

  return (
    <Card style={isGenerating ? { cursor: "wait" } : undefined}>
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex items-center gap-2">
          <Badge variant="default" className="text-xs px-2">Scene {local.scene_number}</Badge>
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
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Visual</p>
          <EditableText value={local.visual_description} placeholder="Describe what the viewer sees…" onChange={(v) => updateField("visual_description", v)} />
        </div>

        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Camera</p>
          <EditableText value={local.camera_direction} placeholder="Camera angle, movement, framing…" onChange={(v) => updateField("camera_direction", v)} />
        </div>

        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Text Overlay</p>
          <EditableText value={local.onscreen_text} placeholder="Short text overlay (max 10 words)…" onChange={(v) => updateField("onscreen_text", v)} className="font-medium" />
        </div>

        {local.suggested_music && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Music / SFX</p>
            <p className="text-sm text-muted-foreground">{local.suggested_music}</p>
          </div>
        )}

        <Separator />

        {/* AI Prompt + Voiceover + Generate */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-primary uppercase tracking-wide">
              AI Generation Prompt
            </p>
            <Button size="sm" variant={copied ? "default" : "outline"} className="h-7 text-xs" onClick={copyPrompt}>
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>

          {/* Prompt + voiceover unified box */}
          <div className="bg-muted/60 rounded-md p-3 border border-primary/20 space-y-3">
            <EditableText value={local.ai_generation_prompt} placeholder="AI generation prompt…" onChange={(v) => updateField("ai_generation_prompt", v)} mono />
            {local.voiceover_text && (
              <>
                <div className="border-t border-white/10" />
                <div>
                  <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wide mb-1">Voiceover</p>
                  <EditableText value={local.voiceover_text} placeholder="Add voiceover narration…" onChange={(v) => updateField("voiceover_text", v)} italic />
                </div>
              </>
            )}
          </div>

          {/* Video generation controls */}
          {canGenerateVideo ? (
            <div className="mt-3 space-y-2">
              {/* Model selector + credit display row */}
              <div className="flex items-center justify-between gap-2">
                {/* Model selector. Both tiers are Veo 3.1 with native audio;
                    Lite is the budget render, Fast the higher-fidelity one. */}
                <div className="flex rounded-md border border-white/10 overflow-hidden text-xs">
                  <button
                    onClick={() => setSelectedModel("fast")}
                    title="Veo 3.1 Lite — lowest cost, native audio. Best for drafts and iterations."
                    className={`px-3 py-1.5 font-medium transition-colors ${
                      selectedModel === "fast"
                        ? "bg-violet-600 text-white"
                        : "text-muted-foreground hover:bg-white/5"
                    }`}
                    disabled={isGenerating}
                  >
                    ⚡ Lite
                    <span className="ml-1 opacity-60 font-normal">Veo 3.1</span>
                  </button>
                  <button
                    onClick={() => setSelectedModel("pro")}
                    title="Veo 3.1 Fast — higher fidelity, native audio. Costs about twice a Lite render."
                    className={`px-3 py-1.5 font-medium transition-colors border-l border-white/10 ${
                      selectedModel === "pro"
                        ? "bg-violet-600 text-white"
                        : "text-muted-foreground hover:bg-white/5"
                    }`}
                    disabled={isGenerating}
                  >
                    ✨ Fast
                    <span className="ml-1 opacity-60 font-normal">Veo 3.1</span>
                  </button>
                </div>

                {/* Credit display */}
                <span className="text-[10px] text-muted-foreground">
                  {currentCredits > 0 ? (
                    <>
                      <span className="text-violet-400 font-semibold">{currentCredits}</span>
                      {" "}video{currentCredits === 1 ? "" : "s"} left
                      {purchasedCredits > 0 && monthlyVideoRemaining > 0 && (
                        <span className="opacity-60"> ({monthlyVideoRemaining} monthly + {purchasedCredits} credits)</span>
                      )}
                    </>
                  ) : (
                    <span className="text-amber-400">No credits left</span>
                  )}
                </span>
              </div>

              {/* Reference image upload */}
              <div>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleReferenceImageSelect}
                />
                {referenceImagePreview ? (
                  <div className="flex items-center gap-2 p-2 rounded-lg border border-white/10 bg-white/[0.03]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={referenceImagePreview}
                      alt="Reference"
                      className="h-10 w-10 rounded object-cover shrink-0 border border-white/10"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-zinc-400 truncate">
                        {isUploadingImage ? "Uploading…" : "Reference image set — Kling will use it"}
                      </p>
                      <p className="text-[9px] text-zinc-600">Product stays consistent</p>
                    </div>
                    <button
                      onClick={removeReferenceImage}
                      disabled={isUploadingImage || isGenerating}
                      className="shrink-0 text-zinc-600 hover:text-red-400 transition-colors disabled:opacity-40"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => imageInputRef.current?.click()}
                    disabled={isGenerating}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-white/10 text-zinc-500 hover:text-zinc-300 hover:border-violet-500/40 hover:bg-violet-500/5 transition-all text-xs disabled:opacity-40"
                  >
                    <ImageIcon className="size-3.5 shrink-0" />
                    <span>Add product image — keeps your product in the video</span>
                  </button>
                )}
              </div>

              {/* Generate button */}
              <Button
                size="sm"
                variant="outline"
                className="w-full h-8 text-xs gap-1.5"
                onClick={generateVideo}
                disabled={isGenerating || currentCredits <= 0 || isUploadingImage}
              >
                {isGenerating && (
                  <span className="animate-spin inline-block w-3 h-3 border border-current border-t-transparent rounded-full" />
                )}
                🎬 {videoStatusLabel[videoStatus]}
                {referenceImageUrl && !isGenerating && (
                  <span className="text-[9px] text-violet-400 ml-1">(Kling image-to-video)</span>
                )}
              </Button>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground mt-2">
              🎬 <a href="/dashboard/upgrade" className="underline hover:text-foreground">Upgrade your plan</a> to generate videos
            </p>
          )}

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
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[10px] text-muted-foreground">
                      🎬 Generated by {referenceImageUrl ? "Kling 2.1 (image-to-video)" : selectedModel === "fast" ? "Veo 3.1 Lite" : "Veo 3.1 Fast"}
                    </p>
                    <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={downloadVideo}>
                      ↓ Download MP4
                    </Button>
                  </div>
                  <ScriptFeedback
                    scriptId={local.script_id}
                    sceneId={local.id}
                    type="video"
                    label="How's the video quality?"
                  />
                </div>
              ) : videoStatus === "failed" ? (
                <p className="text-xs text-destructive">Generation failed — try again.</p>
              ) : videoStatus === "done" && !videoUrl ? null : (
                <div className="mt-3 flex flex-col items-center gap-3 py-5">
                  <div className="size-12 rounded-full border-4 border-violet-500/15 border-t-violet-500 animate-spin" />
                  <p className="text-xs text-muted-foreground">
                    {videoStatus === "queued" ? "In queue…" : "Generating…"}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
