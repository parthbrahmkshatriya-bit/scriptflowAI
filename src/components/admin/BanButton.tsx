"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  userId: string;
  isBanned: boolean;
  banReason?: string | null;
}

export default function BanButton({ userId, isBanned, banReason }: Props) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "confirm" | "working">("idle");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  async function ban() {
    setState("working");
    setError("");
    const res = await fetch("/api/admin/ban", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, reason: reason || undefined }),
    });
    if (!res.ok) {
      const d = await res.json() as { error?: string };
      setError(d.error ?? "Failed");
      setState("confirm");
      return;
    }
    router.refresh();
    setState("idle");
  }

  async function unban() {
    setState("working");
    setError("");
    const res = await fetch("/api/admin/ban", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    if (!res.ok) {
      const d = await res.json() as { error?: string };
      setError(d.error ?? "Failed");
      setState("idle");
      return;
    }
    router.refresh();
    setState("idle");
  }

  if (isBanned) {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs bg-red-900/40 text-red-300 px-2 py-1 rounded-full font-medium">
          Banned{banReason ? `: ${banReason}` : ""}
        </span>
        <button
          onClick={unban}
          disabled={state === "working"}
          className="text-xs text-zinc-400 hover:text-white underline disabled:opacity-50"
        >
          {state === "working" ? "Lifting ban…" : "Lift ban"}
        </button>
        {error && <span className="text-xs text-red-400">{error}</span>}
      </div>
    );
  }

  if (state === "idle") {
    return (
      <button
        onClick={() => setState("confirm")}
        className="text-xs text-red-400 hover:text-red-300 underline"
      >
        Ban user
      </button>
    );
  }

  if (state === "confirm") {
    return (
      <div className="flex flex-col gap-2">
        <input
          type="text"
          placeholder="Reason (optional)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="text-xs px-2 py-1 rounded border border-white/10 bg-zinc-900 text-white w-48"
          onKeyDown={(e) => { if (e.key === "Enter") ban(); if (e.key === "Escape") setState("idle"); }}
          autoFocus
        />
        <div className="flex gap-2 items-center">
          <button
            onClick={ban}
            className="text-xs px-3 py-1 rounded bg-red-700 hover:bg-red-600 text-white font-medium"
          >
            Confirm ban
          </button>
          <button
            onClick={() => { setState("idle"); setReason(""); setError(""); }}
            className="text-xs text-zinc-500 hover:text-zinc-300"
          >
            Cancel
          </button>
        </div>
        {error && <span className="text-xs text-red-400">{error}</span>}
      </div>
    );
  }

  return (
    <span className="text-xs text-zinc-500 animate-pulse">Working…</span>
  );
}
