import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { PLAN_LABELS, PLAN_LIMITS } from "@/lib/constants";
import type { Plan } from "@/types/database";
import ProfileForm from "@/components/settings/ProfileForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  const plan = (profile?.plan ?? "free") as Plan;
  const used = profile?.scripts_used_this_month ?? 0;
  const limit = PLAN_LIMITS[plan];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your account and subscription
        </p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Update your display name</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm
            userId={user.id}
            initialName={profile?.full_name ?? ""}
            email={user.email ?? ""}
          />
        </CardContent>
      </Card>

      {/* Subscription */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
          <CardDescription>Your current plan and usage</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-lg">{PLAN_LABELS[plan]} Plan</span>
                <Badge variant={plan === "free" ? "secondary" : "default"}>
                  {plan === "free" ? "Free" : "Active"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                {used} of {limit === Infinity ? "unlimited" : limit} scripts used this month
              </p>
              {profile?.subscription_ends_at && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  Renews{" "}
                  {new Date(profile.subscription_ends_at).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              )}
            </div>
            {plan !== "agency" && (
              <Link
                href="/dashboard/upgrade"
                className="shrink-0 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Upgrade Plan
              </Link>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            Deleting your account will permanently remove all your scripts and data.
            This cannot be undone.
          </p>
          <p className="text-sm text-muted-foreground">
            To delete your account, contact{" "}
            <a href="mailto:support@scriptflow.ai" className="text-primary hover:underline">
              support@scriptflow.ai
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
