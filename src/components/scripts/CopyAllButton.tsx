"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { trackScriptEvent } from "@/lib/analytics/track";

interface Props {
  text: string;
  scriptId?: string;
  aiTool?: string;
  sceneCount?: number;
}

export default function CopyAllButton({ text, scriptId, aiTool, sceneCount }: Props) {
  const [copied, setCopied] = useState(false);

  function recordCopy() {
    trackScriptEvent("all_prompts_copied", {
      script_id: scriptId ?? null,
      ai_tool: aiTool ?? null,
      metadata: sceneCount ? { scene_count: sceneCount } : undefined,
    });
  }

  async function copyAll() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("All prompts copied!");
      recordCopy();
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      toast.success("All prompts copied!");
      recordCopy();
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <Button
      size="sm"
      variant={copied ? "default" : "outline"}
      onClick={copyAll}
    >
      {copied ? "Copied all!" : "Copy All Prompts"}
    </Button>
  );
}
