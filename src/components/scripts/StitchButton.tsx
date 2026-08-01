"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { Scene } from "@/types/database";

interface Props {
  scenes: Scene[];
  scriptTitle: string;
}

type StitchStatus = "idle" | "loading-ffmpeg" | "downloading" | "stitching" | "done";

export default function StitchButton({ scenes, scriptTitle }: Props) {
  const [status, setStatus] = useState<StitchStatus>("idle");
  const [progress, setProgress] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ffmpegRef = useRef<any>(null);

  const readyScenes = [...scenes]
    .filter((s) => !!s.video_url)
    .sort((a, b) => a.scene_number - b.scene_number);

  if (readyScenes.length < 2) return null;

  const allScenesReady = readyScenes.length === scenes.length;

  async function stitch() {
    setStatus("loading-ffmpeg");
    setProgress("Loading FFmpeg…");

    try {
      // Lazy-load FFmpeg so the 30 MB WASM isn't fetched until needed
      const { FFmpeg } = await import("@ffmpeg/ffmpeg");
      const { toBlobURL, fetchFile } = await import("@ffmpeg/util");

      if (!ffmpegRef.current) {
        const ffmpeg = new FFmpeg();
        const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
        await ffmpeg.load({
          coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
          wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
        });
        ffmpegRef.current = ffmpeg;
      }

      const ffmpeg = ffmpegRef.current;

      // Download each scene video through our proxy (handles CORS from Fal.AI CDN)
      setStatus("downloading");
      const concatLines: string[] = [];

      for (let i = 0; i < readyScenes.length; i++) {
        const scene = readyScenes[i];
        setProgress(`Downloading scene ${i + 1} of ${readyScenes.length}…`);

        const proxyUrl = `/api/proxy-video?url=${encodeURIComponent(scene.video_url!)}`;
        const data = await fetchFile(proxyUrl);
        const filename = `scene_${String(scene.scene_number).padStart(2, "0")}.mp4`;
        await ffmpeg.writeFile(filename, data);
        concatLines.push(`file '${filename}'`);
      }

      // Write the concat list
      const listContent = concatLines.join("\n");
      await ffmpeg.writeFile("list.txt", listContent);

      setStatus("stitching");
      setProgress("Stitching scenes…");

      // Try stream-copy first (fast, no re-encode) — works when all clips have same codec/res
      let success = false;
      try {
        await ffmpeg.exec([
          "-f", "concat",
          "-safe", "0",
          "-i", "list.txt",
          "-c", "copy",
          "output.mp4",
        ]);
        success = true;
      } catch {
        // Fall back to re-encode if codecs differ
        setProgress("Re-encoding for compatibility…");
        await ffmpeg.exec([
          "-f", "concat",
          "-safe", "0",
          "-i", "list.txt",
          "-c:v", "libx264",
          "-c:a", "aac",
          "-movflags", "+faststart",
          "output.mp4",
        ]);
        success = true;
      }

      if (!success) throw new Error("FFmpeg stitching failed");

      // Read output and trigger download
      const outputData = await ffmpeg.readFile("output.mp4");
      const blob = new Blob([outputData], { type: "video/mp4" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `${scriptTitle.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_full.mp4`;
      a.click();
      URL.revokeObjectURL(url);

      setStatus("done");
      toast.success(`Full video ready! ${readyScenes.length} scenes stitched.`);

      // Reset after a moment so user can re-stitch if needed
      setTimeout(() => { setStatus("idle"); setProgress(""); }, 4000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Stitching failed";
      toast.error(msg);
      setStatus("idle");
      setProgress("");
    }
  }

  const busy = status !== "idle" && status !== "done";

  const label: Record<StitchStatus, string> = {
    "idle":          allScenesReady ? `🎬 Stitch ${readyScenes.length} Scenes → Full Video` : `🎬 Stitch ${readyScenes.length} Ready Scenes`,
    "loading-ffmpeg": "Loading FFmpeg…",
    "downloading":   progress,
    "stitching":     progress,
    "done":          "✓ Downloaded!",
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        size="sm"
        variant="outline"
        className="gap-2 border-violet-500/40 hover:border-violet-400 hover:bg-violet-500/10"
        onClick={stitch}
        disabled={busy}
      >
        {busy && (
          <span className="animate-spin inline-block w-3 h-3 border border-current border-t-transparent rounded-full" />
        )}
        {label[status]}
      </Button>
      {!allScenesReady && status === "idle" && (
        <p className="text-[10px] text-muted-foreground">
          {scenes.length - readyScenes.length} scene{scenes.length - readyScenes.length > 1 ? "s" : ""} still need video generation
        </p>
      )}
    </div>
  );
}
