-- Two corrections to the credit system in migration 010.
--
-- 1. PROVISIONING. Grants were issued only on period rollover, but 009 stamped
--    every existing account into the current period so applying it would not
--    reset anyone mid-cycle. No rollover fires until next month, so subscribers
--    sat at a zero balance and could not render at all.
--
-- 2. ACCOUNTING. grant_plan_credits subtracted the FULL previous grant from the
--    balance, not the unspent remainder. A subscriber holding 40 unspent plan
--    credits plus 100 purchased would lose 60 at rollover instead of 40 —
--    quietly eating 20 credits they had paid cash for.
--
--    credits_from_plan now tracks what REMAINS of the plan grant rather than
--    what was issued, so spending draws down plan credits before purchased ones
--    and a rollover removes only what is genuinely expiring.

-- Which period the current plan grant belongs to. NULL means never granted,
-- which is what makes first-use provisioning work.
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS plan_grant_period timestamptz;

-- ---------------------------------------------------------------------------
-- spend_credits — now draws down plan credits first
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
     SET credit_balance    = credit_balance - p_amount,
         -- Plan credits are consumed first because they expire; purchased ones
         -- do not. GREATEST keeps this from going negative once the plan
         -- portion is exhausted and the spend falls to purchased credits.
         credits_from_plan = GREATEST(0, credits_from_plan - p_amount)
   WHERE id = p_user_id
     AND credit_balance >= p_amount
  RETURNING credit_balance INTO v_new_balance;

  IF v_new_balance IS NULL THEN
    RETURN -1;
  END IF;

  INSERT INTO public.credit_ledger
    (user_id, delta, balance_after, reason, job_id, model_key, seconds, resolution)
  VALUES
    (p_user_id, -p_amount, v_new_balance, 'spend', p_job_id, p_model_key, p_seconds, p_resolution)
  ON CONFLICT DO NOTHING;

  RETURN v_new_balance;
END;
$$;

-- ---------------------------------------------------------------------------
-- grant_plan_credits — expire only what remains of the old grant
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.grant_plan_credits(
  p_user_id uuid,
  p_amount  integer
) RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_remaining   integer;
  v_new_balance integer;
BEGIN
  SELECT credits_from_plan INTO v_remaining FROM public.users WHERE id = p_user_id;
  IF v_remaining IS NULL THEN
    RETURN -1;
  END IF;

  -- Remove the unspent plan remainder, then add the new grant. Whatever sits
  -- below that line is purchased and survives untouched.
  UPDATE public.users
     SET credit_balance    = GREATEST(0, credit_balance - v_remaining) + p_amount,
         credits_from_plan = p_amount,
         plan_grant_period = date_trunc('month', now())
   WHERE id = p_user_id
  RETURNING credit_balance INTO v_new_balance;

  INSERT INTO public.credit_ledger
    (user_id, delta, balance_after, reason, metadata)
  VALUES
    (p_user_id, p_amount - v_remaining, v_new_balance, 'plan_grant',
     jsonb_build_object('expired_remainder', v_remaining, 'new_grant', p_amount));

  RETURN v_new_balance;
END;
$$;

REVOKE ALL ON FUNCTION public.spend_credits(uuid,integer,text,text,integer,text) FROM public, anon, authenticated;
REVOKE ALL ON FUNCTION public.grant_plan_credits(uuid,integer)                   FROM public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Provision existing paying subscribers immediately.
--
-- Without this they wait for their first render to trigger the grant. Doing it
-- here means anyone already subscribed has a usable balance the moment this
-- runs, rather than hitting "not enough credits" once more first.
-- ---------------------------------------------------------------------------

UPDATE public.users
   SET credit_balance    = credit_balance + CASE plan
         WHEN 'creator' THEN 60
         WHEN 'studio'  THEN 220
         WHEN 'pro'     THEN 700
         WHEN 'agency'  THEN 700
         ELSE 0 END,
       credits_from_plan = CASE plan
         WHEN 'creator' THEN 60
         WHEN 'studio'  THEN 220
         WHEN 'pro'     THEN 700
         WHEN 'agency'  THEN 700
         ELSE 0 END,
       plan_grant_period = date_trunc('month', now())
 WHERE plan IN ('creator', 'studio', 'pro', 'agency')
   AND plan_grant_period IS NULL;

INSERT INTO public.credit_ledger (user_id, delta, balance_after, reason, metadata)
SELECT id, credits_from_plan, credit_balance, 'plan_grant',
       jsonb_build_object('migration', '011', 'reason', 'initial provisioning')
  FROM public.users
 WHERE credits_from_plan > 0
   AND plan_grant_period = date_trunc('month', now());
