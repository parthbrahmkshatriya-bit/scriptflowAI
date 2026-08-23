-- Feedback table: captures thumbs up/down on scripts and generated videos
CREATE TABLE IF NOT EXISTS public.feedback (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        REFERENCES public.users(id) ON DELETE SET NULL,
  script_id   uuid        REFERENCES public.scripts(id) ON DELETE CASCADE,
  scene_id    uuid        REFERENCES public.scenes(id) ON DELETE SET NULL,
  type        text        NOT NULL CHECK (type IN ('script', 'video')),
  rating      integer     NOT NULL CHECK (rating IN (1, -1)),
  comment     text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own feedback"
  ON public.feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own feedback"
  ON public.feedback FOR SELECT
  USING (auth.uid() = user_id);

CREATE INDEX idx_feedback_script_id ON public.feedback(script_id);
CREATE INDEX idx_feedback_user_id   ON public.feedback(user_id);
CREATE INDEX idx_feedback_type      ON public.feedback(type);
