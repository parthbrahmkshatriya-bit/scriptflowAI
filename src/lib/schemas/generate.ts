import { z } from "zod";

export const generateSchema = z.object({
  concept: z
    .string()
    .min(10, "Concept must be at least 10 characters")
    .max(500, "Concept must be 500 characters or less"),
  duration: z.enum(["15s", "30s", "60s"]),
  platform: z.enum(["youtube_shorts", "instagram_reels", "tiktok"]),
  visual_style: z.enum(["cinematic", "cartoon", "realistic", "minimal", "anime"]),
  ai_tool: z.enum(["veo3", "kling", "runway", "pika", "midjourney", "generic"]),
});

export type GenerateInput = z.infer<typeof generateSchema>;

export const sceneOutputSchema = z.object({
  scene_number: z.number().int().positive(),
  duration_seconds: z.number().int().positive(),
  visual_description: z.string().min(1),
  camera_direction: z.string().min(1),
  voiceover_text: z.string().nullable(),
  onscreen_text: z.string().nullable(),
  ai_generation_prompt: z.string().min(1),
  suggested_music: z.string().nullable(),
  transition: z.enum(["cut", "fade", "swipe", "zoom", "dissolve"]).nullable(),
});

export const scriptOutputSchema = z.object({
  title: z.string().min(1),
  scenes: z.array(sceneOutputSchema).min(1).max(15),
});

export type ScriptOutput = z.infer<typeof scriptOutputSchema>;
