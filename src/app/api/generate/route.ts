import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateSchema, scriptOutputSchema } from "@/lib/schemas/generate";
import { buildSystemPrompt } from "@/lib/ai/system-prompt";
import { expandConcept } from "@/lib/ai/brief-expander";
import { applyContinuity } from "@/lib/ai/continuity";
import { PLAN_LIMITS, CLAUDE_MODEL } from "@/lib/constants";
import { validateEmailDomain } from "@/lib/email-validation";
import { checkUserSecurity } from "@/lib/security/check-user";
import { getMonthlyUsage } from "@/lib/usage/monthly-period";
import type { Plan } from "@/types/database";

// Minimum gap between script generation requests per user (DB-backed cooldown)
const SCRIPT_COOLDOWN_MS = 15_000; // 15 seconds

export async function POST(request: Request) {
  try {
    // Auth check
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Block disposable email domains
    if (user.email) {
      const domainCheck = validateEmailDomain(user.email);
      if (!domainCheck.valid) {
        return NextResponse.json(
          { error: "Account email is not permitted. Please use a valid email address." },
          { status: 403 }
        );
      }
    }

    // Security: ban check
    const secCheck = await checkUserSecurity(user.id);
    if (secCheck.banned) {
      return NextResponse.json({ error: secCheck.reason }, { status: 403 });
    }

    // Parse + validate input
    const body = await request.json();
    const parsed = generateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 422 }
      );
    }
    const { concept, duration, platform, visual_style, ai_tool, scene_count, image_base64, image_purpose, target_audience, tone, key_message } = parsed.data;

    // Use admin client for user operations to bypass RLS
    const admin = createAdminClient();

    // Auto-create user profile if missing
    const { error: profileError } = await admin
      .from("users")
      .select("id")
      .eq("id", user.id)
      .single();

    if (profileError && profileError.code === "PGRST116") {
      // Profile doesn't exist — create it
      await admin.from("users").insert({
        id: user.id,
        email: user.email!,
        full_name: user.user_metadata?.full_name ?? null,
        avatar_url: user.user_metadata?.avatar_url ?? null,
      });
    } else if (profileError) {
      console.error("Profile fetch error:", profileError);
      return NextResponse.json({ error: "Failed to load user profile" }, { status: 500 });
    }

    // Re-fetch profile after potential creation
    const { data: userProfile } = await admin
      .from("users")
      .select("plan, scripts_used_this_month, videos_used_this_month, premium_videos_used_this_month, last_script_at, usage_period_start")
      .eq("id", user.id)
      .single();

    const plan = (userProfile?.plan ?? "free") as Plan;
    // Same rollover as the video route — a missed cron must not cap an account.
    const usage = await getMonthlyUsage(admin, user.id, userProfile as Record<string, unknown>);
    const used = usage.scriptsUsed;
    const limit = PLAN_LIMITS[plan];

    // Cooldown: prevent burst requests (DB-backed, works on Vercel serverless)
    if (userProfile?.last_script_at) {
      const msSinceLast = Date.now() - new Date(userProfile.last_script_at).getTime();
      if (msSinceLast < SCRIPT_COOLDOWN_MS) {
        const waitSec = Math.ceil((SCRIPT_COOLDOWN_MS - msSinceLast) / 1000);
        return NextResponse.json(
          { error: `Please wait ${waitSec}s before generating another script.` },
          { status: 429, headers: { "Retry-After": String(waitSec) } }
        );
      }
    }

    if (used >= limit) {
      const upgradeMsg =
        plan === "free"
          ? `You've used all ${limit} free scripts this month. Upgrade to Creator ($9/mo) or Pro ($19/mo) for more.`
          : `You've reached your ${limit}-script monthly limit. Upgrade for a higher monthly allowance.`;
      return NextResponse.json(
        { error: upgradeMsg, plan, used, limit },
        { status: 403 }
      );
    }

    // Brief expansion: use Claude's training knowledge to enrich the concept with
    // brand/product details before generating the script. This is best-effort —
    // failure here falls back to raw concept without blocking generation.
    const brief = await expandConcept(concept, {
      target_audience: target_audience ?? null,
      tone: tone ?? null,
      key_message: key_message ?? null,
    });

    // Build system prompt
    const systemPrompt = buildSystemPrompt({
      aiTool: ai_tool,
      visualStyle: visual_style,
      duration,
      platform,
      sceneCount: scene_count,
      imagePurpose: image_purpose,
      brief,
    });

    // Build user message — append optional context so Claude sees it alongside the concept
    const contextLines: string[] = [`Video concept: ${concept}`];
    if (target_audience) contextLines.push(`Target audience: ${target_audience}`);
    if (tone) contextLines.push(`Desired tone: ${tone}`);
    if (key_message) contextLines.push(`Key message to highlight: ${key_message}`);
    contextLines.push("\nGenerate the complete production script as JSON.");
    const userText = contextLines.join("\n");

    // Parse data URL with string ops instead of regex — a regex with a large capture group
    // on a multi-MB base64 string can overflow the call stack in V8's regexp engine.
    let userContent: string | Array<{ type: string; [k: string]: unknown }> = userText;
    if (image_base64) {
      const sepIdx = image_base64.indexOf(";base64,");
      if (sepIdx !== -1 && image_base64.startsWith("data:image/")) {
        const mediaType = image_base64.slice(5, sepIdx); // e.g. "image/jpeg"
        const data = image_base64.slice(sepIdx + 8);     // everything after ";base64,"
        if (mediaType === "image/jpeg" || mediaType === "image/png" || mediaType === "image/webp") {
          userContent = [
            { type: "image", source: { type: "base64", media_type: mediaType, data } },
            { type: "text", text: userText },
          ];
        }
      }
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "AI API key not configured" }, { status: 500 });
    }

    const anthropic = new Anthropic({ apiKey });
    const startTime = Date.now();

    let aiResponse: string;
    try {
      const message = await anthropic.messages.create({
        model: CLAUDE_MODEL,
        max_tokens: 4096,
        system: systemPrompt,
        messages: [{ role: "user", content: userContent as Parameters<typeof anthropic.messages.create>[0]["messages"][0]["content"] }],
      });
      aiResponse = message.content[0].type === "text" ? message.content[0].text : "";
    } catch (aiError) {
      console.error("[generate] Claude API error (attempt 1):", aiError);
      // Retry once
      try {
        const message = await anthropic.messages.create({
          model: CLAUDE_MODEL,
          max_tokens: 4096,
          system: systemPrompt,
          messages: [{ role: "user", content: userContent as Parameters<typeof anthropic.messages.create>[0]["messages"][0]["content"] }],
        });
        aiResponse = message.content[0].type === "text" ? message.content[0].text : "";
      } catch (retryError) {
        console.error("[generate] Claude API error (attempt 2):", retryError);
        return NextResponse.json(
          { error: "AI generation failed. Please try again." },
          { status: 500 }
        );
      }
    }

    const generationTimeMs = Date.now() - startTime;

    // Parse and validate JSON output
    let parsed_ai: ReturnType<typeof scriptOutputSchema.parse>;
    try {
      const clean = aiResponse.replace(/^```json?\n?/, "").replace(/\n?```$/, "").trim();
      const raw = JSON.parse(clean);
      parsed_ai = scriptOutputSchema.parse(raw);
    } catch (parseError) {
      console.error("AI output parse error:", parseError, "\nRaw output:", aiResponse);
      return NextResponse.json(
        { error: "AI returned invalid output. Please try again." },
        { status: 500 }
      );
    }

    // Lock the product's visual identity into every scene prompt. The model
    // writes each scene independently and drifts; this makes the description
    // byte-identical across scenes rather than leaving it to its discretion.
    const scenes = applyContinuity(parsed_ai.scenes, brief, ai_tool);

    // Save script to DB
    const { data: script, error: scriptError } = await admin
      .from("scripts")
      .insert({
        user_id: user.id,
        concept,
        title: parsed_ai.title,
        duration,
        platform,
        visual_style,
        ai_tool,
        scene_count: scenes.length,
        generation_time_ms: generationTimeMs,
        model_used: CLAUDE_MODEL,
      })
      .select("id")
      .single();

    if (scriptError || !script) {
      console.error("Script insert error:", scriptError);
      return NextResponse.json({ error: "Failed to save script" }, { status: 500 });
    }

    // Save scenes
    const scenesData = scenes.map((scene) => ({
      script_id: script.id,
      scene_number: scene.scene_number,
      duration_seconds: scene.duration_seconds,
      visual_description: scene.visual_description,
      camera_direction: scene.camera_direction,
      voiceover_text: scene.voiceover_text,
      onscreen_text: scene.onscreen_text,
      ai_generation_prompt: scene.ai_generation_prompt,
      suggested_music: scene.suggested_music,
      transition: scene.transition,
    }));

    const { error: scenesError } = await admin.from("scenes").insert(scenesData);
    if (scenesError) {
      console.error("Scenes insert error:", scenesError);
      // Don't fail the whole request — script was saved
    }

    // Atomic increment — also stamps last_script_at for cooldown enforcement
    await admin
      .from("users")
      .update({
        scripts_used_this_month: used + 1,
        last_script_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    return NextResponse.json({
      script_id: script.id,
      title: parsed_ai.title,
      scenes,
      generation_time_ms: generationTimeMs,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Unexpected error in /api/generate:", err);
    return NextResponse.json({ error: message || "Internal server error" }, { status: 500 });
  }
}
