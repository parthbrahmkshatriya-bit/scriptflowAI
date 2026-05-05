import { z } from "zod";

const SPAM_PATTERNS = [
  /^[\s]+$/,                    // whitespace only
  /^[^a-zA-Z0-9\s]{5,}$/,      // only special characters
  /^(.)\1{9,}$/,                // same character repeated 10+ times
  /^(https?|www\.)\S+$/i,       // bare URL only
];

export const generateSchema = z.object({
  concept: z
    .string()
    .min(10, "Concept must be at least 10 characters")
    .max(500, "Concept must be 500 characters or less")
    .refine(
      (val) => val.trim().length >= 10,
      "Concept cannot be blank or whitespace"
    )
    .refine(
      (val) => /[a-zA-Z]/.test(val),
      "Concept must contain at least some readable text"
    )
    .refine(
      (val) => !SPAM_PATTERNS.some((p) => p.test(val.trim())),
      "Concept contains invalid content"
    ),
  duration: z.enum(["15s", "30s", "60s"]),
  platform: z.enum(["youtube_shorts", "instagram_reels", "tiktok"]),
  visual_style: z.enum(["cinematic", "cartoon", "realistic", "minimal", "anime"]),
  ai_tool: z.enum(["veo3", "kling", "runway", "pika", "midjourney", "generic"]),
  image_base64: z.string().max(7_500_000).optional().nullable(),
  image_purpose: z.enum(["visual_reference", "product_ad"]).optional().nullable(),
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
