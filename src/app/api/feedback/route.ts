import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json() as {
    script_id?: string;
    scene_id?: string | null;
    type?: string;
    rating?: number;
    comment?: string;
  };

  const { script_id, scene_id, type, rating, comment } = body;

  if (!script_id || !type || ![-1, 1].includes(rating ?? 0)) {
    return NextResponse.json({ error: "script_id, type, and rating (1 or -1) are required" }, { status: 422 });
  }

  const admin = createAdminClient();
  const { error } = await admin.from("feedback").insert({
    user_id: user.id,
    script_id,
    scene_id: scene_id ?? null,
    type,
    rating,
    comment: comment?.trim() || null,
  });

  if (error) {
    console.error("[feedback] insert error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
