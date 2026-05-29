import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Badge } from "@/components/ui/badge";
import {
  PLATFORM_LABELS,
  VISUAL_STYLE_LABELS,
  AI_TOOL_LABELS,
} from "@/lib/constants";
import type { Platform, VisualStyle, AiTool, Plan } from "@/types/database";
import ScriptActions from "@/components/scripts/ScriptActions";
import ScriptEditor from "@/components/scripts/ScriptEditor";

const PAID_PLANS: Plan[] = ["creator", "studio", "agency", "pro"];

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ScriptPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch user plan to determine voiceover access
  const admin = createAdminClient();
  const { data: userProfile } = await admin
    .from("users")
    .select("plan")
    .eq("id", user.id)
    .single();
  const canGenerateVoiceover = PAID_PLANS.includes((userProfile?.plan ?? "free") as Plan);

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
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
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
        initialScenes={scenes ?? []}
        canGenerateVoiceover={canGenerateVoiceover}
      />
    </div>
  );
}
