"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "Dashboard", exact: true },
  { href: "/dashboard/generate", label: "Generate", exact: false },
  { href: "/dashboard/settings", label: "Settings", exact: false },
];

export function ActiveNavLinks({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname();

  return (
    <>
      {links.map((link) => {
        const isActive = link.exact
          ? pathname === link.href
          : pathname.startsWith(link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "rounded-md text-sm font-medium transition-all duration-150",
              mobile ? "px-3 py-1.5" : "px-3 py-1.5",
              isActive
                ? "bg-violet-500/15 text-white font-semibold border border-violet-500/25 shadow-[0_0_12px_-4px_rgba(139,92,246,0.4)]"
                : "text-zinc-400 hover:text-white hover:bg-white/[0.06]"
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </>
  );
}
