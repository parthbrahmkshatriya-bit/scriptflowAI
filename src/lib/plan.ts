import type { SupabaseClient } from "@supabase/supabase-js";
import type { Plan } from "@/types/database";

export type { Plan };

export async function getUserPlan(
  supabase: SupabaseClient,
  userId: string
): Promise<Plan> {
  const { data } = await supabase
    .from("users")
    .select("plan")
    .eq("id", userId)
    .single();
  return (data?.plan as Plan) ?? "free";
}

export function canUseVoiceover(plan: Plan): boolean {
  return ["creator", "pro", "studio", "agency"].includes(plan);
}

export function canUseVideoGeneration(plan: Plan): boolean {
  return ["studio", "agency"].includes(plan);
}
