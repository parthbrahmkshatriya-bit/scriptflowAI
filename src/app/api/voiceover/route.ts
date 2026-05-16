import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  text: z.string().min(1).max(5000),
  sceneId: z.string().uuid(),
});

export async function POST(request: Request) {
  try {
    // Auth
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validate body
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
    const { text } = parsed.data;

    // Plan check
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("plan")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    if (profile.plan === "free") {
      return NextResponse.json(
        {
          error:
            "Voiceover generation requires a Creator or Pro plan. Please upgrade to continue.",
        },
        { status: 403 }
      );
    }

    // Env vars
    const apiKey = process.env.ELEVENLABS_API_KEY;
    const voiceId = process.env.ELEVENLABS_VOICE_ID;
    if (!apiKey || !voiceId) {
      return NextResponse.json(
        { error: "Voiceover service is not configured. Please contact support." },
        { status: 500 }
      );
    }

    // Call ElevenLabs
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
          text,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.3,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!elevenRes.ok) {
      if (elevenRes.status === 429) {
        return NextResponse.json(
          { error: "ElevenLabs quota exceeded. Please try again later." },
          { status: 429 }
        );
      }
      const errText = await elevenRes.text().catch(() => "");
      console.error("[voiceover] ElevenLabs error:", elevenRes.status, errText);
      return NextResponse.json(
        { error: "Voiceover generation failed. Please try again." },
        { status: 502 }
      );
    }

    const buffer = await elevenRes.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");

    return NextResponse.json({ audio: base64, contentType: "audio/mpeg" });
  } catch (err) {
    console.error("[voiceover] Unexpected error:", err);
    return NextResponse.json(
      { error: "Voiceover generation failed. Please try again." },
      { status: 500 }
    );
  }
}
