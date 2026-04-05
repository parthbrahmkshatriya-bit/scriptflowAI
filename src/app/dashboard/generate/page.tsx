"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  DURATION_OPTIONS,
  PLATFORM_OPTIONS,
  VISUAL_STYLE_OPTIONS,
  AI_TOOL_OPTIONS,
  MAX_CONCEPT_LENGTH,
} from "@/lib/constants";
import type { VideoDuration, Platform, VisualStyle, AiTool } from "@/types/database";

const PREFS_KEY = "scriptflow_generate_prefs";

interface Prefs {
  platform: Platform;
  visual_style: VisualStyle;
  ai_tool: AiTool;
}

export default function GeneratePage() {
  const router = useRouter();
  const [concept, setConcept] = useState("");
  const [duration, setDuration] = useState<VideoDuration>("30s");
  const [platform, setPlatform] = useState<Platform>("youtube_shorts");
  const [visualStyle, setVisualStyle] = useState<VisualStyle>("cinematic");
  const [aiTool, setAiTool] = useState<AiTool>("veo3");
  const [loading, setLoading] = useState(false);

  // Load saved preferences
  useEffect(() => {
    try {
      const saved = localStorage.getItem(PREFS_KEY);
      if (saved) {
        const prefs: Prefs = JSON.parse(saved);
        if (prefs.platform) setPlatform(prefs.platform);
        if (prefs.visual_style) setVisualStyle(prefs.visual_style);
        if (prefs.ai_tool) setAiTool(prefs.ai_tool);
      }
    } catch {
      // ignore
    }
  }, []);

  function savePrefs() {
    try {
      const prefs: Prefs = { platform, visual_style: visualStyle, ai_tool: aiTool };
      localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    } catch {
      // ignore
    }
  }

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();

    if (concept.trim().length < 10) {
      toast.error("Please enter a concept of at least 10 characters");
      return;
    }

    setLoading(true);
    savePrefs();

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          concept: concept.trim(),
          duration,
          platform,
          visual_style: visualStyle,
          ai_tool: aiTool,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 403) {
          toast.error("Monthly script limit reached. Upgrade your plan to continue.", {
            action: {
              label: "Upgrade",
              onClick: () => router.push("/dashboard/settings"),
            },
          });
        } else if (res.status === 429) {
          toast.error("Too many requests. Please wait a minute.");
        } else {
          toast.error(data.error ?? "Generation failed. Please try again.");
        }
        return;
      }

      toast.success("Script generated!");
      router.push(`/dashboard/script/${data.script_id}`);
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const charsLeft = MAX_CONCEPT_LENGTH - concept.length;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Generate Script</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Describe your video idea and get a production-ready script in seconds
        </p>
      </div>

      <form onSubmit={handleGenerate} className="space-y-5">
        {/* Concept */}
        <div className="space-y-2">
          <Label htmlFor="concept" className="text-base font-semibold">
            Video concept
          </Label>
          <Textarea
            id="concept"
            placeholder="e.g. A time-lapse of a seed growing into a towering oak tree showing the beauty of nature..."
            value={concept}
            onChange={(e) => setConcept(e.target.value)}
            maxLength={MAX_CONCEPT_LENGTH}
            rows={4}
            className="resize-none"
            required
          />
          <div
            className={`text-xs text-right ${charsLeft < 50 ? "text-destructive" : "text-muted-foreground"}`}
          >
            {charsLeft} characters remaining
          </div>
        </div>

        {/* Duration */}
        <div className="space-y-2">
          <Label className="text-base font-semibold">Duration</Label>
          <RadioGroup
            value={duration}
            onValueChange={(v) => setDuration(v as VideoDuration)}
            className="grid grid-cols-3 gap-3"
          >
            {DURATION_OPTIONS.map((opt) => (
              <div key={opt.value}>
                <RadioGroupItem
                  value={opt.value}
                  id={`duration-${opt.value}`}
                  className="sr-only"
                />
                <Label
                  htmlFor={`duration-${opt.value}`}
                  className={`flex flex-col items-center justify-center rounded-lg border p-3 cursor-pointer transition-colors text-center ${
                    duration === opt.value
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <span className="font-semibold">{opt.label}</span>
                  <span className="text-xs text-muted-foreground mt-0.5">
                    {opt.scenes}
                  </span>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Platform + Style + AI Tool */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Platform</Label>
            <Select value={platform} onValueChange={(v) => setPlatform(v as Platform)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PLATFORM_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold">Visual style</Label>
            <Select
              value={visualStyle}
              onValueChange={(v) => setVisualStyle(v as VisualStyle)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {VISUAL_STYLE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold">AI tool</Label>
            <Select value={aiTool} onValueChange={(v) => setAiTool(v as AiTool)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AI_TOOL_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Summary + Submit */}
        <Card className="bg-muted/40">
          <CardContent className="px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex flex-wrap gap-1.5">
              <Badge variant="secondary">{duration}</Badge>
              <Badge variant="outline">
                {PLATFORM_OPTIONS.find((p) => p.value === platform)?.label}
              </Badge>
              <Badge variant="outline">
                {VISUAL_STYLE_OPTIONS.find((s) => s.value === visualStyle)?.label}
              </Badge>
              <Badge variant="outline">
                {AI_TOOL_OPTIONS.find((t) => t.value === aiTool)?.label}
              </Badge>
            </div>
            <Button
              type="submit"
              size="lg"
              disabled={loading || concept.trim().length < 10}
              className="min-w-36"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                  Generating...
                </span>
              ) : (
                "Generate Script"
              )}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
