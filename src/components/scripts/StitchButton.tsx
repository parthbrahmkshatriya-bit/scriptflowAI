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

  // Show once at least one scene has a video
  if (readyScenes.length < 1) return null;

  const allScenesReady = readyScenes.length === scenes.length;
  const safeName = scriptTitle.replace(/[^a-z0-9]/gi, "_").toLowerCase();

  async function exportSingle() {
    const scene = readyScenes[0];
    setStatus("downloading");
    setProgress("Downloading scene…");
    try {
      const proxyUrl = `/api/proxy-video?url=${encodeURIComponent(scene.video_url!)}`;
      const res = await fetch(proxyUrl);
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${safeName}_scene_${scene.scene_number}.mp4`;
      a.click();
      URL.revokeObjectURL(url);
      setStatus("done");
      toast.success("Video downloaded!");
      setTimeout(() => { setStatus("idle"); setProgress(""); }, 3000);
    } catch {
      toast.error("Download failed — please try again.");
      setStatus("idle");
      setProgress("");
    }
  }

  async function stitch() {
    // Single scene: skip FFmpeg entirely, just proxy-download
    if (readyScenes.length === 1) {
      await exportSingle();
      return;
    }

    setStatus("loading-ffmpeg");
    setProgress("Loading FFmpeg…");

    try {
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

      setStatus("downloading");
      const concatLines: string[] = [];
      const writtenFiles: string[] = [];

      for (let i = 0; i < readyScenes.length; i++) {
        const scene = readyScenes[i];
        setProgress(`Downloading scene ${i + 1} of ${readyScenes.length}…`);
        const proxyUrl = `/api/proxy-video?url=${encodeURIComponent(scene.video_url!)}`;
        const data = await fetchFile(proxyUrl);
        const filename = `scene_${String(scene.scene_number).padStart(2, "0")}.mp4`;
        await ffmpeg.writeFile(filename, data);
        concatLines.push(`file '${filename}'`);
        writtenFiles.push(filename);
      }

      await ffmpeg.writeFile("list.txt", concatLines.join("\n"));

      setStatus("stitching");
      setProgress("Stitching scenes…");

      // Try stream-copy first; fall back to re-encode if codecs differ
      try {
        await ffmpeg.exec(["-f", "concat", "-safe", "0", "-i", "list.txt", "-c", "copy", "output.mp4"]);
      } catch {
        setProgress("Re-encoding for compatibility…");
        await ffmpeg.exec([
          "-f", "concat", "-safe", "0", "-i", "list.txt",
          "-c:v", "libx264", "-c:a", "aac", "-movflags", "+faststart",
          "output.mp4",
        ]);
      }

      // Free individual scene files from WASM memory before reading output
      for (const f of writtenFiles) {
        try { await ffmpeg.deleteFile(f); } catch { /* ignore */ }
      }
      try { await ffmpeg.deleteFile("list.txt"); } catch { /* ignore */ }

      const outputData = await ffmpeg.readFile("output.mp4");
      const blob = new Blob([outputData], { type: "video/mp4" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `${safeName}_full.mp4`;
      a.click();
      URL.revokeObjectURL(url);

      setStatus("done");
      toast.success(`Full video ready — ${readyScenes.length} scenes stitched.`);
      setTimeout(() => { setStatus("idle"); setProgress(""); }, 4000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Stitching failed";
      toast.error(msg);
      setStatus("idle");
      setProgress("");
    }
  }

  const busy = status !== "idle" && status !== "done";

  function buttonLabel() {
    if (status === "done") return "✓ Downloaded!";
    if (busy) return progress || "Working…";
    if (readyScenes.length === 1) return "⬇ Export Scene → MP4";
    if (allScenesReady) return `🎬 Stitch ${readyScenes.length} Scenes → MP4`;
    return `🎬 Stitch ${readyScenes.length} Ready Scenes → MP4`;
  }

  const downloadStep = status === "downloading"
    ? progress.match(/(\d+) of (\d+)/)
    : null;
  const downloadPct = downloadStep
    ? Math.round((parseInt(downloadStep[1]) / parseInt(downloadStep[2])) * 100)
    : null;

  return (
    <div className="flex flex-col items-end gap-1.5 min-w-[200px]">
      <Button
        size="sm"
        variant="outline"
        className="w-full gap-2 border-violet-500/40 hover:border-violet-400 hover:bg-violet-500/10"
        onClick={stitch}
        disabled={busy}
      >
        {busy && (
          <span className="animate-spin inline-block w-3 h-3 border border-current border-t-transparent rounded-full" />
        )}
        {buttonLabel()}
      </Button>

      {/* Progress bar during multi-scene stitch */}
      {busy && (
        <div className="w-full space-y-1">
          <div className="h-1 w-full rounded-full overflow-hidden bg-violet-900/40">
            {downloadPct !== null ? (
              <div
                className="h-full bg-violet-500 rounded-full transition-all duration-300"
                style={{ width: `${downloadPct}%` }}
              />
            ) : (
              <div
                className="h-full w-full"
                style={{
                  background: "linear-gradient(90deg, transparent 0%, #7c3aed 50%, transparent 100%)",
                  backgroundSize: "200% 100%",
                  animation: "shimmer-sweep 1.8s linear infinite",
                }}
              />
            )}
          </div>
          <p className="text-[10px] text-muted-foreground text-right">{progress}</p>
        </div>
      )}

      {/* Status when not all scenes have videos */}
      {!allScenesReady && status === "idle" && scenes.length > 1 && (
        <p className="text-[10px] text-muted-foreground text-right">
          {readyScenes.length}/{scenes.length} scenes ready ·{" "}
          {scenes.length - readyScenes.length} still need video
        </p>
      )}
    </div>
  );
}
