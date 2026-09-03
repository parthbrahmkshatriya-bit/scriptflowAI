import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { Badge } from "@/components/ui/badge";
import {
  PLATFORM_LABELS,
  VISUAL_STYLE_LABELS,
  AI_TOOL_LABELS,
  VIDEO_LIMITS,
} from "@/lib/constants";
import type { Platform, VisualStyle, AiTool, Plan } from "@/types/database";
import ScriptActions from "@/components/scripts/ScriptActions";
import ScriptEditor from "@/components/scripts/ScriptEditor";
import ScriptFeedback from "@/components/scripts/ScriptFeedback";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ScriptPage({ params }: Props) {
  const { id } = await params;
  const user = await getAuthUser();
  if (!user) redirect("/login");

  const supabase = await createClient();

  const admin = createAdminClient();
  const { data: userProfile } = await admin
    .from("users")
    .select("plan, videos_used_this_month, video_credits")
    .eq("id", user.id)
    .single();
  const plan = (userProfile?.plan ?? "free") as Plan;
  const videosUsed = (userProfile as Record<string, unknown>)?.videos_used_this_month as number ?? 0;
  const videoCredits = (userProfile as Record<string, unknown>)?.video_credits as number ?? 0;
  const videoLimit = VIDEO_LIMITS[plan] ?? 0;
  const canGenerateVideo = videoLimit > 0 || videoCredits > 0;
  const monthlyRemaining = Math.max(0, videoLimit - videosUsed);
  const totalRemaining = monthlyRemaining + videoCredits;

  const { data: script } = await supabase
    .from("scripts")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!script) notFound();

  const { data: scenes } = await supabase
    .from("scenes")
    .select("*")
    .eq("script_id", id)
    .order("scene_number", { ascending: true });

  function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return (
      d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) +
      " at " +
      d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Script header */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold leading-tight">{script.title}</h1>
            <p className="text-muted-foreground text-sm mt-1 line-clamp-2">
              {script.concept}
            </p>
          </div>
          <ScriptActions
            scriptId={id}
            isFavorite={script.is_favorite}
            isPublic={script.is_public}
            shareSlug={script.share_slug}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">
            {PLATFORM_LABELS[script.platform as Platform]}
          </Badge>
          <Badge variant="outline">
            {VISUAL_STYLE_LABELS[script.visual_style as VisualStyle]}
          </Badge>
          <Badge variant="outline">
            {AI_TOOL_LABELS[script.ai_tool as AiTool]}
          </Badge>
          <Badge variant="outline">{script.duration}</Badge>
          <Badge variant="outline">{script.scene_count} scenes</Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          Generated {formatDate(script.created_at)}
          {script.generation_time_ms &&
            ` · ${(script.generation_time_ms / 1000).toFixed(1)}s`}
        </p>
      </div>

      <ScriptEditor
        scriptId={id}
        scriptTitle={script.title}
        initialScenes={scenes ?? []}
        canGenerateVideo={canGenerateVideo}
        totalVideoCredits={totalRemaining}
        monthlyVideoRemaining={monthlyRemaining}
        purchasedCredits={videoCredits}
      />

      {/* Script-level feedback — shown below all scenes */}
      <div className="pt-2 pb-4 border-t border-white/[0.06]">
        <ScriptFeedback scriptId={id} type="script" />
      </div>
    </div>
  );
}
