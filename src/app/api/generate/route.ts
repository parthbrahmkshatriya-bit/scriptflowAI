import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateSchema, scriptOutputSchema } from "@/lib/schemas/generate";
import { buildSystemPrompt } from "@/lib/ai/system-prompt";
import { PLAN_LIMITS, CLAUDE_MODEL } from "@/lib/constants";
import type { Plan } from "@/types/database";

// Simple in-memory rate limiter (per-process, resets on cold start)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (entry.count >= 5) return false;
  entry.count++;
  return true;
}

export async function POST(request: Request) {
  try {
    // Auth check
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limit: max 5 per minute
    if (!checkRateLimit(user.id)) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a minute." },
        { status: 429 }
      );
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
    const { concept, duration, platform, visual_style, ai_tool } = parsed.data;

    // Use admin client for user operations to bypass RLS
    const admin = createAdminClient();

    // Auto-create user profile if missing
    const { error: profileError } = await admin
      .from("users")
      .select("id")
      .eq("id", user.id)
      .single();

    console.log("[generate] Profile lookup result — error:", profileError?.code ?? "none");
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
      .select("plan, scripts_used_this_month")
      .eq("id", user.id)
      .single();

    const plan = (userProfile?.plan ?? "free") as Plan;
    const used = userProfile?.scripts_used_this_month ?? 0;
    const limit = PLAN_LIMITS[plan];

    if (used >= limit) {
      return NextResponse.json(
        {
          error: "Monthly script limit reached",
          plan,
          used,
          limit,
        },
        { status: 403 }
      );
    }

    // Build prompt and call Claude
    const systemPrompt = buildSystemPrompt({
      aiTool: ai_tool,
      visualStyle: visual_style,
      duration,
      platform,
    });

    const apiKey = process.env.ANTHROPIC_API_KEY;
    console.log("[generate] ANTHROPIC_API_KEY prefix:", apiKey?.slice(0, 10) ?? "MISSING");
    console.log("[generate] Using model:", CLAUDE_MODEL);

    if (!apiKey) {
      return NextResponse.json({ error: "AI API key not configured" }, { status: 500 });
    }

    const anthropic = new Anthropic({ apiKey });

    const startTime = Date.now();

    let aiResponse: string;
    try {
      console.log("[generate] Calling Claude API...");
      const message = await anthropic.messages.create({
        model: CLAUDE_MODEL,
        max_tokens: 4096,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: `Video concept: ${concept}\n\nGenerate the complete production script as JSON.`,
          },
        ],
      });
      console.log("[generate] Claude response received, stop_reason:", message.stop_reason);
      aiResponse = message.content[0].type === "text" ? message.content[0].text : "";
      console.log("[generate] Raw AI response (first 200 chars):", aiResponse.slice(0, 200));
    } catch (aiError) {
      console.error("[generate] Claude API error (attempt 1):", aiError);
      // Retry once
      try {
        const message = await anthropic.messages.create({
          model: CLAUDE_MODEL,
          max_tokens: 4096,
          system: systemPrompt,
          messages: [
            {
              role: "user",
              content: `Video concept: ${concept}\n\nGenerate the complete production script as JSON.`,
            },
          ],
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
      // Strip any accidental markdown code fences
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
        scene_count: parsed_ai.scenes.length,
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
    const scenesData = parsed_ai.scenes.map((scene) => ({
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

    // Increment usage counter
    await admin
      .from("users")
      .update({ scripts_used_this_month: used + 1 })
      .eq("id", user.id);

    return NextResponse.json({
      script_id: script.id,
      title: parsed_ai.title,
      scenes: parsed_ai.scenes,
      generation_time_ms: generationTimeMs,
    });
  } catch (err) {
    console.error("Unexpected error in /api/generate:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
