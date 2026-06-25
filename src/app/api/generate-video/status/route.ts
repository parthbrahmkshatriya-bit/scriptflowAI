import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Queue status/result use base path only (no /text-to-video suffix)
const FAL_QUEUE_BASE = "fal-ai/wan-25-preview";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const requestId = searchParams.get("request_id");
    const sceneId = searchParams.get("scene_id"); // optional — used to persist video_url
    if (!requestId) {
      return NextResponse.json({ error: "request_id is required" }, { status: 422 });
    }

    const apiKey = process.env.NODE_ENV === "production"
      ? process.env.FAL_KEY
      : (process.env.FAL_KEY_TEST ?? process.env.FAL_KEY);
    if (!apiKey) {
      return NextResponse.json({ error: "Video generation not configured" }, { status: 500 });
    }

    // Check status from Fal.AI queue
    const statusRes = await fetch(
      `https://queue.fal.run/${FAL_QUEUE_BASE}/requests/${requestId}/status`,
      { headers: { "Authorization": `Key ${apiKey}` } }
    );

    if (!statusRes.ok) {
      return NextResponse.json({ error: "Failed to check job status" }, { status: 502 });
    }

    const status = await statusRes.json() as {
      status: "IN_QUEUE" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    };

    if (status.status === "COMPLETED") {
      const resultRes = await fetch(
        `https://queue.fal.run/${FAL_QUEUE_BASE}/requests/${requestId}`,
        { headers: { "Authorization": `Key ${apiKey}` } }
      );
      const result = await resultRes.json() as { video?: { url: string } };
      const videoUrl = result.video?.url ?? null;

      // Persist to DB so video survives page refresh
      if (videoUrl && sceneId) {
        const admin = createAdminClient();
        await admin
          .from("scenes")
          .update({ video_url: videoUrl })
          .eq("id", sceneId)
          .eq("script_id", (
            await admin.from("scenes").select("script_id").eq("id", sceneId).single()
          ).data?.script_id ?? "");
      }

      return NextResponse.json({ status: "COMPLETED", video_url: videoUrl });
    }

    if (status.status === "FAILED") {
      return NextResponse.json({ status: "FAILED", error: "Video generation failed" });
    }

    return NextResponse.json({ status: status.status });
  } catch (err) {
    console.error("[generate-video/status] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
