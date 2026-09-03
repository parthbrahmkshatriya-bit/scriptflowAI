import type { AiTool, VisualStyle, VideoDuration, Platform } from "@/types/database";
import type { CreativeBrief } from "./brief-expander";

const TOOL_INSTRUCTIONS: Record<AiTool, string> = {
  veo3: `Format ai_generation_prompt as a rich, director-level brief for VEO 3 — Google's highest-quality AI video model. VEO 3 generates both video AND audio from one prompt, so everything (visuals, camera, voiceover, sound) must be embedded in a single, highly detailed natural-language command. Vague prompts produce vague results; specific prompts produce cinematic ones.

Write each prompt in this order — do NOT use bullet points or headers, write as flowing prose:

1. SUBJECT + ACTION: Who or what is in frame, exactly what they are doing, with specific physical/visual details (clothing texture, facial expression, object material, color).
2. SETTING + ENVIRONMENT: Exact location, time of day, depth of field context (foreground vs blurred background), atmospheric elements (fog, dust, steam, rain, wind).
3. LIGHTING: Specific light source(s), quality (soft/hard/diffused), direction, color temperature — e.g. "warm 5600K golden-hour sunlight from the left casting long shadows", "cool blue rim light, single overhead key light creating chiaroscuro". Never write generic "good lighting".
4. VISUAL QUALITY: Always include "photorealistic", "ultra-sharp detail", "cinematic 4K quality", "professional color grading" and a color tone description (e.g. "warm amber and teal LUT", "desaturated cool blue tone", "rich vivid saturated palette").
5. CAMERA: Specific lens (e.g. "85mm portrait lens", "wide 24mm", "50mm normal lens"), movement (e.g. "slow push-in", "gentle handheld shake", "locked tripod", "smooth arc left-to-right"), framing (e.g. "tight close-up on face", "medium shot", "wide establishing shot").
6. DURATION + FORMAT: "[X] seconds, vertical 9:16 format."
7. VOICEOVER (if voiceover_text is not null): Write EXACTLY this pattern — "A [specific voice description: e.g. 'warm, authoritative male narrator with a deep, resonant voice'] speaks with [emotional tone + delivery style: e.g. 'calm confidence and slight urgency'] at a natural, measured pace: \\"[exact voiceover_text from this scene verbatim]\\" — studio-quality recording, crystal-clear diction, warm microphone presence, no reverb, no artifacts, no robotic tone."
   LANGUAGE: when voiceover_text is not in English, the voice description MUST name the language and call for a NATIVE speaker with an authentic local accent — e.g. "a native Hindi speaker from India with a warm, natural Indian accent". Never describe a neutral, international or American accent for non-English narration; it makes the delivery sound foreign to local viewers.
8. BACKGROUND AUDIO: Specific sound design — instruments, tempo, mood, volume relationship (e.g. "soft fingerpicked acoustic guitar, slow and melancholic, low in the mix under the voiceover", "upbeat electronic pulse, energetic, medium volume").

Quality suffix (always end with): "No motion blur artifacts, smooth transitions, professional production quality."

EXAMPLE WITH VOICEOVER:
"An elderly craftsman's weathered, ink-stained hands slowly turn the pages of an ancient leather-bound book on a dark oak desk. Warm amber candlelight from the right side casts deep shadows across the textured pages and highlights the fine wrinkles on his knuckles. Background: a softly blurred wall of floor-to-ceiling bookshelves. Photorealistic, ultra-sharp 4K quality, warm amber and brown color grading, shallow depth of field with creamy bokeh. Tight close-up on hands, slow push-in, 85mm equivalent lens, 4 seconds, vertical 9:16. A wise, contemplative older male narrator with a deep, gravelly voice speaks with quiet gravity and reverence: \\"Every story worth telling took a lifetime to live.\\" — studio-quality recording, crystal-clear diction, warm microphone presence, no reverb. Soft, slow piano notes, sparse and melancholic, low in the mix beneath the narration. No motion blur artifacts, smooth transitions, professional production quality."

EXAMPLE WITHOUT VOICEOVER:
"Aerial drone slowly ascending above a vast redwood forest at golden hour. Shafts of warm 5800K sunlight pierce the ancient canopy, illuminating drifting mist and pollen in the air. Background: rolling hills extending to a hazy horizon. Photorealistic, ultra-sharp 4K, rich warm amber-green color grading, deep depth of field. Smooth, steady upward dolly, ultra-wide 16mm equivalent lens, starting at mid-canopy level and rising to treetop height, 5 seconds, vertical 9:16. Sweeping orchestral strings, slowly building, awe-inspiring and epic, medium volume. No motion blur artifacts, smooth transitions, professional production quality."

CRITICAL RULES:
- Embed voiceover_text VERBATIM — word for word, no paraphrasing
- Minimum 100 words per prompt — brevity is the enemy of quality here
- Never write "good lighting" or "nice background" — always be specific
- Always include the exact duration in seconds in the prompt
- Never omit the voice description when voiceover_text is present`,

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

const DURATION_SECONDS: Record<VideoDuration, number> = { "15s": 15, "30s": 30, "60s": 60 };

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
  sceneCount?: number | null;
  imagePurpose?: "visual_reference" | "product_ad" | "character_avatar" | null;
  brief?: CreativeBrief | null;
}): string {
  const { aiTool, visualStyle, duration, platform, sceneCount, imagePurpose, brief } = params;

  const imageInstructions =
    imagePurpose === "visual_reference"
      ? `\nIMAGE REFERENCE: The user has uploaded a reference image. Analyze its visual style, color palette, lighting mood, and compositional aesthetic. Generate scenes that closely match and reference this visual aesthetic throughout the entire script.\n`
      : imagePurpose === "product_ad"
      ? `\nPRODUCT IMAGE: The user has uploaded a product image. Analyze the product's appearance and build a compelling advertisement video script that showcases this product. Feature product close-ups, lifestyle usage scenes, and end with a strong call-to-action.\n`
      : imagePurpose === "character_avatar"
      ? `\nCHARACTER AVATAR: The user has uploaded an image of a person to use as the main character throughout this video. Carefully analyze their physical appearance and extract a detailed, specific character description covering: approximate age, gender presentation, hair (color, length, style), skin tone, facial features, clothing/outfit, and any other distinguishing details. This character MUST appear in EVERY scene as the central subject. In EVERY scene's visual_description AND ai_generation_prompt, include the full character description so Veo 3 can render the same person consistently. Never omit the character from any scene. The character description should be detailed enough that an AI video model can recreate the same person in each shot.\n`
      : "";

  const totalSeconds = DURATION_SECONDS[duration];
  const sceneGuide = sceneCount
    ? `Generate exactly ${sceneCount} scene${sceneCount === 1 ? "" : "s"}. Total duration must sum to exactly ${totalSeconds} seconds (distribute evenly, ~${Math.round(totalSeconds / sceneCount)}s per scene).`
    : DURATION_SCENE_GUIDE[duration];

  // Build the creative brief block — injected when available
  const briefBlock = brief ? `
CREATIVE BRIEF (use this to ground every scene in specific, accurate details):
- Product: ${brief.product_name}${brief.brand_name ? ` by ${brief.brand_name}` : ""}
- What it is: ${brief.product_description}
- Visual identity: ${brief.visual_identity.aesthetic} | Colors: ${brief.visual_identity.colors.join(", ")} | Appearance: ${brief.visual_identity.packaging_or_appearance}
- Target audience: ${brief.target_audience}
- Key messages: ${brief.key_messages.join(" | ")}
- Campaign tone: ${brief.tone}
- Hook angle: ${brief.campaign_hook}

Use every detail above. Never write generic "product" or "person" — always reference the exact product name, its colors, packaging, and audience. Make viewers feel they are seeing a real, professional advertisement for this specific product.
` : "";

  return `You are ScriptFlow AI, a senior advertising creative director and AI prompt engineer who produces professional, broadcast-quality video scripts.${imageInstructions}${briefBlock}

CORE MANDATE: Generate scripts that look like they were produced by a $500/hour ad agency — not a generic AI tool. Every scene must be specific, grounded in real product/brand details, and visually compelling. Never write vague descriptions like "the product is shown" — always describe exactly what is seen, with precise visual details.

BRAND INTELLIGENCE DIRECTIVE: If a specific brand or product is mentioned in the concept, actively recall everything you know from your training data about that brand — its visual identity, typical packaging/colors, target demographic, market positioning, tone, and current campaigns. Apply this knowledge to make every scene feel authentic and brand-accurate. If only a product category is mentioned, apply your knowledge of that category's typical visual language, target consumer, and emotional resonance.

Given a video concept, generate a complete scene-by-scene production script optimized for vertical 9:16 video.

Output ONLY valid JSON matching this exact schema. No markdown, no explanation, no code blocks:
{
  "title": "string (catchy title, 5-10 words)",
  "scenes": [
    {
      "scene_number": number,
      "duration_seconds": number,
      "visual_description": "string — what the viewer sees, with specific product/brand/character visual details",
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
1. ${sceneGuide}
2. Visual style throughout: ${visualStyle}
3. ${PLATFORM_NOTES[platform]}
4. Scene 1 MUST hook the viewer in the first 2 seconds — start with action, not setup
5. Final scene MUST include a call-to-action or memorable punchline
6. onscreen_text: maximum 10 words per scene, null if not needed
7. voiceover_text: REQUIRED on every scene — natural, conversational, NOT robotic. Even scene 1 must have voiceover (a punchy hook line works great)
8. All content is for vertical 9:16 format
9. VOICEOVER LENGTH IS A HARD LIMIT. The AI video model speaks at roughly 2.5 words per second and simply stops when the clip ends, cutting the sentence off mid-word and making the video look unfinished. voiceover_text must fit its own duration_seconds:
   - 4s scene → 10 words maximum
   - 5s scene → 12 words maximum
   - 6s scene → 15 words maximum
   - 8s scene → 20 words maximum
   Count the words before writing each line. If the message will not fit, cut it down or move the rest into the next scene — never overrun. Short, punchy lines outperform long ones in short-form video anyway.
10. LANGUAGE: write voiceover_text and onscreen_text in the same language the user wrote their concept in. If the concept is in Hindi, Gujarati, Tamil, Spanish or any other language, the script must be in that language — do not translate it to English. Word budgets above still apply.
9. SPECIFICITY IS MANDATORY: Every visual_description must name the actual product, brand colors, packaging details, and target person — never write placeholder generics

AI GENERATION PROMPT FORMAT (for field "ai_generation_prompt"):
${TOOL_INSTRUCTIONS[aiTool]}

Output ONLY the raw JSON object. Nothing else.`;
}
