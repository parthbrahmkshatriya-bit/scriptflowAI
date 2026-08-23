"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type State = "idle" | "confirm" | "sending" | "done" | "error";

interface Result {
  sent: number;
  failed: number;
  total: number;
  failures?: string[];
}

export default function BroadcastButton() {
  const [state, setState] = useState<State>("idle");
  const [result, setResult] = useState<Result | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  async function send() {
    setState("sending");
    try {
      const res = await fetch("/api/admin/broadcast", { method: "POST" });
      const data = await res.json() as Result & { error?: string };
      if (!res.ok) {
        setErrorMsg(data.error ?? "Unknown error");
        setState("error");
        return;
      }
      setResult(data);
      setState("done");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : String(err));
      setState("error");
    }
  }

  if (state === "idle") {
    return (
      <Button
        variant="outline"
        size="sm"
        className="border-violet-500/40 hover:border-violet-400 hover:bg-violet-500/10 text-violet-300"
        onClick={() => setState("confirm")}
      >
        📣 Send update email to all users
      </Button>
    );
  }

  if (state === "confirm") {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-zinc-300">Send the latest-update email to every user?</span>
        <Button size="sm" variant="outline" className="border-white/10" onClick={() => setState("idle")}>
          Cancel
        </Button>
        <Button
          size="sm"
          className="bg-violet-600 hover:bg-violet-500 text-white"
          onClick={send}
        >
          Yes, send to all
        </Button>
      </div>
    );
  }

  if (state === "sending") {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-violet-500 border-t-transparent rounded-full" />
        Sending emails… this may take a minute
      </div>
    );
  }

  if (state === "done" && result) {
    return (
      <div className="space-y-1">
        <p className="text-sm text-green-400 font-medium">
          ✓ Sent to {result.sent}/{result.total} users
          {result.failed > 0 && (
            <span className="text-amber-400 ml-2">({result.failed} failed)</span>
          )}
        </p>
        {result.failures && result.failures.length > 0 && (
          <ul className="text-xs text-zinc-500 space-y-0.5 max-h-24 overflow-y-auto">
            {result.failures.map((f, i) => <li key={i}>{f}</li>)}
          </ul>
        )}
        <button
          className="text-xs text-zinc-500 hover:text-zinc-300 underline"
          onClick={() => { setState("idle"); setResult(null); }}
        >
          Reset
        </button>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="space-y-1">
        <p className="text-sm text-red-400">✗ Broadcast failed: {errorMsg}</p>
        <button
          className="text-xs text-zinc-500 hover:text-zinc-300 underline"
          onClick={() => { setState("idle"); setErrorMsg(""); }}
        >
          Try again
        </button>
      </div>
    );
  }

  return null;
}
