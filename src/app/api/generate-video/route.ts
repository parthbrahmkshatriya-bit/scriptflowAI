import { NextResponse } from "next/server";
import { fal } from "@fal-ai/client";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { VIDEO_LIMITS, PLAN_VIDEO_CREDITS } from "@/lib/constants";
import { checkUserSecurity, checkVideoRateLimit } from "@/lib/security/check-user";
import { getMonthlyUsage } from "@/lib/usage/monthly-period";
import type { Plan } from "@/types/database";

import {
  resolveModel,
  fitDuration,
  formatDuration,
  estimateCostUsd,
  creditsFor,
} from "@/lib/video/models";
import { spendCredits, refundCredits, grantPlanCredits } from "@/lib/credits/credits";
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
      .select("plan, videos_used_this_month, premium_videos_used_this_month, video_credits, credit_balance, scripts_used_this_month, usage_period_start")
      .eq("id", user.id)
      .single();

    const plan = (profile?.plan ?? "free") as Plan;
    const videoCredits = ((profile as Record<string, unknown>)?.video_credits as number) ?? 0;

    // Roll the usage period over if these counters belong to an earlier month,
    // so a missed cron run cannot leave an account permanently capped.
    const usage = await getMonthlyUsage(admin, user.id, profile as Record<string, unknown>);
    const used = usage.videosUsed;
    const limit = VIDEO_LIMITS[plan] ?? 0;

    // A new period grants this plan's credit allowance. Plan credits replace the
    // previous grant so they expire; purchased credits survive.
    let creditBalance = ((profile as Record<string, unknown>)?.credit_balance as number) ?? 0;
    if (usage.rolledOver) {
      const granted = await grantPlanCredits(admin, user.id, plan);
      if (typeof granted === "number" && granted >= 0) creditBalance = granted;
    }

    if ((PLAN_VIDEO_CREDITS[plan] ?? 0) === 0 && creditBalance <= 0 && videoCredits <= 0) {
      return NextResponse.json(
        { error: "Video generation is available on Creator plan and above. Upgrade to unlock." },
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
      hd?: boolean;
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
      hd = false,
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
    const {
      model: videoModel,
      downgraded: modelDowngraded,
      usedPremium,
      resolution: renderResolution,
    } = resolveModel({
      tier: isFast ? "draft" : "pro",
      hasImage,
      plan,
      hd,
    });
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
    const estimatedCostUsd = estimateCostUsd(videoModel, renderSeconds, renderResolution);
    const creditCost = creditsFor(videoModel, renderSeconds, renderResolution);
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

    // Charge before submitting. Deducting first makes concurrent renders unable
    // to draw on the same balance, and a submission failure is refunded below —
    // the previous order charged on submit and never gave anything back.
    // Identify the charge before it happens. The fal request id only exists
    // after a successful submit, so a locally generated reference is what makes
    // the refund below addressable — and makes the spend idempotent on retry.
    const spendRef = crypto.randomUUID();
    const spend = await spendCredits(admin, {
      userId: user.id,
      amount: creditCost,
      jobId: spendRef,
      modelKey: videoModel.key,
      seconds: renderSeconds,
      resolution: renderResolution ?? null,
    });

    if (!spend.ok && !spend.unavailable) {
      return NextResponse.json(
        {
          error: `Not enough credits — this render costs ${creditCost} and you have ${creditBalance} left.`,
          credits_required: creditCost,
          credits_remaining: creditBalance,
        },
        { status: 403 }
      );
    }
    if (!spend.unavailable) creditBalance = spend.balance;

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
          resolution: renderResolution ?? videoModel.resolution,
          generate_audio: true,
        };
      }

      console.info(
        `[generate-video] model=${videoModel.key} duration=${renderSeconds}s ` +
        `res=${renderResolution ?? videoModel.resolution ?? "n/a"} plan=${plan} ` +
        `est_cost=$${estimatedCostUsd.toFixed(3)} user=${user.id}`
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

      // The charge happened before submission, so give it back. Nothing was
      // rendered and the user must not pay for a job that never started.
      if (!spend.unavailable) {
        await refundCredits(admin, user.id, spendRef, "fal submission failed");
      }

      return NextResponse.json(
        {
          error: isAuthErr || isForbidden
            ? "Video generation is temporarily unavailable. Please try again later or contact support."
            : "Video generation failed. Please try again in a moment.",
        },
        { status: 500 }
      );
    }

    // Credits were already charged above. This counter is kept only so the
    // existing "videos this month" display keeps working; it no longer gates
    // anything, because the credit balance does.
    await admin
      .from("users")
      .update({ videos_used_this_month: used + 1 })
      .eq("id", user.id)
      .eq("videos_used_this_month", used);

    const monthlyRemaining = Math.max(0, limit - used - 1);

    return NextResponse.json({
      request_id,
      model: FAL_MODEL,
      model_type: hasImage ? "image" : videoModel.key === "veo31_fast" ? "pro" : "fast",
      // True when the plan asked for the pro model without entitlement, so the
      // UI can say why the render used the draft model instead.
      model_downgraded: modelDowngraded,
      used_premium: usedPremium,
      credits_charged: creditCost,
      credit_balance: creditBalance,
      spend_ref: spendRef,
      resolution: renderResolution ?? videoModel.resolution ?? null,
      // Endpoints accept only fixed durations, so this may differ from the
      // scene's scripted length — the UI should show what actually renders.
      duration_seconds: renderSeconds,
      used: used + 1,
      limit,
      monthly_remaining: monthlyRemaining,
      // Kept for the existing "videos left" display; credit_balance above is
      // the figure that actually governs whether another render can run.
      total_remaining: monthlyRemaining,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[generate-video] Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
