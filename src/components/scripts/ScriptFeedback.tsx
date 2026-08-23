"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ThumbsUp, ThumbsDown } from "lucide-react";

interface Props {
  scriptId: string;
  sceneId?: string;
  type: "script" | "video";
  label?: string;
}

type State = "idle" | "negative_comment" | "done";

export default function ScriptFeedback({ scriptId, sceneId, type, label }: Props) {
  const [state, setState] = useState<State>("idle");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [chosen, setChosen] = useState<1 | -1 | null>(null);

  async function submit(rating: 1 | -1, commentText?: string) {
    setSubmitting(true);
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          script_id: scriptId,
          scene_id: sceneId ?? null,
          type,
          rating,
          comment: commentText?.trim() || null,
        }),
      });
      setState("done");
    } catch {
      toast.error("Couldn't save feedback — try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleThumb(rating: 1 | -1) {
    setChosen(rating);
    if (rating === 1) {
      await submit(1);
    } else {
      setState("negative_comment");
    }
  }

  if (state === "done") {
    return (
      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
        <span className="text-green-400">✓</span> Thanks for the feedback!
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground">
          {label ?? (type === "script" ? "Was this script helpful?" : "How's the video quality?")}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleThumb(1)}
            disabled={submitting || state === "negative_comment"}
            className={`p-1.5 rounded-md transition-colors hover:bg-white/10 disabled:opacity-50 ${
              chosen === 1 ? "text-green-400" : "text-muted-foreground hover:text-white"
            }`}
            aria-label="Thumbs up"
          >
            <ThumbsUp className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleThumb(-1)}
            disabled={submitting}
            className={`p-1.5 rounded-md transition-colors hover:bg-white/10 disabled:opacity-50 ${
              chosen === -1 ? "text-red-400" : "text-muted-foreground hover:text-white"
            }`}
            aria-label="Thumbs down"
          >
            <ThumbsDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {state === "negative_comment" && (
        <div className="flex gap-2 items-start">
          <input
            autoFocus
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit(-1, comment);
              }
              if (e.key === "Escape") setState("done");
            }}
            placeholder="What went wrong? (optional)"
            className="flex-1 bg-white/5 border border-white/10 rounded-md px-3 py-1.5 text-xs outline-none focus:border-white/25 text-zinc-300 placeholder:text-zinc-600"
          />
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs shrink-0"
            onClick={() => submit(-1, comment)}
            disabled={submitting}
          >
            {submitting ? "…" : "Send"}
          </Button>
          <button
            onClick={() => setState("done")}
            className="text-xs text-muted-foreground hover:text-white transition-colors self-center"
          >
            Skip
          </button>
        </div>
      )}
    </div>
  );
}
