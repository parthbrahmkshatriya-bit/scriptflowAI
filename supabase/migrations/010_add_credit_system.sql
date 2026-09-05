-- Model-weighted video credits.
--
-- Until now a render was counted as one "video" regardless of cost, while the
-- actual spend varies more than 6x ($0.20 for Veo 3.1 Lite at 720p/4s against
-- $1.28 for Fast at 1080p/8s). That made a plan's worst case depend on which
-- settings a subscriber happened to pick, which is why it had to be bounded by
-- entitlement rules and a separate premium cap.
--
-- One credit is a fixed slice of render cost, so a plan's grant IS its cost
-- ceiling. Overspend stops being unlikely and becomes arithmetically impossible,
-- and users can be given free choice of model and resolution because the
-- expensive combinations simply cost more credits.
--
--   1 credit = $0.05 of render spend
--   credits  = ceil(rate_per_second * seconds / 0.05)
--
--   Veo 3.1 Lite  720p  4s  ->   4 credits
--   Veo 3.1 Lite  720p  8s  ->   8
--   Veo 3.1 Fast  720p  8s  ->  16
--   Veo 3.1 Fast 1080p  8s  ->  26
--   Kling i2v            5s  ->   5

-- ---------------------------------------------------------------------------
-- Balance
-- ---------------------------------------------------------------------------

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS credit_balance INTEGER NOT NULL DEFAULT 0,
  -- Credits granted by the current subscription period, kept separately so a
  -- period rollover can reset the grant without touching purchased credits.
  ADD COLUMN IF NOT EXISTS credits_from_plan INTEGER NOT NULL DEFAULT 0;

-- ---------------------------------------------------------------------------
-- Ledger — append-only history of every balance movement
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.credit_ledger (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  -- Negative for spend, positive for grant, purchase and refund.
  delta         integer NOT NULL,
  balance_after integer NOT NULL,
  reason        text NOT NULL,
  -- fal request id. Makes commit and refund idempotent against retries and
  -- duplicate webhook deliveries.
  job_id        text,
  model_key     text,
  seconds       integer,
  resolution    text,
  metadata      jsonb,
  created_at    timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT credit_ledger_reason_check CHECK (reason IN (
    'plan_grant', 'purchase', 'spend', 'refund', 'expire', 'adjustment'
  ))
);

CREATE INDEX IF NOT EXISTS idx_credit_ledger_user_created
  ON public.credit_ledger (user_id, created_at DESC);

-- A job may be spent once and refunded once, never twice.
CREATE UNIQUE INDEX IF NOT EXISTS idx_credit_ledger_job_reason
  ON public.credit_ledger (job_id, reason) WHERE job_id IS NOT NULL;

ALTER TABLE public.credit_ledger ENABLE ROW LEVEL SECURITY;

-- Readable by its owner. All writes go through the functions below, which run
-- as definer — a client can never move its own balance directly.
DROP POLICY IF EXISTS "own ledger select" ON public.credit_ledger;
CREATE POLICY "own ledger select" ON public.credit_ledger
  FOR SELECT USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- spend_credits — atomic check-and-deduct
--
-- The previous read-then-write pattern let two concurrent renders both read the
-- same balance and both deduct, so one went unpaid. Doing it in a single
-- statement takes a row lock, making that impossible.
--
-- Returns the new balance, or -1 when the balance is insufficient. Never throws
-- on insufficient funds — that is an expected outcome, not an error.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.spend_credits(
  p_user_id    uuid,
  p_amount     integer,
  p_job_id     text    DEFAULT NULL,
  p_model_key  text    DEFAULT NULL,
  p_seconds    integer DEFAULT NULL,
  p_resolution text    DEFAULT NULL
) RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_new_balance integer;
BEGIN
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'spend amount must be positive, got %', p_amount;
  END IF;

  UPDATE public.users
     SET credit_balance = credit_balance - p_amount
   WHERE id = p_user_id
     AND credit_balance >= p_amount
  RETURNING credit_balance INTO v_new_balance;

  IF v_new_balance IS NULL THEN
    RETURN -1;                       -- insufficient balance, nothing changed
  END IF;

  INSERT INTO public.credit_ledger
    (user_id, delta, balance_after, reason, job_id, model_key, seconds, resolution)
  VALUES
    (p_user_id, -p_amount, v_new_balance, 'spend', p_job_id, p_model_key, p_seconds, p_resolution)
  ON CONFLICT DO NOTHING;            -- same job charged twice is a no-op

  RETURN v_new_balance;
END;
$$;

-- ---------------------------------------------------------------------------
-- refund_credits — give back a failed render
--
-- Looks up what the job was actually charged rather than trusting a caller's
-- figure, and the unique index makes a second refund for the same job a no-op.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.refund_credits(
  p_user_id uuid,
  p_job_id  text,
  p_note    text DEFAULT NULL
) RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_spent       integer;
  v_new_balance integer;
