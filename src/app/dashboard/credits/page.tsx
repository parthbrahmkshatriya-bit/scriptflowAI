import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import BuyCreditsClient from "@/components/credits/BuyCreditsClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Buy Video Credits — ScriptFlow AI" };
export const dynamic = "force-dynamic";

export default async function CreditsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("users")
    .select("video_credits, plan, videos_used_this_month")
    .eq("id", user.id)
    .single();

  const videoCredits = (profile?.video_credits as number) ?? 0;
  const plan = (profile?.plan as string) ?? "free";
  const videosUsed = (profile?.videos_used_this_month as number) ?? 0;

  const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? "";

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Buy Video Credits</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Credits are used when your monthly plan limit is reached. They never expire.
        </p>
      </div>
      <BuyCreditsClient
        videoCredits={videoCredits}
        plan={plan}
        videosUsed={videosUsed}
        paypalClientId={paypalClientId}
      />
    </div>
  );
}
