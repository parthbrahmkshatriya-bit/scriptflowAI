import { NextResponse } from "next/server";
import { fal } from "@fal-ai/client";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { VIDEO_LIMITS } from "@/lib/constants";
import { checkUserSecurity, checkVideoRateLimit } from "@/lib/security/check-user";
import type { Plan } from "@/types/database";

import {
  resolveModel,
  fitDuration,
  formatDuration,
  estimateCostUsd,
} from "@/lib/video/models";
import {
  detectVoiceProfile,
  estimateSpeechSeconds,
  buildVoiceDirection,
} from "@/lib/video/voice";

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

    // Security: ban check + rate limit before any DB writes
    const [secCheck, rateCheck] = await Promise.all([
      checkUserSecurity(user.id),
      checkVideoRateLimit(user.id),
    ]);
    if (secCheck.banned) {
      return NextResponse.json({ error: secCheck.reason }, { status: 403 });
    }
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `Too many video requests. Please wait ${rateCheck.retryAfterSeconds}s before generating again.` },
        { status: 429, headers: { "Retry-After": String(rateCheck.retryAfterSeconds) } }
      );
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

    const body = await request.json() as {
      ai_generation_prompt?: string | null;
      visual_description?: string;
      camera_direction?: string;
      voiceover_text?: string | null;
      onscreen_text?: string | null;
      suggested_music?: string | null;
      duration_seconds?: number;
      aspect_ratio?: string;
      model?: "fast" | "pro";
      image_url?: string | null;
    };

    const {
      ai_generation_prompt,
      visual_description,
      camera_direction,
      voiceover_text,
      onscreen_text,
      suggested_music,
      duration_seconds = 5,
      aspect_ratio = "9:16",
      model = "pro",
      image_url,
    } = body;

    if (!visual_description?.trim() && !ai_generation_prompt?.trim()) {
      return NextResponse.json({ error: "visual_description is required" }, { status: 422 });
    }

    const hasImage = !!image_url?.trim();
    const isFast = !hasImage && model === "fast";

    // Resolve endpoint + duration from the registry. Each endpoint accepts only
    // a fixed set of durations (Veo 3.1: 4/6/8s, Kling: 5/10s) and rejects
    // anything else, so the request duration must be snapped before submitting.
    const videoModel = resolveModel({ tier: isFast ? "draft" : "pro", hasImage });
    const FAL_MODEL = videoModel.endpoint;

    // Size the clip to the narration. A clip shorter than the voiceover gets
    // cut off mid-sentence, which is what makes a generated ad look unfinished.
    const voiceProfile = detectVoiceProfile(voiceover_text);
    const speechSeconds = estimateSpeechSeconds(voiceover_text, voiceProfile);
    const { seconds: renderSeconds, truncated: speechOverflows } = fitDuration(
      videoModel,
      duration_seconds,
      speechSeconds
    );
    if (speechOverflows) {
      console.warn(
        `[generate-video] narration needs ~${speechSeconds.toFixed(1)}s but ${videoModel.key} caps at ${renderSeconds}s — it will be clipped. user=${user.id}`
      );
    }
    const durationParam = formatDuration(videoModel, renderSeconds);
    const estimatedCostUsd = estimateCostUsd(videoModel, renderSeconds);
    const veoAspect: "9:16" | "16:9" = aspect_ratio === "16:9" ? "16:9" : "9:16";

    let finalPrompt: string;

    if (hasImage) {
      // Image-to-video (Kling): build a concise visual motion prompt.
      // The image itself provides product identity — prompt guides motion and camera.
      const parts: string[] = [];
      const visual = [visual_description?.trim(), camera_direction?.trim()].filter(Boolean).join(". ");
      if (visual) parts.push(visual);
      if (onscreen_text?.trim()) parts.push(`Text overlay: "${onscreen_text.trim()}"`);
      parts.push("Professional product advertisement. Smooth cinematic motion. 9:16 vertical format. Photorealistic quality.");
      finalPrompt = parts.join(" ").slice(0, 1500);
    } else if (!isFast && ai_generation_prompt?.trim()) {
      // VEO 3 (Pro): use Claude's rich, pre-crafted VEO 3 prompt directly — it already contains
      // the visual scene, camera work, voiceover embedded, and quality directives.
      //
      // For non-English narration, restate the accent explicitly. Scripts saved
      // before the language directive was added to the system prompt carry no
      // accent instruction, and Veo defaults to an English-accented read of the
      // local language — which is what a native speaker hears as wrong.
      const accentOverride =
        voiceProfile.code !== "en"
          ? `\n\nNarration language: ${voiceProfile.name}. The voice must be ${voiceProfile.accent}. Deliver every word within the clip length — do not trail off or cut short.`
          : "";

      finalPrompt = (
        ai_generation_prompt.trim() +
        accentOverride +
        "\n\nQuality: Photorealistic, cinematic color grading, ultra-sharp, professional production quality, smooth motion, no compression artifacts."
      ).slice(0, 3000);
    } else {
      // OVI (Fast) or fallback: build a clean visual prompt from parts.
      const parts: string[] = [];
      const visual = [visual_description?.trim(), camera_direction?.trim()].filter(Boolean).join(". ");
      parts.push(`${visual}. Vertical 9:16 format, sharp and cinematic.`);

      if (!isFast) {
        const hasVoiceover = !!voiceover_text?.trim();
        if (hasVoiceover) {
          parts.push(buildVoiceDirection(voiceover_text!.trim()));
        }
        if (onscreen_text?.trim()) {
          parts.push(`On-screen text overlay reads: "${onscreen_text.trim()}"`);
        }
        if (suggested_music?.trim()) {
          parts.push(
            hasVoiceover
              ? `Background music: ${suggested_music.trim()}. Keep subtle and low in the mix so the voiceover sits prominently above it.`
              : `Background audio: ${suggested_music.trim()}.`
          );
        }
        parts.push("Photorealistic, cinematic color grading, ultra-sharp, professional production quality, smooth motion.");
      }

      finalPrompt = parts.join("\n\n").slice(0, 3000);
    }

    fal.config({ credentials: apiKey });

    let request_id: string;
    try {
      let input: Record<string, unknown>;
      if (hasImage) {
        input = {
          image_url: image_url!.trim(),
          prompt: finalPrompt,
          duration: durationParam,
          aspect_ratio: veoAspect,
        };
      } else {
        // Veo 3.1 (both tiers): duration is an enum string ("4s"|"6s"|"8s"),
        // resolution is pinned so a change to fal's default can't silently
        // raise cost, and audio is generated in the same pass as the video.
        input = {
          prompt: finalPrompt,
          aspect_ratio: veoAspect,
          duration: durationParam,
          resolution: videoModel.resolution,
          generate_audio: true,
        };
      }

      console.info(
        `[generate-video] model=${videoModel.key} duration=${renderSeconds}s est_cost=$${estimatedCostUsd.toFixed(3)} user=${user.id}`
      );

      const result = await fal.queue.submit(FAL_MODEL, { input });
      request_id = result.request_id;
    } catch (falErr) {
      const falMsg = falErr instanceof Error ? falErr.message : String(falErr);
      console.error("[generate-video] Fal.AI submission failed:", falMsg);
      const lower = falMsg.toLowerCase();
      const isAuthErr = lower.includes("unauthorized") || falMsg.includes("401");
      const isForbidden = lower.includes("forbidden") || falMsg.includes("403");
      // Log full detail server-side; never expose internal config hints to the user
      console.error("[generate-video] fal.ai error detail:", falMsg);
      return NextResponse.json(
        {
          error: isAuthErr || isForbidden
            ? "Video generation is temporarily unavailable. Please try again later or contact support."
            : "Video generation failed. Please try again in a moment.",
        },
        { status: 500 }
      );
    }

    // Use monthly quota first; fall back to purchased credits.
    //
    // Both writes carry an optimistic-concurrency guard on the value we read
    // earlier. Without it two simultaneous requests both read the same balance
    // and both write the same decrement, so one render is never paid for.
    // A guard miss means a concurrent request already moved the counter.
    if (hasMonthlyQuota) {
      const { data: bumped } = await admin
        .from("users")
        .update({ videos_used_this_month: used + 1 })
        .eq("id", user.id)
        .eq("videos_used_this_month", used)
        .select("id");
      if (!bumped?.length) {
        console.warn(`[generate-video] quota guard miss — concurrent request for user=${user.id}`);
      }
    } else {
      const { data: debited } = await admin
        .from("users")
        .update({ video_credits: videoCredits - 1 })
        .eq("id", user.id)
        .eq("video_credits", videoCredits)
        .select("id");
      if (!debited?.length) {
        console.warn(`[generate-video] credit guard miss — concurrent request for user=${user.id}`);
      }
    }

    const creditsRemaining = hasMonthlyQuota ? videoCredits : videoCredits - 1;
    const monthlyRemaining = hasMonthlyQuota ? limit - used - 1 : 0;

    return NextResponse.json({
      request_id,
      model: FAL_MODEL,
      model_type: hasImage ? "image" : isFast ? "fast" : "pro",
      // Endpoints accept only fixed durations, so this may differ from the
      // scene's scripted length — the UI should show what actually renders.
      duration_seconds: renderSeconds,
      used: hasMonthlyQuota ? used + 1 : used,
      limit,
      credits_remaining: creditsRemaining,
      monthly_remaining: monthlyRemaining,
      total_remaining: monthlyRemaining + creditsRemaining,
      used_credit: !hasMonthlyQuota,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[generate-video] Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
