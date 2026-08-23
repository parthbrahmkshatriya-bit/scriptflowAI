import { notFound } from "next/navigation";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { PLAN_LABELS, PLATFORM_LABELS, VIDEO_LIMITS } from "@/lib/constants";
import { ArrowLeft } from "lucide-react";
import BanButton from "@/components/admin/BanButton";

export const dynamic = "force-dynamic";

const PLAN_COLORS: Record<string, string> = {
  free: "bg-zinc-800 text-zinc-300",
  creator: "bg-blue-900/60 text-blue-300",
  studio: "bg-violet-900/60 text-violet-300",
  pro: "bg-amber-900/60 text-amber-300",
  agency: "bg-amber-900/60 text-amber-300",
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminUserPage({ params }: Props) {
  const { id } = await params;
  const admin = createAdminClient();

  const { data: user } = await admin
    .from("users")
    .select("*")
    .eq("id", id)
    .single();

  if (!user) notFound();

  const { data: scripts } = await admin
    .from("scripts")
    .select("id, title, concept, platform, visual_style, ai_tool, scene_count, duration, created_at")
    .eq("user_id", id)
    .order("created_at", { ascending: false });

  const { data: feedback } = await admin
    .from("feedback")
    .select("id, type, rating, comment, created_at, script_id")
    .eq("user_id", id)
    .order("created_at", { ascending: false });

  const scriptTitleMap: Record<string, string> = {};
  for (const s of scripts ?? []) scriptTitleMap[s.id] = s.title;

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  }

  const u = user as Record<string, unknown>;
  const plan = (u.plan as string) ?? "free";
  const videosUsed = (u.videos_used_this_month as number) ?? 0;
  const videoLimit = VIDEO_LIMITS[plan] ?? 0;
  const videoCredits = (u.video_credits as number) ?? 0;
  const scriptsUsed = (u.scripts_used_this_month as number) ?? 0;
  const totalFeedback = feedback?.length ?? 0;
  const thumbsUp = feedback?.filter((f) => f.rating === 1).length ?? 0;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Back */}
      <Link href="/admin" className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to users
      </Link>

      {/* Profile header */}
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-6 space-y-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-bold">{(u.full_name as string) ?? "No name"}</h1>
              {!!u.is_banned && (
                <span className="text-xs bg-red-900/50 text-red-300 border border-red-700/40 px-2 py-0.5 rounded-full font-medium">
                  Banned
                </span>
              )}
            </div>
            <p className="text-sm text-zinc-400 mt-0.5">{u.email as string}</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className={`text-xs px-3 py-1 rounded-full font-semibold ${PLAN_COLORS[plan] ?? PLAN_COLORS.free}`}>
              {PLAN_LABELS[plan] ?? plan}
            </span>
            <BanButton
              userId={id}
              isBanned={!!u.is_banned}
              banReason={(u.ban_reason as string) ?? null}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 border-t border-white/[0.06]">
          {[
            { label: "Total scripts", value: scripts?.length ?? 0 },
            { label: "Scripts this month", value: `${scriptsUsed}` },
            { label: "Videos used", value: `${videosUsed} / ${videoLimit}` },
            { label: "Video credits", value: videoCredits },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-[11px] text-muted-foreground">{s.label}</p>
              <p className="text-lg font-semibold mt-0.5">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3 text-xs text-zinc-500 pt-1 border-t border-white/[0.06]">
          <span>Joined: {formatDate(u.created_at as string)}</span>
          <span>·</span>
          <span>Sub status: {(u.subscription_status as string) ?? "none"}</span>
          <span>·</span>
          <span>Feedback: {thumbsUp}👍 / {totalFeedback - thumbsUp}👎 ({totalFeedback} total)</span>
        </div>
      </div>

      {/* Scripts */}
      <div>
        <h2 className="font-semibold text-base mb-3">Scripts ({scripts?.length ?? 0})</h2>
        {scripts?.length ? (
          <div className="rounded-xl border border-white/[0.06] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                  <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Title</th>
                  <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Platform</th>
                  <th className="text-right px-4 py-3 text-xs text-muted-foreground font-medium">Scenes</th>
                  <th className="text-right px-4 py-3 text-xs text-muted-foreground font-medium">Duration</th>
                  <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {scripts.map((s) => (
                  <tr key={s.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-sm truncate max-w-[220px]">{s.title}</p>
                      <p className="text-xs text-zinc-500 truncate max-w-[220px]">{s.concept}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-zinc-400">
                      {PLATFORM_LABELS[s.platform as string] ?? s.platform}
                    </td>
                    <td className="px-4 py-3 text-right text-sm">{s.scene_count}</td>
                    <td className="px-4 py-3 text-right text-xs text-zinc-400">{s.duration}</td>
                    <td className="px-4 py-3 text-xs text-zinc-500">{formatDate(s.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground py-6 text-center border border-white/[0.06] rounded-xl">
            No scripts yet
          </p>
        )}
      </div>

      {/* Feedback */}
      {feedback && feedback.length > 0 && (
        <div>
          <h2 className="font-semibold text-base mb-3">Feedback ({feedback.length})</h2>
          <div className="space-y-2">
            {feedback.map((f) => (
              <div key={f.id} className="flex items-start gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3">
                <span className={`text-lg mt-0.5 ${f.rating === 1 ? "text-green-400" : "text-red-400"}`}>
                  {f.rating === 1 ? "👍" : "👎"}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      f.type === "script" ? "bg-blue-900/40 text-blue-300" : "bg-violet-900/40 text-violet-300"
                    }`}>
                      {f.type}
                    </span>
                    {f.script_id && (
                      <span className="text-xs text-zinc-500 truncate">
                        {scriptTitleMap[f.script_id] ?? f.script_id.slice(0, 12) + "…"}
                      </span>
                    )}
                    <span className="text-xs text-zinc-600 ml-auto">{formatDate(f.created_at)}</span>
                  </div>
                  {f.comment && (
                    <p className="text-sm text-zinc-300 mt-1">{f.comment}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
