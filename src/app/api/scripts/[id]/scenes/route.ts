import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const sceneUpdateSchema = z.object({
  id: z.string().uuid(),
  visual_description: z.string().min(1).max(2000),
  camera_direction: z.string().min(1).max(1000),
  voiceover_text: z.string().max(2500).nullable(),
  onscreen_text: z.string().max(200).nullable(),
  ai_generation_prompt: z.string().min(1).max(3000),
});

const bodySchema = z.object({
  scenes: z.array(sceneUpdateSchema).min(1).max(20),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id: scriptId } = await params;

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify the script belongs to this user
    const { data: script } = await supabase
      .from("scripts")
      .select("id")
      .eq("id", scriptId)
      .eq("user_id", user.id)
      .single();

    if (!script) {
      return NextResponse.json({ error: "Script not found" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 422 }
      );
    }

    const admin = createAdminClient();

    // Update each scene — only the editable fields
    const updates = parsed.data.scenes.map((scene) =>
      admin
        .from("scenes")
        .update({
          visual_description: scene.visual_description,
          camera_direction: scene.camera_direction,
          voiceover_text: scene.voiceover_text,
          onscreen_text: scene.onscreen_text,
          ai_generation_prompt: scene.ai_generation_prompt,
        })
        .eq("id", scene.id)
        .eq("script_id", scriptId)
    );

    const results = await Promise.all(updates);
    const failed = results.find((r) => r.error);
    if (failed?.error) {
      console.error("[scenes PATCH] Update error:", failed.error);
      return NextResponse.json({ error: "Failed to save changes" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[scenes PATCH] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
