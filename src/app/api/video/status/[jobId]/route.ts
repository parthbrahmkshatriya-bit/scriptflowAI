import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface Props {
  params: Promise<{ jobId: string }>;
}

export async function GET(_request: Request, { params }: Props) {
  const { jobId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: generation, error } = await supabase
    .from("video_generations")
    .select("status, video_url")
    .eq("id", jobId)
    .eq("user_id", user.id)
    .single();

  if (error || !generation) {
    return NextResponse.json({ error: "Generation not found" }, { status: 404 });
  }

  return NextResponse.json({
    status: generation.status,
    videoUrl: generation.video_url ?? null,
  });
}
