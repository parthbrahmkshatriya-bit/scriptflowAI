import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Sparkles, Users, MessageSquare, LayoutDashboard } from "lucide-react";

const ADMIN_EMAIL = "parth.brahmkshatriya@gmail.com";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.email !== ADMIN_EMAIL) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-[#050508] text-white">
      {/* Admin header */}
      <header className="border-b border-white/[0.07] bg-[#050508]/90 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-13 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <Link href="/" className="flex items-center gap-2 font-bold text-sm">
              <div className="size-6 rounded-md bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center">
                <Sparkles className="size-3.5 text-white" />
              </div>
              <span className="text-white/70">ScriptFlow</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-900/60 text-violet-300 font-semibold tracking-wider">ADMIN</span>
            </Link>
            <nav className="flex items-center gap-1">
              <Link href="/admin" className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs text-zinc-400 hover:text-white hover:bg-white/5 transition-colors">
                <LayoutDashboard className="w-3.5 h-3.5" /> Overview
              </Link>
              <Link href="/admin?tab=users" className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs text-zinc-400 hover:text-white hover:bg-white/5 transition-colors">
                <Users className="w-3.5 h-3.5" /> Users
              </Link>
              <Link href="/admin?tab=feedback" className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs text-zinc-400 hover:text-white hover:bg-white/5 transition-colors">
                <MessageSquare className="w-3.5 h-3.5" /> Feedback
              </Link>
            </nav>
          </div>
          <span className="text-[11px] text-zinc-600">{user.email}</span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}
