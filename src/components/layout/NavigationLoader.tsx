"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import LoadingDoodle from "@/components/ui/LoadingDoodle";

export default function NavigationLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [visible, setVisible] = useState(false);
  const [prevPath, setPrevPath] = useState(pathname);

  useEffect(() => {
    if (pathname !== prevPath) {
      // Route settled — hide
      setVisible(false);
      setPrevPath(pathname);
    }
  }, [pathname, searchParams, prevPath]);

  // Expose a trigger so Link clicks can show the loader
  useEffect(() => {
    function onStart() { setVisible(true); }
    window.addEventListener("__nav_start", onStart);
    return () => window.removeEventListener("__nav_start", onStart);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-[#050508]/80 backdrop-blur-sm flex items-center justify-center">
      <LoadingDoodle title="Loading…" subtitle="Just a moment" size="lg" />
    </div>
  );
}
