import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { VIDEO_LIMITS } from "@/lib/constants";
import type { Plan } from "@/types/database";

// Kling 2.0 via Fal.AI queue — supports 5s or 10s clips
const FAL_MODEL = "fal-ai/kling-video/v2/master/text-to-video";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const apiKey = process.env.NODE_ENV === "production"
      ? process.env.FAL_KEY
      : (process.env.FAL_KEY_TEST ?? process.env.FAL_KEY);
    if (!apiKey) {
      return NextResponse.json({ error: "Video generation not configured" }, { status: 500 });
    }

    const admin = createAdminClient();
    const { data: profile } = await admin
      .from("users")
      .select("plan, videos_used_this_month")
      .eq("id", user.id)
      .single();

    const plan = (profile?.plan ?? "free") as Plan;
    const used = profile?.videos_used_this_month ?? 0;
    const limit = VIDEO_LIMITS[plan] ?? 0;

    if (limit === 0) {
      return NextResponse.json(
        { error: "Video generation is available on Creator plan and above. Upgrade to unlock." },
        { status: 403 }
      );
    }

    if (used >= limit) {
      return NextResponse.json(
        { error: `You've used all ${limit} video generations this month. Upgrade for more.`, used, limit },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { prompt, aspect_ratio = "9:16", duration_seconds } = body as {
      prompt: string;
      aspect_ratio?: string;
      duration_seconds?: number;
    };

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return NextResponse.json({ error: "prompt is required" }, { status: 422 });
    }

    // Clamp prompt to 2000 chars (Kling limit)
    const finalPrompt = prompt.trim().slice(0, 2000);

    // Kling 2.0 only supports "5" or "10" — pick based on scene duration
    const klingDuration: "5" | "10" = (duration_seconds ?? 5) > 5 ? "10" : "5";

    // Submit to Fal.AI queue — returns immediately with a request_id
    const submitRes = await fetch(`https://queue.fal.run/${FAL_MODEL}`, {
      method: "POST",
      headers: {
        "Authorization": `Key ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: finalPrompt,
        duration: klingDuration,
        aspect_ratio,
      }),
    });

    if (!submitRes.ok) {
      const errText = await submitRes.text().catch(() => "unknown");
      console.error("[generate-video] Fal.AI submit error:", submitRes.status, errText);
      return NextResponse.json({ error: "Failed to submit video generation job" }, { status: 502 });
    }

    const { request_id } = await submitRes.json() as { request_id: string };

    await admin
      .from("users")
      .update({ videos_used_this_month: used + 1 })
      .eq("id", user.id);

    return NextResponse.json({ request_id, model: FAL_MODEL, used: used + 1, limit });
  } catch (err) {
    console.error("[generate-video] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
