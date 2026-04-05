"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Props {
  text: string;
}

export default function CopyAllButton({ text }: Props) {
  const [copied, setCopied] = useState(false);

  async function copyAll() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("All prompts copied!");
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
