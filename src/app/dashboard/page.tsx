import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { buttonVariants } from "@/lib/button-variants";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PLAN_LABELS, PLAN_LIMITS, PLATFORM_LABELS, VISUAL_STYLE_LABELS, AI_TOOL_LABELS } from "@/lib/constants";
import type { Plan, Platform, VisualStyle, AiTool } from "@/types/database";

export const dynamic = "force-dynamic";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("full_name, plan, scripts_used_this_month")
    .eq("id", user.id)
    .single();

  const { data: scripts } = await supabase
    .from("scripts")
    .select("id, title, concept, platform, visual_style, ai_tool, duration, scene_count, is_favorite, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  const { count: totalCount } = await supabase
    .from("scripts")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  const { count: favCount } = await supabase
    .from("scripts")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("is_favorite", true);

  const plan = (profile?.plan ?? "free") as Plan;
  const used = profile?.scripts_used_this_month ?? 0;
  const limit = PLAN_LIMITS[plan];
  const firstName = profile?.full_name?.split(" ")[0] ?? "there";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Hey, {firstName} 👋</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {PLAN_LABELS[plan]} plan · {used} of {limit === Infinity ? "∞" : limit} scripts used this month
          </p>
        </div>
        <Link href="/dashboard/generate" className={cn(buttonVariants())}>
          + New Script
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-1 pt-4 px-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">Scripts This Month</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-3xl font-bold">{used}</div>
            <p className="text-xs text-muted-foreground mt-1">
              of {limit === Infinity ? "unlimited" : limit} on {PLAN_LABELS[plan]}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1 pt-4 px-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Scripts</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-3xl font-bold">{totalCount ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1 pt-4 px-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">Favorites</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-3xl font-bold">{favCount ?? 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Script List */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Recent Scripts</h2>

        {!scripts || scripts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="text-4xl mb-4">🎬</div>
              <h3 className="font-semibold text-lg mb-2">No scripts yet</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Generate your first AI video script in seconds
              </p>
              <Link href="/dashboard/generate" className={cn(buttonVariants())}>
                Generate Your First Script
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {scripts.map((script) => (
              <Link key={script.id} href={`/dashboard/script/${script.id}`}>
                <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                  <CardContent className="px-4 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold truncate">{script.title}</h3>
                          {script.is_favorite && (
                            <span className="text-yellow-500 text-sm">★</span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5 truncate">
                          {script.concept}
                        </p>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          <Badge variant="secondary" className="text-xs">
                            {PLATFORM_LABELS[script.platform as Platform]}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {VISUAL_STYLE_LABELS[script.visual_style as VisualStyle]}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {AI_TOOL_LABELS[script.ai_tool as AiTool]}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {script.duration}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {script.scene_count} scenes
                          </Badge>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground whitespace-nowrap mt-1">
                        {formatDate(script.created_at)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Upgrade prompt for free users who hit the limit */}
      {plan === "free" && used >= limit && (
        <Card className="border-violet-500/50 bg-violet-950/20">
          <CardContent className="flex items-center justify-between gap-4 px-4 py-3 flex-wrap">
            <div>
              <p className="font-semibold text-sm">Monthly script limit reached</p>
              <p className="text-xs text-muted-foreground">
                Upgrade to Creator for 30 scripts/month — ₹999/mo
              </p>
            </div>
            <Link href="/dashboard/upgrade" className={cn(buttonVariants({ size: "sm" }), "bg-gradient-to-r from-violet-600 to-blue-600 text-white hover:from-violet-500 hover:to-blue-500 border-0")}>
              Upgrade to Creator — ₹999/mo
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Soft upgrade nudge when approaching limit */}
      {plan === "free" && used < limit && used >= Math.floor(limit * 0.6) && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="flex items-center justify-between gap-4 px-4 py-3 flex-wrap">
            <div>
              <p className="font-semibold text-sm">Running low on scripts</p>
              <p className="text-xs text-muted-foreground">
                {limit - used} script{limit - used === 1 ? "" : "s"} left this month · Upgrade for more
              </p>
            </div>
            <Link href="/dashboard/upgrade" className={cn(buttonVariants({ size: "sm" }))}>
              Upgrade — ₹999/mo
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
