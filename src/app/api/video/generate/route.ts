import { NextResponse } from "next/server";
import { z } from "zod";
import { fal } from "@fal-ai/client";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 120;

const schema = z.object({
  sceneId: z.string().uuid(),
  prompt: z.string().min(1).max(2000),
});

interface KlingOutput {
  video: { url: string };
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const parsed = schema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 422 }
      );
    }
    const { sceneId, prompt } = parsed.data;

    // Plan check — free and creator cannot access video generation
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("plan")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    if (profile.plan === "free" || profile.plan === "creator") {
      return NextResponse.json(
        { error: "Video generation requires a Pro plan. Please upgrade to continue." },
        { status: 403 }
      );
    }

    const falKey = process.env.FAL_KEY;
    if (!falKey) {
      return NextResponse.json(
        { error: "Video service is not configured. Please contact support." },
        { status: 500 }
      );
    }

    fal.config({ credentials: falKey });

    // Insert generation record as pending
    const { data: generation, error: insertError } = await supabase
      .from("video_generations")
      .insert({
        user_id: user.id,
        scene_id: sceneId,
        tool: "kling",
        status: "pending",
        credits_used: 1,
      })
      .select("id")
      .single();

    if (insertError || !generation) {
      console.error("[video] Failed to insert generation record:", insertError);
      return NextResponse.json({ error: "Failed to start generation." }, { status: 500 });
    }

    const generationId = generation.id as string;

    await supabase
      .from("video_generations")
      .update({ status: "processing" })
      .eq("id", generationId);

    // Call fal.ai with 120s timeout via Promise.race
    const falPromise = fal.subscribe("fal-ai/kling-video/v2/master/text-to-video", {
      input: {
        prompt,
        duration: "5",
        aspect_ratio: "9:16",
      },
      logs: true,
      onQueueUpdate: (update) => {
        console.log("[video] Kling status:", update.status);
      },
    }) as Promise<{ data: KlingOutput; requestId: string }>;

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), 120_000)
    );

    let result: { data: KlingOutput; requestId: string };
    try {
      result = await Promise.race([falPromise, timeoutPromise]);
    } catch (err) {
      const isTimeout = err instanceof Error && err.message === "timeout";
      await supabase
        .from("video_generations")
        .update({ status: "failed" })
        .eq("id", generationId);
      return NextResponse.json(
        {
          error: isTimeout
            ? "Generation timed out. Please try again."
            : "Video generation failed. Please try again.",
        },
        { status: isTimeout ? 504 : 502 }
      );
    }

    const videoUrl = result?.data?.video?.url;
    if (!videoUrl) {
      await supabase
        .from("video_generations")
        .update({ status: "failed" })
        .eq("id", generationId);
      return NextResponse.json(
        { error: "Video generation failed. Please try again." },
        { status: 502 }
      );
    }

    await supabase
      .from("video_generations")
      .update({ status: "completed", video_url: videoUrl, fal_request_id: result.requestId })
      .eq("id", generationId);

    return NextResponse.json({ videoUrl, generationId });
  } catch (err) {
    console.error("[video] Unexpected error:", err);
    return NextResponse.json(
      { error: "Video generation failed. Please try again." },
      { status: 500 }
    );
  }
}
