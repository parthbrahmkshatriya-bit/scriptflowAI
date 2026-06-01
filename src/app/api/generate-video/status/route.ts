import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const FAL_MODEL = "fal-ai/wan/v2.5/text-to-video";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const requestId = searchParams.get("request_id");
    if (!requestId) {
      return NextResponse.json({ error: "request_id is required" }, { status: 422 });
    }

    const apiKey = process.env.FAL_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Video generation not configured" }, { status: 500 });
    }

    // Check status from Fal.AI queue
    const statusRes = await fetch(
      `https://queue.fal.run/${FAL_MODEL}/requests/${requestId}/status`,
      { headers: { "Authorization": `Key ${apiKey}` } }
    );

    if (!statusRes.ok) {
      return NextResponse.json({ error: "Failed to check job status" }, { status: 502 });
    }

    const status = await statusRes.json() as {
      status: "IN_QUEUE" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
      logs?: Array<{ message: string }>;
    };

    if (status.status === "COMPLETED") {
      // Fetch the result
      const resultRes = await fetch(
        `https://queue.fal.run/${FAL_MODEL}/requests/${requestId}`,
        { headers: { "Authorization": `Key ${apiKey}` } }
      );
      const result = await resultRes.json() as { video?: { url: string } };
      return NextResponse.json({ status: "COMPLETED", video_url: result.video?.url });
    }

    if (status.status === "FAILED") {
      return NextResponse.json({ status: "FAILED", error: "Video generation failed" });
    }

    // IN_QUEUE or IN_PROGRESS
    return NextResponse.json({ status: status.status });
  } catch (err) {
    console.error("[generate-video/status] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
