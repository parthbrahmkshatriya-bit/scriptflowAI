"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import {
  DURATION_OPTIONS,
  PLATFORM_OPTIONS,
  VISUAL_STYLE_OPTIONS,
  AI_TOOL_OPTIONS,
  MAX_CONCEPT_LENGTH,
  PLAN_LIMITS,
  PLAN_LABELS,
} from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import type { VideoDuration, Platform, VisualStyle, AiTool, Plan } from "@/types/database";

const PREFS_KEY = "scriptflow_generate_prefs";

interface Prefs {
  platform: Platform;
  visual_style: VisualStyle;
  ai_tool: AiTool;
}

interface UsageData {
  used: number;
  limit: number;
  plan: Plan;
}

export default function GeneratePage() {
  const router = useRouter();
  const [concept, setConcept] = useState("");
  const [duration, setDuration] = useState<VideoDuration>("30s");
  const [platform, setPlatform] = useState<Platform>("youtube_shorts");
  const [visualStyle, setVisualStyle] = useState<VisualStyle>("cinematic");
  const [aiTool, setAiTool] = useState<AiTool>("veo3");
  const [loading, setLoading] = useState(false);
  const [usage, setUsage] = useState<UsageData | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase
        .from("users")
        .select("plan, scripts_used_this_month")
        .eq("id", user.id)
        .single()
        .then(({ data }) => {
          if (data) {
            const plan = (data.plan ?? "free") as Plan;
            setUsage({
              used: data.scripts_used_this_month ?? 0,
              limit: PLAN_LIMITS[plan],
              plan,
            });
          }
        });
    });
  }, []);

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
    const prefs: Prefs = { platform, visual_style: visualStyle, ai_tool: aiTool };
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
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
            action: { label: "Upgrade", onClick: () => router.push("/dashboard/upgrade") },
          });
        } else if (res.status === 429) {
          toast.error("Too many requests. Please wait a minute.");
        } else {
          toast.error(data.error ?? "Generation failed. Please try again.");
        }
        return;
      }
      toast.success("Script generated successfully!");
      router.push(`/dashboard/script/${data.script_id}`);
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const charsLeft = useMemo(() => MAX_CONCEPT_LENGTH - concept.length, [concept]);
  const usagePct = usage && usage.limit !== Infinity
    ? Math.min((usage.used / usage.limit) * 100, 100)
    : 0;
  const isAtLimit = usage ? usage.limit !== Infinity && usage.used >= usage.limit : false;

  return (
    <div className="max-w-2xl mx-auto space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Generate Script</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Describe your video idea and get a production-ready script in seconds
        </p>
      </div>

      {/* Usage counter */}
      {usage && (
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-400">Scripts used this month</span>
            <span className={`font-semibold tabular-nums ${isAtLimit ? "text-red-400" : "text-white"}`}>
              {usage.used}&thinsp;/&thinsp;{usage.limit === Infinity ? "∞" : usage.limit}
            </span>
          </div>
          {usage.limit !== Infinity && (
            <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  usagePct >= 100 ? "bg-red-500" : usagePct >= 70 ? "bg-amber-500" : "bg-gradient-to-r from-violet-500 to-blue-500"
                }`}
                style={{ width: `${usagePct}%` }}
              />
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-500">
              {PLAN_LABELS[usage.plan]} plan · Resets 1st of each month
            </span>
            {isAtLimit && (
              <button
                type="button"
                onClick={() => router.push("/dashboard/upgrade")}
                className="text-xs text-violet-400 hover:text-violet-300 font-medium transition-colors"
              >
                Upgrade →
              </button>
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleGenerate} className="space-y-6">

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
          <div className={`text-xs text-right ${charsLeft < 50 ? "text-destructive" : "text-muted-foreground"}`}>
            {charsLeft} characters remaining
          </div>
        </div>

        {/* Duration */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Duration</Label>
          <RadioGroup
            value={duration}
            onValueChange={(v) => setDuration(v as VideoDuration)}
            className="grid grid-cols-3 gap-3"
          >
            {DURATION_OPTIONS.map((opt) => (
              <div key={opt.value}>
                <RadioGroupItem value={opt.value} id={`dur-${opt.value}`} className="sr-only" />
                <Label
                  htmlFor={`dur-${opt.value}`}
                  className={`flex flex-col items-center justify-center rounded-xl border-2 p-3 cursor-pointer transition-all text-center select-none ${
                    duration === opt.value
                      ? "border-violet-500 bg-violet-500/10 text-white shadow-[0_0_0_1px_rgba(139,92,246,0.3)]"
                      : "border-border hover:border-violet-500/40 hover:bg-white/[0.04]"
                  }`}
                >
                  <span className="font-semibold">{opt.label}</span>
                  <span className="text-xs text-muted-foreground mt-0.5">{opt.scenes}</span>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Platform */}
        <div className="space-y-2">
          <Label className="text-base font-semibold">Platform</Label>
          <Select value={platform} onValueChange={(v) => setPlatform(v as Platform)}>
            <SelectTrigger className="w-full">
              <span className="flex-1 text-sm text-left">
                {PLATFORM_OPTIONS.find((p) => p.value === platform)?.label ?? "Select platform"}
              </span>
            </SelectTrigger>
            <SelectContent>
              {PLATFORM_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Visual Style */}
        <div className="space-y-2">
          <Label className="text-base font-semibold">Visual style</Label>
          <Select value={visualStyle} onValueChange={(v) => setVisualStyle(v as VisualStyle)}>
            <SelectTrigger className="w-full">
              <span className="flex-1 text-sm text-left">
                {VISUAL_STYLE_OPTIONS.find((s) => s.value === visualStyle)?.label ?? "Select style"}
              </span>
            </SelectTrigger>
            <SelectContent>
              {VISUAL_STYLE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* AI Tool */}
        <div className="space-y-2">
          <Label className="text-base font-semibold">AI tool</Label>
          <Select value={aiTool} onValueChange={(v) => setAiTool(v as AiTool)}>
            <SelectTrigger className="w-full">
              <span className="flex-1 text-sm text-left">
                {AI_TOOL_OPTIONS.find((t) => t.value === aiTool)?.label ?? "Select tool"}
              </span>
            </SelectTrigger>
            <SelectContent>
              {AI_TOOL_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Selection summary */}
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="secondary">{duration}</Badge>
          <Badge variant="outline">{PLATFORM_OPTIONS.find((p) => p.value === platform)?.label}</Badge>
          <Badge variant="outline">{VISUAL_STYLE_OPTIONS.find((s) => s.value === visualStyle)?.label}</Badge>
          <Badge variant="outline">{AI_TOOL_OPTIONS.find((t) => t.value === aiTool)?.label}</Badge>
        </div>

        {/* Generate button */}
        <button
          type="submit"
          disabled={loading || concept.trim().length < 10 || isAtLimit}
          className="w-full py-4 rounded-xl text-base font-semibold text-white bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 hover:from-violet-500 hover:via-purple-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/50 hover:scale-[1.015] active:scale-[0.99] flex items-center justify-center gap-2.5"
        >
          {loading ? (
            <>
              <span className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              Generating your script…
            </>
          ) : (
            <>
              <Sparkles className="size-5" />
              Generate Script
            </>
          )}
        </button>

      </form>
    </div>
  );
}
