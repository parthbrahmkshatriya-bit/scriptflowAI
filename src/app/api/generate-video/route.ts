import { NextResponse } from "next/server";
import { fal } from "@fal-ai/client";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { VIDEO_LIMITS } from "@/lib/constants";
import type { Plan } from "@/types/database";

// Veo 3 — generates video WITH audio (narration, SFX) in one prompt
const FAL_MODEL = "fal-ai/veo3";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("[generate-video] Auth failed — authError:", authError?.message ?? "none", "user:", user ? "present" : "null");
      return NextResponse.json({
        error: authError ? `Auth error: ${authError.message}` : "Not authenticated — please log in again",
      }, { status: 401 });
    }

    const apiKey = process.env.FAL_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Video generation not configured" }, { status: 500 });
    }

    const admin = createAdminClient();
    const { data: profile } = await admin
      .from("users")
      .select("plan, videos_used_this_month, video_credits")
      .eq("id", user.id)
      .single();

    const plan = (profile?.plan ?? "free") as Plan;
    const used = ((profile as Record<string, unknown>)?.videos_used_this_month as number) ?? 0;
    const videoCredits = ((profile as Record<string, unknown>)?.video_credits as number) ?? 0;
    const limit = VIDEO_LIMITS[plan] ?? 0;
    const hasMonthlyQuota = used < limit;
    const hasCredits = videoCredits > 0;

    if (limit === 0 && !hasCredits) {
      return NextResponse.json(
        { error: "Video generation is available on Creator plan and above. Upgrade to unlock." },
        { status: 403 }
      );
    }

    if (!hasMonthlyQuota && !hasCredits) {
      return NextResponse.json(
        {
          error: `Monthly limit reached (${limit}/${limit}). Buy credit packs to keep generating.`,
          used,
          limit,
          credits: videoCredits,
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { prompt, aspect_ratio = "9:16", voiceover_text } = body as {
      prompt: string;
      aspect_ratio?: string;
      voiceover_text?: string | null;
    };

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return NextResponse.json({ error: "prompt is required" }, { status: 422 });
    }

    // Build a single Veo 3 prompt that includes both the visual scene and voiceover narration.
    // Veo 3 generates audio natively — narration, ambient sound, SFX — all from one prompt.
    const voiceoverLine = voiceover_text?.trim()
      ? `\n\nNarrator voiceover (spoken clearly): "${voiceover_text.trim()}"`
      : "";

    const finalPrompt = (prompt.trim() + voiceoverLine).slice(0, 2000);

    const veoAspect: "9:16" | "16:9" = aspect_ratio === "16:9" ? "16:9" : "9:16";

    fal.config({ credentials: apiKey });

    // Submit to queue — Veo 3 Fast typically takes 2–4 minutes
    const { request_id } = await fal.queue.submit(FAL_MODEL, {
      input: {
        prompt: finalPrompt,
        aspect_ratio: veoAspect,
      },
    });

    // Use monthly quota first; fall back to purchased credits
    if (hasMonthlyQuota) {
      await admin.from("users").update({ videos_used_this_month: used + 1 }).eq("id", user.id);
    } else {
      await admin.from("users").update({ video_credits: videoCredits - 1 }).eq("id", user.id);
    }

    return NextResponse.json({
      request_id,
      model: FAL_MODEL,
      used: hasMonthlyQuota ? used + 1 : used,
      limit,
      credits_remaining: hasMonthlyQuota ? videoCredits : videoCredits - 1,
      used_credit: !hasMonthlyQuota,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[generate-video] Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
