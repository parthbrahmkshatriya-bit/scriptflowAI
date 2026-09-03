import type { CreativeBrief } from "./brief-expander";
import type { AiTool } from "@/types/database";

/**
 * Visual continuity injection.
 *
 * THE PROBLEM: each scene's ai_generation_prompt is written independently by
 * the model, so across an 8-scene script the product drifts — frosted glass
 * bottle in scene 1, white plastic pump in scene 4, different label in scene 7.
 * Passing the brief in the system prompt only *suggests* consistency; the model
 * still decides per scene how much of it to restate.
 *
 * THE FIX: append a byte-identical visual clause to every scene prompt in code.
 * Consistency stops being model-discretionary and becomes a structural
 * guarantee. Only visual identity goes in — audience, key messages and campaign
 * tone are copy strategy and would pollute a video-generation prompt.
 */

/** Tools whose prompts end in flag tokens (--ar, -s, --v). Text appended after
 *  a flag becomes part of that flag's value and corrupts the syntax. */
const FLAG_SYNTAX_TOOLS: ReadonlySet<AiTool> = new Set(["kling", "pika", "midjourney"]);

/** Matches the first flag token: " --ar", " -s", " --duration". */
const FIRST_FLAG = /\s-{1,2}[a-zA-Z]/;

export function buildContinuityClause(brief: CreativeBrief | null): string | null {
  if (!brief) return null;

  const label = brief.brand_name
    ? `${brief.brand_name} ${brief.product_name}`
    : brief.product_name;
  if (!label?.trim()) return null;

  const appearance = brief.visual_identity?.packaging_or_appearance?.trim() ?? "";
  const colors = (brief.visual_identity?.colors ?? []).filter(Boolean);

  // Nothing visual to lock — skip rather than inject a bare product name.
  if (!appearance && colors.length === 0) return null;

  const sentences = [`The product in this shot is ${label.trim()}`];
  if (appearance) {
    sentences[0] += `: ${appearance.replace(/\.$/, "")}`;
  }
  if (colors.length) {
    sentences.push(`Colorway: ${colors.join(", ")}`);
  }
  sentences.push(
    "Render it identically in every shot — same form, same label, same proportions"
  );

  return sentences.join(". ") + ".";
}

/**
 * Append the clause without breaking tool-specific prompt syntax.
 * Flag-based tools get it inserted before the first flag; prose tools append.
 */
/** Close off the preceding text so the clause doesn't run into it. */
function terminate(text: string): string {
  const t = text.trim().replace(/,$/, "");
  return /[.!?]$/.test(t) ? t : `${t}.`;
}

export function injectContinuity(
  prompt: string,
  clause: string | null,
  tool: AiTool
): string {
  if (!clause) return prompt;

  const base = prompt.trim();
  // Already present (e.g. a regenerate) — don't stack duplicates.
  if (base.includes(clause)) return base;

  if (FLAG_SYNTAX_TOOLS.has(tool)) {
    const flagIdx = base.search(FIRST_FLAG);
    if (flagIdx !== -1) {
      const body = terminate(base.slice(0, flagIdx));
      const flags = base.slice(flagIdx).trim();
      return `${body} ${clause} ${flags}`;
    }
  }

  return `${terminate(base)} ${clause}`;
}

/** Apply continuity to every scene's ai_generation_prompt. */
export function applyContinuity<T extends { ai_generation_prompt: string }>(
  scenes: T[],
  brief: CreativeBrief | null,
  tool: AiTool
): T[] {
  const clause = buildContinuityClause(brief);
  if (!clause) return scenes;

  return scenes.map((scene) => ({
    ...scene,
    ai_generation_prompt: injectContinuity(scene.ai_generation_prompt, clause, tool),
  }));
}
