"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, Settings, LogOut } from "lucide-react";
import { toast } from "sonner";

interface Props {
  fullName?: string | null;
  email?: string;
}

export default function DashboardNav({ fullName, email }: Props) {
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Signed out successfully");
      router.push("/");
      router.refresh();
    }
  }

  const initials = fullName
    ? fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : email?.[0]?.toUpperCase() ?? "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 px-2 hover:bg-white/[0.07]"
          >
            {/* Avatar circle */}
            <div className="size-7 rounded-full bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center text-[11px] font-bold text-white shadow shadow-violet-500/30">
              {initials}
            </div>
            <span className="hidden sm:block text-sm text-zinc-300 max-w-[90px] truncate">
              {fullName?.split(" ")[0] ?? "Account"}
            </span>
          </Button>
        }
      />

      <DropdownMenuContent align="end" className="w-56">
        {/* Profile header */}
        {(fullName || email) && (
          <>
            <div className="px-3 py-2.5 flex items-center gap-2.5">
              <div className="size-8 rounded-full bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                {initials}
              </div>
              <div className="min-w-0">
                {fullName && (
                  <p className="text-sm font-semibold truncate leading-tight">{fullName}</p>
                )}
                {email && (
                  <p className="text-xs text-muted-foreground truncate leading-tight">{email}</p>
                )}
              </div>
            </div>
            <DropdownMenuSeparator />
          </>
        )}

        <DropdownMenuItem
          onClick={() => router.push("/dashboard")}
          className="gap-2 cursor-pointer"
        >
          <User className="size-4 text-muted-foreground" />
          Dashboard
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => router.push("/dashboard/settings")}
          className="gap-2 cursor-pointer"
        >
          <Settings className="size-4 text-muted-foreground" />
          Settings
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleSignOut}
          className="gap-2 cursor-pointer text-destructive focus:text-destructive"
        >
          <LogOut className="size-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
