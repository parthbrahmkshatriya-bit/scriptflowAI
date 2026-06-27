import { NextResponse } from "next/server";
import { fal } from "@fal-ai/client";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { VIDEO_LIMITS } from "@/lib/constants";
import type { Plan } from "@/types/database";

const FAL_MODEL = "fal-ai/kling-video/v2/master/text-to-video";
const ELEVENLABS_VOICE_ID = "21m00Tcm4TlvDq8ikWAM"; // Rachel — clear, natural narration

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
    const used = ((profile as Record<string, unknown>)?.videos_used_this_month as number) ?? 0;
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
    const { prompt, aspect_ratio = "9:16", duration_seconds, voiceover_text } = body as {
      prompt: string;
      aspect_ratio?: string;
      duration_seconds?: number;
      voiceover_text?: string | null;
    };

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return NextResponse.json({ error: "prompt is required" }, { status: 422 });
    }

    const finalPrompt = prompt.trim().slice(0, 2000);
    const klingDuration: "5" | "10" = (duration_seconds ?? 5) > 5 ? "10" : "5";
    const klingAspect = (["9:16", "16:9", "1:1"].includes(aspect_ratio)
      ? aspect_ratio
      : "9:16") as "9:16" | "16:9" | "1:1";

    fal.config({ credentials: apiKey });

    // Submit video to Kling queue (returns immediately with request_id)
    const { request_id } = await fal.queue.submit(FAL_MODEL, {
      input: {
        prompt: finalPrompt,
        duration: klingDuration,
        aspect_ratio: klingAspect,
      },
    });

    // Generate voiceover audio via ElevenLabs in parallel (fast, ~3–5s)
    let audioUrl: string | null = null;
    const elevenKey = process.env.ELEVENLABS_API_KEY;
    if (voiceover_text?.trim() && elevenKey) {
      try {
        const audioRes = await fetch(
          `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`,
          {
            method: "POST",
            headers: {
              "xi-api-key": elevenKey,
              "Content-Type": "application/json",
              "Accept": "audio/mpeg",
            },
            body: JSON.stringify({
              text: voiceover_text.trim(),
              model_id: "eleven_turbo_v2_5",
              voice_settings: { stability: 0.5, similarity_boost: 0.75 },
            }),
          }
        );
        if (audioRes.ok) {
          const buffer = await audioRes.arrayBuffer();
          const base64 = Buffer.from(buffer).toString("base64");
          audioUrl = `data:audio/mpeg;base64,${base64}`;
        } else {
          console.warn("[generate-video] ElevenLabs failed:", audioRes.status);
        }
      } catch (err) {
        // Non-fatal — video still generates without audio
        console.warn("[generate-video] ElevenLabs error:", err);
      }
    }

    await admin
      .from("users")
      .update({ videos_used_this_month: used + 1 })
      .eq("id", user.id);

    return NextResponse.json({ request_id, audio_url: audioUrl, model: FAL_MODEL, used: used + 1, limit });
  } catch (err) {
    console.error("[generate-video] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
