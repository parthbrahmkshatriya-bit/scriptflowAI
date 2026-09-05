import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Monthly usage period rollover.
 *
 * Quota reset used to be cron-only. Migration 001 scheduled a job that resets
 * scripts_used_this_month, and migration 003 left a note to extend it to cover
 * videos — a note that may never have been actioned. If it was not, video
 * counters never reset and any account that reached its limit stayed capped
 * indefinitely, with nothing in the product able to recover it.
 *
 * The application now rolls the period over itself the first time an account is
 * used in a new calendar month. Quota correctness no longer depends on a
 * scheduled job firing; the cron becomes a redundant tidy-up rather than the
 * only thing standing between a paying user and a locked account.
 */

export interface MonthlyUsage {
  scriptsUsed: number;
  videosUsed: number;
  premiumVideosUsed: number;
  /** True when this call started a new period and zeroed the counters. */
  rolledOver: boolean;
}

/** First instant of the current calendar month, UTC — matches date_trunc('month'). */
function currentPeriodStart(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

function num(v: unknown): number {
  return typeof v === "number" && Number.isFinite(v) ? v : 0;
}

/**
 * Read this month's usage, resetting first if the stored counters belong to an
 * earlier month.
 *
 * `profile` is the already-fetched users row, so this costs no extra read on the
 * common path and one write only on the first request of a new month.
 */
export async function getMonthlyUsage(
  admin: SupabaseClient,
  userId: string,
  profile: Record<string, unknown> | null | undefined
): Promise<MonthlyUsage> {
  const stored = {
    scriptsUsed: num(profile?.scripts_used_this_month),
    videosUsed: num(profile?.videos_used_this_month),
    premiumVideosUsed: num(profile?.premium_videos_used_this_month),
  };

  const periodStartRaw = profile?.usage_period_start;
  // Column absent (migration 009 not applied) — behave exactly as before.
  if (!periodStartRaw) {
    return { ...stored, rolledOver: false };
  }

  const storedPeriod = new Date(periodStartRaw as string);
  const thisPeriod = currentPeriodStart();
  if (!(storedPeriod.getTime() < thisPeriod.getTime())) {
    return { ...stored, rolledOver: false };
  }

  // Stale period: zero the counters and stamp the new one. The equality guard
  // makes concurrent requests idempotent — the loser writes nothing, and both
  // proceed with zeroed usage, which is correct either way.
  const { error } = await admin
    .from("users")
    .update({
      scripts_used_this_month: 0,
      videos_used_this_month: 0,
      premium_videos_used_this_month: 0,
      usage_period_start: thisPeriod.toISOString(),
    })
    .eq("id", userId)
    .eq("usage_period_start", storedPeriod.toISOString());

  if (error) {
    console.warn("[usage] period rollover failed:", error.message);
  }

  return { scriptsUsed: 0, videosUsed: 0, premiumVideosUsed: 0, rolledOver: true };
}
