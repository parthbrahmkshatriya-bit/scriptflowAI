import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { PLAN_LABELS } from "@/lib/constants";
import type { Plan } from "@/types/database";
import DashboardNav from "@/components/layout/DashboardNav";
import { ActiveNavLinks } from "@/components/layout/ActiveNavLinks";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("full_name, plan, scripts_used_this_month")
    .eq("id", user.id)
    .single();

  const plan = ((profile as { plan?: string } | null)?.plan ?? "free") as Plan;
  const fullName = (profile as { full_name?: string | null } | null)?.full_name ?? null;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-white/[0.07] bg-[#050508]/90 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">

          {/* Left: logo + nav */}
          <div className="flex items-center gap-5">
            {/* Logo → links to landing page */}
            <Link href="/" className="flex items-center gap-2 font-bold text-base group">
              <div className="size-6 rounded-md bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center shadow-md shadow-violet-500/30 group-hover:shadow-violet-500/50 transition-shadow">
                <Sparkles className="size-3.5 text-white" />
              </div>
              <span className="text-white">ScriptFlow AI</span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden sm:flex items-center gap-1">
              <ActiveNavLinks />
            </nav>
          </div>

          {/* Right: plan badge + upgrade + account */}
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
                className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 hover:scale-[1.02] transition-all duration-150 shadow shadow-violet-500/25"
              >
                Upgrade
              </Link>
            )}
            <DashboardNav fullName={fullName} email={user.email} />
          </div>
        </div>

        {/* Mobile nav */}
        <div className="sm:hidden flex border-t border-white/[0.06] px-4 py-2 gap-1 flex-wrap">
          <ActiveNavLinks mobile />
          {plan === "free" && (
            <Link
              href="/dashboard/upgrade"
              className="px-3 py-1.5 rounded-md text-sm font-medium text-violet-400 hover:text-white hover:bg-violet-500/10 transition-all duration-150"
            >
              Upgrade
            </Link>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6 page-enter">
        {children}
      </main>
    </div>
  );
}
