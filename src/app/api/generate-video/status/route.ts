import { NextResponse } from "next/server";
import { fal } from "@fal-ai/client";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

import { VIDEO_MODELS } from "@/lib/video/models";

// Status must poll the SAME endpoint the job was submitted to. The client
// echoes back model_id from the submit response, which is authoritative; these
// are only a fallback for older in-flight jobs that predate that field.
const FAL_MODEL_PRO = VIDEO_MODELS.veo31_fast.endpoint;
const FAL_MODEL_FAST = VIDEO_MODELS.veo31_lite.endpoint;
const FAL_MODEL_IMAGE = VIDEO_MODELS.kling_i2v.endpoint;

type VideoResult = Record<string, unknown> & {
  video?: { url: string };
  videos?: Array<{ url: string }>;
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const requestId = searchParams.get("request_id");
    const sceneId = searchParams.get("scene_id");
    const modelParam = searchParams.get("model") as "fast" | "pro" | "image" | null;
    const modelId = searchParams.get("model_id"); // full fal.ai model path, takes priority
    if (!requestId) {
      return NextResponse.json({ error: "request_id is required" }, { status: 422 });
    }

    const apiKey = process.env.FAL_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Video generation not configured" }, { status: 500 });
    }

    fal.config({ credentials: apiKey });

    const FAL_MODEL = modelId
      ?? (modelParam === "fast" ? FAL_MODEL_FAST : modelParam === "image" ? FAL_MODEL_IMAGE : FAL_MODEL_PRO);
    const queueStatus = await fal.queue.status(FAL_MODEL, { requestId, logs: false });
    const statusStr = (queueStatus as { status: string }).status;

    if (statusStr === "COMPLETED") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await fal.queue.result<any>(FAL_MODEL, { requestId });
      const data = result.data as VideoResult | undefined;
      const videoUrl = data?.video?.url ?? data?.videos?.[0]?.url ?? null;

      if (videoUrl && sceneId) {
        const admin = createAdminClient();
        await admin.from("scenes").update({ video_url: videoUrl }).eq("id", sceneId);
      }

      return NextResponse.json({ status: "COMPLETED", video_url: videoUrl });
    }

    if (statusStr === "FAILED") {
      return NextResponse.json({ status: "FAILED", error: "Video generation failed on Fal.AI" });
    }

    // IN_QUEUE or IN_PROGRESS
    return NextResponse.json({ status: statusStr });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[generate-video/status] Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
