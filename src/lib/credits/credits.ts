import type { SupabaseClient } from "@supabase/supabase-js";
import { PLAN_VIDEO_CREDITS } from "@/lib/constants";

/**
 * Credit operations.
 *
 * Every balance movement goes through a SECURITY DEFINER function in migration
 * 010 rather than an UPDATE from here. That matters for two reasons: the spend
 * is a single atomic statement so concurrent renders cannot both draw on the
 * same balance, and each movement writes a ledger row in the same transaction,
 * so a balance can always be reconciled against its history.
 */

/** Returned when the caller cannot afford the render. */
export const INSUFFICIENT = -1;

export interface SpendResult {
  ok: boolean;
  /** Balance after the spend, or the unchanged balance when it failed. */
  balance: number;
  /** True when the schema is not migrated yet — treated as "let it through". */
  unavailable?: boolean;
}

export async function spendCredits(
  admin: SupabaseClient,
  opts: {
    userId: string;
    amount: number;
    jobId?: string | null;
    modelKey?: string | null;
    seconds?: number | null;
    resolution?: string | null;
  }
): Promise<SpendResult> {
  const { data, error } = await admin.rpc("spend_credits", {
    p_user_id: opts.userId,
    p_amount: opts.amount,
    p_job_id: opts.jobId ?? null,
    p_model_key: opts.modelKey ?? null,
    p_seconds: opts.seconds ?? null,
    p_resolution: opts.resolution ?? null,
  });

  if (error) {
    // Migration 010 not applied. Fall back to the legacy counters rather than
    // blocking every render on a schema the environment has not received yet.
    console.warn("[credits] spend_credits unavailable:", error.message);
    return { ok: true, balance: 0, unavailable: true };
  }

  const balance = typeof data === "number" ? data : INSUFFICIENT;
  return { ok: balance !== INSUFFICIENT, balance };
}

/**
 * Return credits for a render that never produced a video.
 *
 * Safe to call more than once for the same job: the ledger's unique index makes
 * a second refund a no-op, so a retried webhook cannot mint credits.
 */
export async function refundCredits(
  admin: SupabaseClient,
  userId: string,
  jobId: string,
  note?: string
): Promise<number | null> {
  const { data, error } = await admin.rpc("refund_credits", {
    p_user_id: userId,
    p_job_id: jobId,
    p_note: note ?? null,
  });
  if (error) {
    console.warn("[credits] refund failed:", error.message);
    return null;
  }
  return typeof data === "number" ? data : null;
}

/**
 * Set the plan allowance for a new period.
 *
 * Replaces the previous grant rather than adding to it, so unused plan credits
 * expire while purchased credits survive.
 */
export async function grantPlanCredits(
  admin: SupabaseClient,
  userId: string,
  plan: string
): Promise<number | null> {
  const amount = PLAN_VIDEO_CREDITS[plan] ?? 0;
  const { data, error } = await admin.rpc("grant_plan_credits", {
    p_user_id: userId,
    p_amount: amount,
  });
  if (error) {
    console.warn("[credits] plan grant failed:", error.message);
    return null;
  }
  return typeof data === "number" ? data : null;
}

export async function addPurchasedCredits(
  admin: SupabaseClient,
  userId: string,
  amount: number,
  ref?: string
): Promise<number | null> {
  const { data, error } = await admin.rpc("add_purchased_credits", {
    p_user_id: userId,
    p_amount: amount,
    p_ref: ref ?? null,
  });
  if (error) {
    console.warn("[credits] purchase failed:", error.message);
    return null;
  }
  return typeof data === "number" ? data : null;
}
