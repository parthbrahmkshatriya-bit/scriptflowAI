-- Migration 003: Add video generation tracking
-- Adds videos_used_this_month counter to users table
-- The monthly reset is handled by the same cron job that resets scripts_used_this_month

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS videos_used_this_month INTEGER NOT NULL DEFAULT 0;

-- Reset video counter alongside script counter on the 1st of each month
-- (Update your existing cron function to also reset this field)
-- Example cron SQL to add:
-- UPDATE public.users SET videos_used_this_month = 0
--   WHERE date_trunc('month', now()) > date_trunc('month', updated_at);
