import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import BuyCreditsClient from "@/components/credits/BuyCreditsClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Buy Credits — ScriptFlow AI" };
export const dynamic = "force-dynamic";

export default async function CreditsPage() {
  const user = await getAuthUser();
  if (!user) redirect("/login");

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("users")
    .select("credit_balance")
    .eq("id", user.id)
    .single();

  const creditBalance = (profile?.credit_balance as number) ?? 0;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Buy Credits</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Purchased credits top up your monthly allowance and never expire.
        </p>
      </div>
      <BuyCreditsClient creditBalance={creditBalance} />
    </div>
  );
}
