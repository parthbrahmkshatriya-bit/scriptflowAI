-- Premium render quota.
--
-- A render's cost varies by more than 6x depending on model and resolution
-- ($0.20 for Veo 3.1 Lite at 720p/4s, $1.28 for Fast at 1080p/8s). Counting
-- every render as one "video" means a plan's worst case is set by the most
-- expensive combination a subscriber can reach, not by what they typically use.
--
-- This caps how many of a plan's renders may use the expensive settings. The
-- rest fall back to Lite at 720p, so the allowance stays generous while the
-- worst case stops being unbounded. It is a narrower version of what the
-- credit system will do properly.

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS premium_videos_used_this_month INTEGER NOT NULL DEFAULT 0;

-- Marks which calendar month the counters above belong to.
--
-- Monthly reset was cron-only, and migration 003 left a note to extend that job
-- which may never have been actioned — in which case video counters never reset
-- and anyone who hit their limit stayed capped forever. The application now
-- rolls the period over itself on first use in a new month, so quota correctness
-- no longer depends on a scheduled job running.
--
-- Defaults to the current month so applying this does not reset anyone mid-cycle.
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS usage_period_start timestamptz NOT NULL
    DEFAULT date_trunc('month', now());

-- ---------------------------------------------------------------------------
-- MONTHLY RESET — IMPORTANT
--
-- Migration 003 added videos_used_this_month with a note to update the existing
-- cron job, and 001 scheduled a job that resets ONLY scripts_used_this_month:
--
--   SELECT cron.schedule('reset-monthly-usage', '0 0 1 * *',
--     'UPDATE public.users SET scripts_used_this_month = 0');
--
-- If that job was never updated, video counters have never reset and any user
-- who reached their video limit is still capped. Re-schedule it to cover all
-- three counters. cron.schedule with an existing name replaces the job.
-- ---------------------------------------------------------------------------

-- Run this once (requires the pg_cron extension, enabled by default on Supabase):
--
--   SELECT cron.schedule(
--     'reset-monthly-usage',
--     '0 0 1 * *',
--     $$UPDATE public.users
--          SET scripts_used_this_month = 0,
--              videos_used_this_month = 0,
--              premium_videos_used_this_month = 0$$
--   );
--
-- Verify afterwards with:
--   SELECT jobname, schedule, command FROM cron.job;

-- One-off correction for accounts whose counters went stale while the cron only
-- reset scripts. Safe to run: it only clears counters for rows untouched in the
-- current calendar month, and stamps them into the current period so the
-- application's own rollover takes over from here.
UPDATE public.users
   SET videos_used_this_month = 0,
       premium_videos_used_this_month = 0,
       usage_period_start = date_trunc('month', now())
 WHERE date_trunc('month', now()) > date_trunc('month', updated_at);

-- How many accounts this affected — a non-zero count confirms the cron gap was real:
--   SELECT count(*) FROM public.users
--    WHERE date_trunc('month', now()) > date_trunc('month', updated_at);
