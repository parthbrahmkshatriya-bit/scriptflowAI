import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { Badge } from "@/components/ui/badge";
import { PLAN_LABELS } from "@/lib/constants";

export const dynamic = "force-dynamic";

const PLAN_COLORS: Record<string, string> = {
  free: "bg-zinc-800 text-zinc-300",
  creator: "bg-blue-900/60 text-blue-300",
  studio: "bg-violet-900/60 text-violet-300",
  pro: "bg-amber-900/60 text-amber-300",
  agency: "bg-amber-900/60 text-amber-300",
};

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function AdminPage({ searchParams }: PageProps) {
  const { tab = "all" } = await searchParams;
  const admin = createAdminClient();

  // --- Fetch users ---
  const { data: users } = await admin
    .from("users")
    .select("id, email, full_name, plan, scripts_used_this_month, video_credits, subscription_status, created_at, updated_at")
    .order("created_at", { ascending: false });

  // --- Fetch total scripts per user ---
  const { data: allScripts } = await admin.from("scripts").select("user_id, id");
  const scriptCountMap: Record<string, number> = {};
  for (const s of allScripts ?? []) {
    scriptCountMap[s.user_id] = (scriptCountMap[s.user_id] ?? 0) + 1;
  }

  // --- Fetch recent feedback ---
  const { data: recentFeedback } = await admin
    .from("feedback")
    .select("id, user_id, type, rating, comment, created_at, script_id")
    .order("created_at", { ascending: false })
    .limit(50);

  // --- Fetch script titles for feedback ---
  const feedbackScriptIds = [...new Set((recentFeedback ?? []).map((f) => f.script_id).filter(Boolean))];
  const { data: feedbackScripts } = feedbackScriptIds.length
    ? await admin.from("scripts").select("id, title").in("id", feedbackScriptIds)
    : { data: [] };
  const scriptTitleMap: Record<string, string> = {};
  for (const s of feedbackScripts ?? []) scriptTitleMap[s.id] = s.title;

  // --- Build user rows ---
  const userRows = (users ?? []).map((u) => ({
    ...u,
    totalScripts: scriptCountMap[u.id] ?? 0,
  }));

  // --- Stats ---
  const totalUsers = userRows.length;
  const freeUsers = userRows.filter((u) => u.plan === "free").length;
  const payingUsers = userRows.filter((u) => u.plan !== "free").length;
  const activeThisMonth = userRows.filter((u) => (u.scripts_used_this_month ?? 0) > 0).length;
  const totalFeedback = recentFeedback?.length ?? 0;
  const positiveFeedback = recentFeedback?.filter((f) => f.rating === 1).length ?? 0;

  // --- Filter rows based on active tab ---
  const filteredUsers =
    tab === "free"
      ? [...userRows].filter((u) => u.plan === "free").sort((a, b) => (b.scripts_used_this_month ?? 0) - (a.scripts_used_this_month ?? 0))
      : tab === "paying"
      ? userRows.filter((u) => u.plan !== "free")
      : tab === "active"
      ? userRows.filter((u) => (u.scripts_used_this_month ?? 0) > 0)
      : userRows;

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  }

  const tabs = [
    { key: "all", label: `All (${totalUsers})` },
    { key: "free", label: `Free (${freeUsers})` },
    { key: "paying", label: `Paying (${payingUsers})` },
    { key: "active", label: `Active this month (${activeThisMonth})` },
    { key: "feedback", label: `Feedback (${totalFeedback})` },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">ScriptFlow AI user base &amp; feedback</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {[
          { label: "Total users", value: totalUsers },
          { label: "Free users", value: freeUsers },
          { label: "Paying users", value: payingUsers, highlight: true },
          { label: "Active this month", value: activeThisMonth },
          { label: "Feedback received", value: `${positiveFeedback}👍 / ${totalFeedback - positiveFeedback}👎` },
        ].map((s) => (
          <div
            key={s.label}
            className={`rounded-xl border p-4 space-y-1 ${
              s.highlight
                ? "border-violet-500/30 bg-violet-900/10"
                : "border-white/[0.06] bg-white/[0.03]"
            }`}
          >
            <p className="text-[11px] text-muted-foreground">{s.label}</p>
            <p className={`text-2xl font-bold ${s.highlight ? "text-violet-300" : ""}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-white/[0.06] pb-0">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={`/admin?tab=${t.key}`}
            className={`px-4 py-2 text-xs font-medium rounded-t-md transition-colors -mb-px border-b-2 ${
              tab === t.key
                ? "border-violet-500 text-violet-300 bg-violet-900/10"
                : "border-transparent text-zinc-400 hover:text-white hover:bg-white/5"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {/* Feedback tab */}
      {tab === "feedback" ? (
        <div className="rounded-xl border border-white/[0.06] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Rating</th>
                <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Type</th>
                <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Script</th>
                <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Comment</th>
                <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {(recentFeedback ?? []).map((f) => (
                <tr key={f.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3">
                    <span className={f.rating === 1 ? "text-green-400" : "text-red-400"}>
                      {f.rating === 1 ? "👍" : "👎"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      f.type === "script" ? "bg-blue-900/40 text-blue-300" : "bg-violet-900/40 text-violet-300"
                    }`}>
                      {f.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-400 max-w-[180px] truncate">
                    {f.script_id ? (
                      <Link href={`/admin/users`} className="hover:text-white transition-colors">
                        {scriptTitleMap[f.script_id] ?? f.script_id.slice(0, 8) + "…"}
                      </Link>
                    ) : "—"}
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-300 max-w-[280px]">
                    {f.comment ?? <span className="text-zinc-600 italic">no comment</span>}
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-500">{formatDate(f.created_at)}</td>
                </tr>
              ))}
              {!recentFeedback?.length && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-sm text-muted-foreground">
                    No feedback yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* Users table */
        <div className="rounded-xl border border-white/[0.06] overflow-hidden overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">User</th>
                <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Plan</th>
                <th className="text-right px-4 py-3 text-xs text-muted-foreground font-medium">Scripts total</th>
                <th className="text-right px-4 py-3 text-xs text-muted-foreground font-medium">This month</th>
                <th className="text-right px-4 py-3 text-xs text-muted-foreground font-medium">Vid credits</th>
                <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => {
                const scriptsThisMonth = u.scripts_used_this_month ?? 0;
                const isNearLimit = u.plan === "free" && scriptsThisMonth >= 2;
                return (
                  <tr key={u.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/admin/users/${u.id}`} className="group">
                        <p className="text-sm font-medium group-hover:text-violet-300 transition-colors">
                          {u.full_name ?? <span className="text-zinc-500 italic">No name</span>}
                        </p>
                        <p className="text-xs text-zinc-500">{u.email}</p>
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${PLAN_COLORS[u.plan] ?? PLAN_COLORS.free}`}>
                        {PLAN_LABELS[u.plan] ?? u.plan}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-sm">{u.totalScripts}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`text-sm ${isNearLimit ? "text-amber-400 font-semibold" : ""}`}>
                        {scriptsThisMonth}
                        {u.plan === "free" && <span className="text-zinc-600 text-xs">/3</span>}
                      </span>
                      {isNearLimit && (
                        <span className="ml-1.5 text-[9px] bg-amber-900/40 text-amber-300 px-1.5 py-0.5 rounded-full">
                          near limit
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-sm">{u.video_credits ?? 0}</td>
                    <td className="px-4 py-3 text-xs text-zinc-500">{formatDate(u.created_at)}</td>
                  </tr>
                );
              })}
              {!filteredUsers.length && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    No users in this filter
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
