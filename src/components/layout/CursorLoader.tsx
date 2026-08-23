"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";

export default function CursorLoader() {
  const pathname = usePathname();
  const prevPath = useRef(pathname);
  const [loading, setLoading] = useState(false);
  const [pos, setPos] = useState({ x: -999, y: -999 });

  // Track live mouse position so the spinner is always near the cursor
  useEffect(() => {
    const onMove = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  // Detect clicks on internal <a> links → show spinner
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const anchor = (e.target as Element).closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href) return;
      // Only trigger for same-origin, non-download, non-hash links
      const isExternal = href.startsWith("http") && !href.startsWith(window.location.origin);
      const isHash = href.startsWith("#");
      const isDownload = anchor.hasAttribute("download");
      if (isExternal || isHash || isDownload) return;

      setPos({ x: e.clientX, y: e.clientY });
      setLoading(true);
      document.body.style.cursor = "wait";
    };

    // Also listen for the manual dispatch event (used by generate form, etc.)
    const onNavStart = (e: Event) => {
      const ce = e as CustomEvent<{ x?: number; y?: number }>;
      if (ce.detail?.x !== undefined && ce.detail?.y !== undefined) {
        setPos({ x: ce.detail.x, y: ce.detail.y });
      }
      setLoading(true);
      document.body.style.cursor = "wait";
    };

    window.addEventListener("click", onClick, true);
    window.addEventListener("__nav_start", onNavStart);
    return () => {
      window.removeEventListener("click", onClick, true);
      window.removeEventListener("__nav_start", onNavStart);
    };
  }, []);

  // Hide when the route actually changes (navigation complete)
  useEffect(() => {
    if (pathname !== prevPath.current) {
      prevPath.current = pathname;
      setLoading(false);
      document.body.style.cursor = "";
    }
  }, [pathname]);

  // Also hide after 8s max so it never gets stuck
  useEffect(() => {
    if (!loading) return;
    const t = setTimeout(() => {
      setLoading(false);
      document.body.style.cursor = "";
    }, 8000);
    return () => clearTimeout(t);
  }, [loading]);

  if (!loading) return null;

  return (
    <div
      className="fixed z-[9999] pointer-events-none"
      style={{ left: pos.x + 14, top: pos.y + 14 }}
    >
      <div className="size-5 rounded-full border-[2.5px] border-violet-500 border-t-transparent animate-spin shadow-[0_0_8px_rgba(124,58,237,0.6)]" />
    </div>
  );
}
