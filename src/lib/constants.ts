import type { Plan, VideoDuration, Platform, VisualStyle, AiTool } from "@/types/database";

export const PLAN_LIMITS: Record<Plan, number> = {
  free: 3,
  creator: 30,
  pro: Infinity,
};

export const PLAN_LABELS: Record<Plan, string> = {
  free: "Free",
  creator: "Creator",
  pro: "Pro",
};

export const PRICING_USD: Record<Exclude<Plan, "free">, number> = {
  creator: 9,
  pro: 19,
};

export const PRICING_INR: Record<Exclude<Plan, "free">, number> = {
  creator: 199,
  pro: 499,
};

export const DURATION_OPTIONS: { value: VideoDuration; label: string; scenes: string }[] = [
  { value: "15s", label: "15 seconds", scenes: "3–4 scenes" },
  { value: "30s", label: "30 seconds", scenes: "5–7 scenes" },
  { value: "60s", label: "60 seconds", scenes: "8–12 scenes" },
];

export const PLATFORM_OPTIONS: { value: Platform; label: string }[] = [
  { value: "youtube_shorts", label: "YouTube Shorts" },
  { value: "instagram_reels", label: "Instagram Reels" },
  { value: "tiktok", label: "TikTok" },
];

export const VISUAL_STYLE_OPTIONS: { value: VisualStyle; label: string }[] = [
  { value: "cinematic", label: "Cinematic" },
  { value: "cartoon", label: "Cartoon" },
  { value: "realistic", label: "Realistic" },
  { value: "minimal", label: "Minimal" },
  { value: "anime", label: "Anime" },
];

export const AI_TOOL_OPTIONS: { value: AiTool; label: string }[] = [
  { value: "veo3", label: "VEO 3" },
  { value: "kling", label: "Kling 2.0" },
  { value: "runway", label: "Runway Gen-4" },
  { value: "pika", label: "Pika 2.0" },
  { value: "midjourney", label: "Midjourney" },
  { value: "generic", label: "Generic (Universal)" },
];

export const PLATFORM_LABELS: Record<Platform, string> = {
  youtube_shorts: "YouTube Shorts",
  instagram_reels: "Instagram Reels",
  tiktok: "TikTok",
};

export const VISUAL_STYLE_LABELS: Record<VisualStyle, string> = {
  cinematic: "Cinematic",
  cartoon: "Cartoon",
  realistic: "Realistic",
  minimal: "Minimal",
  anime: "Anime",
};

export const AI_TOOL_LABELS: Record<AiTool, string> = {
  veo3: "VEO 3",
  kling: "Kling 2.0",
  runway: "Runway Gen-4",
  pika: "Pika 2.0",
  midjourney: "Midjourney",
  generic: "Generic",
};

export const MAX_CONCEPT_LENGTH = 500;
export const RATE_LIMIT_PER_MINUTE = 5;
export const CLAUDE_MODEL = "claude-haiku-4-5-20251001";
