-- Script usage analytics.
--
-- The scripts table already answers "how many were generated". It cannot answer
-- what happened afterwards: whether a script was actually taken away and used,
-- or generated and abandoned. Copying a prompt is the strongest available signal
-- of external use, because the prompt exists to be pasted into VEO/Kling/Runway
-- outside this product.
--
-- Append-only. Rows are facts about something that happened, never updated.

CREATE TABLE IF NOT EXISTS public.script_events (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  script_id   uuid REFERENCES public.scripts(id) ON DELETE CASCADE,
  scene_id    uuid REFERENCES public.scenes(id) ON DELETE SET NULL,

  -- prompt_copied      one scene's AI prompt copied to clipboard
  -- all_prompts_copied every prompt in the script copied at once
  -- share_link_copied  public share URL copied
  -- video_generated    render submitted through ScriptFlow
  -- video_downloaded   finished MP4 saved locally
  event_type  text NOT NULL,

  -- Which prompt format was taken (veo3, kling, runway, pika, midjourney,
  -- generic) — shows which external tool users actually run.
  ai_tool     text,
  -- Render model key for video events, plus any small extras.
  metadata    jsonb,

  created_at  timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT script_events_type_check CHECK (event_type IN (
    'prompt_copied',
    'all_prompts_copied',
    'share_link_copied',
    'video_generated',
    'video_downloaded'
  ))
);

-- Per-user activity, newest first.
CREATE INDEX IF NOT EXISTS idx_script_events_user_created
  ON public.script_events (user_id, created_at DESC);

-- "What happened to this script?"
CREATE INDEX IF NOT EXISTS idx_script_events_script
  ON public.script_events (script_id);

-- Aggregate counts by type over a period.
CREATE INDEX IF NOT EXISTS idx_script_events_type_created
  ON public.script_events (event_type, created_at DESC);

ALTER TABLE public.script_events ENABLE ROW LEVEL SECURITY;

-- A user may record and read their own activity. Nothing may update or delete:
-- analytics that can be rewritten are not analytics.
DROP POLICY IF EXISTS "own events insert" ON public.script_events;
CREATE POLICY "own events insert" ON public.script_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "own events select" ON public.script_events;
CREATE POLICY "own events select" ON public.script_events
  FOR SELECT USING (auth.uid() = user_id);

-- Reporting view: one row per script with what became of it.
-- Security invoker so the caller's RLS still applies; the service role used by
-- the admin dashboard sees everything, a signed-in user sees only their own.
CREATE OR REPLACE VIEW public.script_usage_summary
WITH (security_invoker = true) AS
SELECT
  s.id                AS script_id,
  s.user_id,
  s.title,
  s.ai_tool,
  s.created_at        AS generated_at,
  s.scene_count,
  COUNT(*) FILTER (WHERE e.event_type = 'prompt_copied')       AS prompts_copied,
  COUNT(*) FILTER (WHERE e.event_type = 'all_prompts_copied')  AS bulk_copies,
  COUNT(*) FILTER (WHERE e.event_type = 'share_link_copied')   AS share_copies,
  COUNT(*) FILTER (WHERE e.event_type = 'video_generated')     AS videos_generated,
  COUNT(*) FILTER (WHERE e.event_type = 'video_downloaded')    AS videos_downloaded,
  -- A script is "used" once anything was taken out of it. Everything else was
  -- generated and abandoned, which is the number worth watching.
  (COUNT(*) FILTER (WHERE e.event_type IN (
      'prompt_copied', 'all_prompts_copied', 'video_generated', 'video_downloaded'
   )) > 0)            AS was_used
FROM public.scripts s
LEFT JOIN public.script_events e ON e.script_id = s.id
GROUP BY s.id, s.user_id, s.title, s.ai_tool, s.created_at, s.scene_count;
