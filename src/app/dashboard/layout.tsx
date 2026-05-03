import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: {
    index: false,
    follow: false,
  },
};
import { buttonVariants } from "@/lib/button-variants";
import { Badge } from "@/components/ui/badge";
import { PLAN_LABELS } from "@/lib/constants";
import type { Plan } from "@/types/database";
import DashboardNav from "@/components/layout/DashboardNav";
import { cn } from "@/lib/utils";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("full_name, plan, scripts_used_this_month")
    .eq("id", user.id)
    .single();

  const plan = ((profile as { plan?: string } | null)?.plan ?? "free") as Plan;

  const navLinkClass = cn(buttonVariants({ variant: "ghost", size: "sm" }));

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="font-bold text-lg">
              ScriptFlow AI
            </Link>
            <nav className="hidden sm:flex items-center gap-1">
              <Link href="/dashboard" className={navLinkClass}>Dashboard</Link>
              <Link href="/dashboard/generate" className={navLinkClass}>Generate</Link>
              <Link href="/dashboard/settings" className={navLinkClass}>Settings</Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Badge
              variant={plan === "free" ? "secondary" : "default"}
              className="hidden sm:flex"
            >
              {PLAN_LABELS[plan]}
            </Badge>
            {plan === "free" && (
              <Link
                href="/dashboard/upgrade"
                className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 transition-all"
              >
                Upgrade
              </Link>
            )}
            <DashboardNav />
          </div>
        </div>
        {/* Mobile nav */}
        <div className="sm:hidden flex border-t px-4 py-2 gap-1 flex-wrap">
          <Link href="/dashboard" className={navLinkClass}>Dashboard</Link>
          <Link href="/dashboard/generate" className={navLinkClass}>Generate</Link>
          <Link href="/dashboard/settings" className={navLinkClass}>Settings</Link>
          {plan === "free" && (
            <Link href="/dashboard/upgrade" className={navLinkClass}>Upgrade</Link>
          )}
        </div>
      </header>
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">{children}</main>
    </div>
  );
}
