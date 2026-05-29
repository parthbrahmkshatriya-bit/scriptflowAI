import type { AiTool, VisualStyle, VideoDuration, Platform } from "@/types/database";

const TOOL_INSTRUCTIONS: Record<AiTool, string> = {
  veo3: `Format ai_generation_prompt as natural language for VEO 3:
"[Subject] [doing action] in [setting]. [Lighting description]. [Camera movement], [duration] seconds, vertical 9:16 format."
Example: "A chef tossing flames in a dark restaurant kitchen. Warm orange light flickering. Slow push-in, 4 seconds, vertical 9:16 format."`,

  kling: `Format ai_generation_prompt as structured Kling 2.0 syntax:
"[Subject] [action] [setting] --duration [X]s --ar 9:16 --style [cinematic/cartoon/etc] --motion [fast/slow/normal]"
Example: "Young woman running through neon-lit Tokyo streets --duration 4s --ar 9:16 --style cinematic --motion fast"`,

  runway: `Format ai_generation_prompt as Runway Gen-4 paragraph emphasizing motion and camera:
Describe the scene with emphasis on movement, camera technique (dolly in/out, pan left/right, tilt up/down, zoom), and mood. Be specific about camera motion direction and speed.
Example: "Camera dolly-in toward a lone surfer paddling at dawn. Ocean mist rises as golden light breaks the horizon. Slow, meditative push forward. 9:16 vertical."`,

  pika: `Format ai_generation_prompt as Pika 2.0 comma-separated tag style:
"[subject], [action], [setting], [lighting], [mood], [camera] -ar 9:16 -s [style_keyword]"
Example: "female astronaut, floating weightlessly, inside sleek spaceship cockpit, blue ambient lighting, futuristic calm, slow orbit camera -ar 9:16 -s cinematic"`,

  midjourney: `Format ai_generation_prompt as Midjourney image description (stills only, no motion):
"[detailed scene description], [lighting], [mood], [artistic style] --ar 9:16 --style raw --v 6.1 --q 2"
Example: "ancient temple ruins at sunset, golden hour light streaming through stone arches, mystical atmosphere, photorealistic --ar 9:16 --style raw --v 6.1 --q 2"`,

  generic: `Format ai_generation_prompt as a universal, descriptive paragraph usable in any AI video tool:
Describe the subject, action, environment, lighting, mood, and camera framing in plain English. No tool-specific flags. Clear and detailed.
Example: "A young entrepreneur sits at a minimalist desk, typing on a laptop in a bright modern office. Natural light from large windows. Medium shot, slightly angled from above. Focused, aspirational mood."`,
};

const DURATION_SCENE_GUIDE: Record<VideoDuration, string> = {
  "15s": "Generate 3-4 scenes. Total duration must sum to exactly 15 seconds.",
  "30s": "Generate 5-7 scenes. Total duration must sum to exactly 30 seconds.",
  "60s": "Generate 8-12 scenes. Total duration must sum to exactly 60 seconds.",
};

const PLATFORM_NOTES: Record<Platform, string> = {
  youtube_shorts: "YouTube Shorts: Hook in first 2s, strong retention curve, end with CTA like 'Subscribe for more'.",
  instagram_reels: "Instagram Reels: Trendy, fast-paced, visually striking. End with share/save prompt.",
  tiktok: "TikTok: Punchy, trend-aware, conversational voiceover. End with comment bait or CTA.",
};

export function buildSystemPrompt(params: {
  aiTool: AiTool;
  visualStyle: VisualStyle;
  duration: VideoDuration;
  platform: Platform;
  imagePurpose?: "visual_reference" | "product_ad" | null;
}): string {
  const { aiTool, visualStyle, duration, platform, imagePurpose } = params;

  const imageInstructions =
    imagePurpose === "visual_reference"
      ? `\nIMAGE REFERENCE: The user has uploaded a reference image. Analyze its visual style, color palette, lighting mood, and compositional aesthetic. Generate scenes that closely match and reference this visual aesthetic throughout the entire script.\n`
      : imagePurpose === "product_ad"
      ? `\nPRODUCT IMAGE: The user has uploaded a product image. Analyze the product's appearance and build a compelling advertisement video script that showcases this product. Feature product close-ups, lifestyle usage scenes, and end with a strong call-to-action.\n`
      : "";

  return `You are ScriptFlow AI, an expert short-form video script writer and AI prompt engineer.${imageInstructions}

Given a video concept, generate a complete scene-by-scene production script optimized for vertical 9:16 video.

Output ONLY valid JSON matching this exact schema. No markdown, no explanation, no code blocks:
{
  "title": "string (catchy title, 5-10 words)",
  "scenes": [
    {
      "scene_number": number,
      "duration_seconds": number,
      "visual_description": "string — what the viewer sees",
      "camera_direction": "string — angle, movement, framing",
      "voiceover_text": "string — natural conversational narration (REQUIRED for every scene, never null)",
      "onscreen_text": "string or null — max 10 words for text overlay",
      "ai_generation_prompt": "string — tool-specific prompt (see rules below)",
      "suggested_music": "string or null — music/SFX mood description",
      "transition": "cut" | "fade" | "swipe" | "zoom" | "dissolve" or null
    }
  ]
}

RULES:
1. ${DURATION_SCENE_GUIDE[duration]}
2. Visual style throughout: ${visualStyle}
3. ${PLATFORM_NOTES[platform]}
4. Scene 1 MUST hook the viewer in the first 2 seconds — start with action, not setup
5. Final scene MUST include a call-to-action or memorable punchline
6. onscreen_text: maximum 10 words per scene, null if not needed
7. voiceover_text: REQUIRED on every scene — natural, conversational, NOT robotic. Even scene 1 must have voiceover (a punchy hook line works great)
8. All content is for vertical 9:16 format

AI GENERATION PROMPT FORMAT (for field "ai_generation_prompt"):
${TOOL_INSTRUCTIONS[aiTool]}

Output ONLY the raw JSON object. Nothing else.`;
}
