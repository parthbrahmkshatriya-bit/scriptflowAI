import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Plan } from "@/types/database";

const PAID_PLANS: Plan[] = ["creator", "studio", "agency", "pro"];

// ElevenLabs voice ID — Rachel (natural, clear, works well for narration)
const DEFAULT_VOICE_ID = "21m00Tcm4TlvDq8ikWAM";

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

    // Check plan — voiceover is Creator+ only
    const admin = createAdminClient();
    const { data: profile } = await admin
      .from("users")
      .select("plan")
      .eq("id", user.id)
      .single();

    const plan = (profile?.plan ?? "free") as Plan;
    if (!PAID_PLANS.includes(plan)) {
      return NextResponse.json(
        { error: "Voiceover generation is available on Creator plan and above. Upgrade to unlock." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { text, voice_id } = body as { text: string; voice_id?: string };

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json({ error: "text is required" }, { status: 422 });
    }

    if (text.length > 2500) {
      return NextResponse.json(
        { error: "Text exceeds 2500 character limit" },
        { status: 422 }
      );
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Voiceover service not configured" },
        { status: 500 }
      );
    }

    const voiceId = voice_id ?? DEFAULT_VOICE_ID;

    const elevenRes = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text: text.trim(),
          model_id: "eleven_turbo_v2_5",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      }
    );

    if (!elevenRes.ok) {
      const errText = await elevenRes.text().catch(() => "unknown error");
      console.error("[voiceover] ElevenLabs error:", elevenRes.status, errText);
      return NextResponse.json(
        { error: "Voiceover generation failed. Please try again." },
        { status: 502 }
      );
    }

    const audioBuffer = await elevenRes.arrayBuffer();

    return new Response(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Disposition": "inline; filename=voiceover.mp3",
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[voiceover] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
