import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/lib/button-variants";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import {
  PLAN_LABELS,
  PLAN_LIMITS,
  PLATFORM_LABELS,
  VISUAL_STYLE_LABELS,
  AI_TOOL_LABELS,
} from "@/lib/constants";
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
    .select(
      "id, title, concept, platform, visual_style, ai_tool, duration, scene_count, is_favorite, created_at"
    )
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
  const usagePct =
    limit !== Infinity ? Math.min((used / limit) * 100, 100) : 0;

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Hey, {firstName} 👋</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {PLAN_LABELS[plan]} plan ·{" "}
            {used} of {limit === Infinity ? "∞" : limit} scripts used this month
          </p>
        </div>
        <Link
          href="/dashboard/generate"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 transition-all duration-200 shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 hover:scale-[1.02]"
        >
          <Sparkles className="size-4" />
          New Script
        </Link>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        {/* Scripts This Month */}
        <div className="relative rounded-xl p-px bg-gradient-to-br from-violet-500/40 via-purple-500/20 to-transparent">
          <div className="rounded-[11px] bg-card p-4 h-full space-y-3">
            <p className="text-sm font-medium text-muted-foreground">Scripts This Month</p>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-bold">{used}</span>
              <span className="text-sm text-muted-foreground pb-0.5">
                / {limit === Infinity ? "∞" : limit}
              </span>
            </div>
            {limit !== Infinity && (
              <div className="space-y-1">
                <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      usagePct >= 100
                        ? "bg-red-500"
                        : usagePct >= 70
                        ? "bg-amber-500"
                        : "bg-gradient-to-r from-violet-500 to-blue-500"
                    }`}
                    style={{ width: `${usagePct}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  on {PLAN_LABELS[plan]}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Total Scripts */}
        <div className="relative rounded-xl p-px bg-gradient-to-br from-blue-500/40 via-cyan-500/20 to-transparent">
          <div className="rounded-[11px] bg-card p-4 h-full">
            <p className="text-sm font-medium text-muted-foreground">Total Scripts</p>
            <div className="text-3xl font-bold mt-2">{totalCount ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-1">all time</p>
          </div>
        </div>

        {/* Favorites */}
        <div className="relative rounded-xl p-px bg-gradient-to-br from-pink-500/40 via-rose-500/20 to-transparent">
          <div className="rounded-[11px] bg-card p-4 h-full">
            <p className="text-sm font-medium text-muted-foreground">Favorites</p>
            <div className="text-3xl font-bold mt-2">{favCount ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-1">starred scripts</p>
          </div>
        </div>

      </div>

      {/* Script List */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Recent Scripts</h2>

        {!scripts || scripts.length === 0 ? (
          <div className="relative rounded-2xl border border-white/[0.08] bg-white/[0.02] overflow-hidden">
            {/* Subtle background glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-violet-950/30 via-transparent to-blue-950/20 pointer-events-none" />
            <div className="relative flex flex-col items-center justify-center py-16 text-center px-6">
              <div className="size-16 rounded-2xl bg-gradient-to-br from-violet-600/20 to-blue-600/20 border border-violet-500/20 flex items-center justify-center mb-5">
                <span className="text-3xl">🎬</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">No scripts yet</h3>
              <p className="text-muted-foreground text-sm mb-6 max-w-xs">
                Generate your first AI video script in seconds
              </p>
              <Link
                href="/dashboard/generate"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 hover:from-violet-500 hover:via-purple-500 hover:to-blue-500 transition-all duration-200 shadow-lg shadow-violet-500/25 hover:scale-[1.02]"
              >
                <Sparkles className="size-4" />
                Generate Your First Script
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-3">
            {scripts.map((script) => (
              <Link key={script.id} href={`/dashboard/script/${script.id}`}>
                <Card className="hover:border-violet-500/40 hover:bg-white/[0.05] hover:shadow-[0_0_20px_-8px_rgba(139,92,246,0.3)] transition-all duration-200 cursor-pointer">
                  <CardContent className="px-4 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold truncate">{script.title}</h3>
                          {script.is_favorite && (
                            <span className="text-yellow-400 text-sm">★</span>
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

      {/* Upgrade: limit reached */}
      {plan === "free" && used >= limit && (
        <Card className="border-violet-500/50 bg-violet-950/20">
          <CardContent className="flex items-center justify-between gap-4 px-4 py-3 flex-wrap">
            <div>
              <p className="font-semibold text-sm">Monthly script limit reached</p>
              <p className="text-xs text-muted-foreground">
                Upgrade to Creator for 30 scripts/month — ₹999/mo
              </p>
            </div>
            <Link
              href="/dashboard/upgrade"
              className={cn(
                buttonVariants({ size: "sm" }),
                "bg-gradient-to-r from-violet-600 to-blue-600 text-white hover:from-violet-500 hover:to-blue-500 border-0"
              )}
            >
              Upgrade to Creator
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Soft nudge */}
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