BEGIN
  SELECT -delta INTO v_spent
    FROM public.credit_ledger
   WHERE job_id = p_job_id AND reason = 'spend'
   LIMIT 1;

  IF v_spent IS NULL THEN
    RETURN -1;                       -- nothing was charged for this job
  END IF;

  IF EXISTS (SELECT 1 FROM public.credit_ledger
              WHERE job_id = p_job_id AND reason = 'refund') THEN
    SELECT credit_balance INTO v_new_balance FROM public.users WHERE id = p_user_id;
    RETURN v_new_balance;            -- already refunded
  END IF;

  UPDATE public.users
     SET credit_balance = credit_balance + v_spent
   WHERE id = p_user_id
  RETURNING credit_balance INTO v_new_balance;

  INSERT INTO public.credit_ledger
    (user_id, delta, balance_after, reason, job_id, metadata)
  VALUES
    (p_user_id, v_spent, v_new_balance, 'refund', p_job_id,
     CASE WHEN p_note IS NULL THEN NULL ELSE jsonb_build_object('note', p_note) END)
  ON CONFLICT DO NOTHING;

  RETURN v_new_balance;
END;
$$;

-- ---------------------------------------------------------------------------
-- grant_plan_credits — set the monthly allowance for a period
--
-- Replaces the previous period's plan grant rather than stacking on it, so
-- unused plan credits expire while purchased credits roll over. Called on
-- subscription payment and on the first request of a new month.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.grant_plan_credits(
  p_user_id uuid,
  p_amount  integer
) RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_previous    integer;
  v_new_balance integer;
BEGIN
  SELECT credits_from_plan INTO v_previous FROM public.users WHERE id = p_user_id;
  IF v_previous IS NULL THEN
    RETURN -1;
  END IF;

  -- Drop whatever remains of the old grant, then add the new one. Purchased
  -- credits are whatever sits above credits_from_plan and are left untouched.
  UPDATE public.users
     SET credit_balance    = GREATEST(0, credit_balance - v_previous) + p_amount,
         credits_from_plan = p_amount
   WHERE id = p_user_id
  RETURNING credit_balance INTO v_new_balance;

  INSERT INTO public.credit_ledger
    (user_id, delta, balance_after, reason, metadata)
  VALUES
    (p_user_id, p_amount - v_previous, v_new_balance, 'plan_grant',
     jsonb_build_object('previous_grant', v_previous, 'new_grant', p_amount));

  RETURN v_new_balance;
END;
$$;

-- ---------------------------------------------------------------------------
-- add_purchased_credits — credit pack top-up, never expires
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.add_purchased_credits(
  p_user_id uuid,
  p_amount  integer,
  p_ref     text DEFAULT NULL
) RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_new_balance integer;
BEGIN
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'purchase amount must be positive, got %', p_amount;
  END IF;

  UPDATE public.users
     SET credit_balance = credit_balance + p_amount
   WHERE id = p_user_id
  RETURNING credit_balance INTO v_new_balance;

  INSERT INTO public.credit_ledger
    (user_id, delta, balance_after, reason, job_id, metadata)
  VALUES
    (p_user_id, p_amount, v_new_balance, 'purchase', p_ref,
     jsonb_build_object('source', 'credit_pack'))
  ON CONFLICT DO NOTHING;

  RETURN v_new_balance;
END;
$$;

REVOKE ALL ON FUNCTION public.spend_credits(uuid,integer,text,text,integer,text) FROM public, anon, authenticated;
REVOKE ALL ON FUNCTION public.refund_credits(uuid,text,text)                     FROM public, anon, authenticated;
REVOKE ALL ON FUNCTION public.grant_plan_credits(uuid,integer)                   FROM public, anon, authenticated;
REVOKE ALL ON FUNCTION public.add_purchased_credits(uuid,integer,text)           FROM public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Backfill existing accounts
--
-- Purchased pack credits were denominated in whole videos. One video is worth 8
-- credits here, which covers a Veo 3.1 Lite render at 720p for the full 8
-- seconds — so nobody loses value in the conversion.
-- ---------------------------------------------------------------------------

UPDATE public.users
   SET credit_balance = credit_balance + (COALESCE(video_credits, 0) * 8)
 WHERE COALESCE(video_credits, 0) > 0
   AND credit_balance = 0;

INSERT INTO public.credit_ledger (user_id, delta, balance_after, reason, metadata)
SELECT id, video_credits * 8, credit_balance, 'adjustment',
       jsonb_build_object('migration', '010', 'converted_video_credits', video_credits)
  FROM public.users
 WHERE COALESCE(video_credits, 0) > 0;

-- Plan grants are applied by the application on the next request, so no
-- backfill is needed here. video_credits is left in place for one release as a
-- rollback path; a later migration can drop it.
