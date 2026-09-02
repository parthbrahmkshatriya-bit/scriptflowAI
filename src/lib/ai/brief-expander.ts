import Anthropic from "@anthropic-ai/sdk";

export interface CreativeBrief {
  brand_name: string | null;
  product_name: string;
  product_description: string;
  visual_identity: {
    colors: string[];
    aesthetic: string;
    packaging_or_appearance: string;
  };
  target_audience: string;
  key_messages: string[];
  tone: string;
  campaign_hook: string;
}

const BRIEF_PROMPT = `You are a senior advertising creative director and brand strategist.

Given a video concept, extract a rich creative brief using your training knowledge about the brand/product mentioned. If a specific brand is mentioned, recall everything you know about it — visual identity, typical aesthetic, target demographic, market positioning, and brand tone. If only a product category is given, infer the typical visual and marketing characteristics for that category.

Output ONLY valid JSON — no markdown, no explanation:
{
  "brand_name": "string or null — exact brand name if mentioned or inferrable",
  "product_name": "string — specific product name or descriptive category label",
  "product_description": "string — what the product is, what it does, key features/benefits (2-3 sentences)",
  "visual_identity": {
    "colors": ["array of 2-4 brand or product colors e.g. 'matte black', 'rose gold', 'clinical white'"],
    "aesthetic": "string — overall visual feel e.g. 'clean and clinical', 'bold and energetic', 'soft luxury'",
    "packaging_or_appearance": "string — what the product physically looks like, packaging material, shape, label style"
  },
  "target_audience": "string — specific demographic + psychographic e.g. '25-35 year old women with oily skin, beauty-conscious, price-aware'",
  "key_messages": ["benefit 1", "benefit 2", "benefit 3 — max 3 specific USPs to highlight"],
  "tone": "string — emotional campaign tone e.g. 'confident and empowering', 'aspirational and premium', 'fun and relatable'",
  "campaign_hook": "string — the single most compelling angle or insight to anchor this video around"
}`;

export async function expandConcept(
  concept: string,
  overrides?: {
    target_audience?: string | null;
    tone?: string | null;
    key_message?: string | null;
  }
): Promise<CreativeBrief | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  const contextLines: string[] = [`Video concept: ${concept}`];
  if (overrides?.target_audience) contextLines.push(`Target audience (user-specified): ${overrides.target_audience}`);
  if (overrides?.tone) contextLines.push(`Desired tone (user-specified): ${overrides.tone}`);
  if (overrides?.key_message) contextLines.push(`Key message (user-specified): ${overrides.key_message}`);

  const userMessage = contextLines.join("\n");

  try {
    const client = new Anthropic({ apiKey });
    const msg = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: BRIEF_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    const raw = msg.content[0].type === "text" ? msg.content[0].text : "";
    const clean = raw.replace(/^```json?\n?/, "").replace(/\n?```$/, "").trim();
    return JSON.parse(clean) as CreativeBrief;
  } catch (err) {
    // Brief expansion is best-effort — failure here must never block script generation
    console.warn("[brief-expander] Failed to expand concept (non-fatal):", err);
    return null;
  }
}
