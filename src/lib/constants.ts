/**
 * Application Constants
 * Pricing, limits, and options configuration
 */

import type {
  UserPlan,
  ScriptDuration,
  ScriptPlatform,
  VisualStyle,
  AITool,
} from '@/types/database';

// ============================================================================
// USAGE LIMITS (Scripts per month)
// ============================================================================

export const USAGE_LIMITS: Record<UserPlan, number> = {
  free: 3,
  creator: 15,
  studio: 20,
  pro: Infinity,
  agency: Infinity,
};

// ============================================================================
// PRICING (in USD and INR)
// ============================================================================

export interface PricingTier {
  name: string;
  plan: UserPlan;
  description: string;
  usdMonthly: number;
  usdAnnual: number;
  inrMonthly: number;
  inrAnnual: number;
  features: string[];
}

export const PRICING_TIERS: PricingTier[] = [
  {
    name: 'Free',
    plan: 'free',
    description: 'Get started with 3 scripts per month',
    usdMonthly: 0,
    usdAnnual: 0,
    inrMonthly: 0,
    inrAnnual: 0,
    features: [
      '3 scripts per month',
      'Basic output format',
      'No voiceover or video features',
      'Tool-ready prompts',
    ],
  },
  {
    name: 'Creator',
    plan: 'creator',
    description: 'For active creators with voiceover support',
    usdMonthly: 9.99,
    usdAnnual: 99.0,
    inrMonthly: 799,
    inrAnnual: 7990,
    features: [
      '15 scripts per month',
      'Voiceover support',
      'Tool-specific prompt formatting',
      'Public sharing & remixing',
      'Full script history',
    ],
  },
  {
    name: 'Studio',
    plan: 'studio',
    description: 'Create full videos with script, voice, and video output',
    usdMonthly: 24.99,
    usdAnnual: 249.0,
    inrMonthly: 1999,
    inrAnnual: 19990,
    features: [
      '20 full videos per month',
      'Video-ready prompts and voiceover',
      'Exportable scripts and storyboards',
      'Premium support',
    ],
  },
  {
    name: 'Agency',
    plan: 'agency',
    description: 'Unlimited videos with team access and white label',
    usdMonthly: 59.99,
    usdAnnual: 599.0,
    inrMonthly: 4999,
    inrAnnual: 49990,
    features: [
      'Unlimited videos',
      '5 seats included',
      'White-label outputs',
      'Priority onboarding and support',
    ],
  },
];

// ============================================================================
// VIDEO DURATIONS
// ============================================================================

export const DURATION_OPTIONS: Array<{
  value: ScriptDuration;
  label: string;
  description: string;
  estimatedScenes: string;
}> = [
  {
    value: '15s',
    label: '15 seconds',
    description: 'Quick hook or teaser',
    estimatedScenes: '3-4 scenes',
  },
  {
    value: '30s',
    label: '30 seconds',
    description: 'Standard short-form length',
    estimatedScenes: '5-7 scenes',
  },
  {
    value: '60s',
    label: '60 seconds',
    description: 'Extended storytelling',
    estimatedScenes: '10-12 scenes',
  },
];

// ============================================================================
// PLATFORMS
// ============================================================================

export const PLATFORM_OPTIONS: Array<{
  value: ScriptPlatform;
  label: string;
  aspect_ratio: string;
  ideal_duration: ScriptDuration;
}> = [
  {
    value: 'youtube_shorts',
    label: 'YouTube Shorts',
    aspect_ratio: '9:16',
    ideal_duration: '60s',
  },
  {
    value: 'instagram_reels',
    label: 'Instagram Reels',
    aspect_ratio: '9:16',
    ideal_duration: '30s',
  },
  {
    value: 'tiktok',
    label: 'TikTok',
    aspect_ratio: '9:16',
    ideal_duration: '15s',
  },
];

// ============================================================================
// VISUAL STYLES
// ============================================================================

export const VISUAL_STYLE_OPTIONS: Array<{
  value: VisualStyle;
  label: string;
  description: string;
  works_with: AITool[];
}> = [
  {
    value: 'cinematic',
    label: 'Cinematic',
    description: 'High-production, film-like quality',
    works_with: ['veo3', 'kling', 'runway', 'pika'],
  },
  {
    value: 'cartoon',
    label: 'Cartoon',
    description: 'Animated, playful, 2D or 3D',
    works_with: ['kling', 'runway', 'midjourney'],
  },
  {
    value: 'realistic',
    label: 'Realistic',
    description: 'Photorealistic human and objects',
    works_with: ['veo3', 'runway', 'pika'],
  },
  {
    value: 'minimal',
    label: 'Minimal',
    description: 'Clean, simple, focus on message',
    works_with: ['veo3', 'runway'],
  },
  {
    value: 'anime',
    label: 'Anime',
    description: 'Japanese anime style',
    works_with: ['kling', 'midjourney', 'pika'],
  },
];

// ============================================================================
// AI TOOLS / GENERATORS
// ============================================================================

export const AI_TOOL_OPTIONS: Array<{
  value: AITool;
  label: string;
  description: string;
  strengths: string[];
  cost_tier: 'cheap' | 'medium' | 'expensive';
}> = [
  {
    value: 'veo3',
    label: 'VEO 3',
    description: 'Google Deepmind video generation',
    strengths: ['High quality', 'Realistic', 'Cinematic'],
    cost_tier: 'expensive',
  },
  {
    value: 'kling',
    label: 'Kling 2.0',
    description: 'Kuaishou AI video synthesis',
    strengths: ['Motion quality', 'Speed', 'Asian market'],
    cost_tier: 'medium',
  },
  {
    value: 'runway',
    label: 'Runway Gen-4',
    description: 'Professional video AI tool',
    strengths: ['Professional grade', 'Flexible', 'Consistent'],
    cost_tier: 'expensive',
  },
  {
    value: 'pika',
    label: 'Pika 2.0',
    description: 'Fast video generation',
    strengths: ['Speed', 'Iteration', 'Gen-Z friendly'],
    cost_tier: 'medium',
  },
  {
    value: 'midjourney',
    label: 'Midjourney',
    description: 'Image and video generation',
    strengths: ['Artistic', 'Style control', 'Community'],
    cost_tier: 'cheap',
  },
  {
    value: 'generic',
    label: 'Generic',
    description: 'Universal format (any tool)',
    strengths: ['Flexible', 'Tool-agnostic'],
    cost_tier: 'cheap',
  },
];

// ============================================================================
// TRANSITIONS
// ============================================================================

export const TRANSITION_OPTIONS = [
  'cut',
  'fade',
  'swipe',
  'zoom',
  'dissolve',
] as const;

// ============================================================================
// RATE LIMITS
// ============================================================================

export const RATE_LIMITS = {
  GENERATION_PER_MINUTE: 5, // Max 5 generations per minute per user
  GUEST_DEMO_PER_24H: 1, // Max 1 guest demo per IP per 24 hours
  API_TIMEOUT_MS: 15000, // AI generation timeout: 15 seconds
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function getPricingByPlan(plan: UserPlan): PricingTier | undefined {
  return PRICING_TIERS.find((tier) => tier.plan === plan);
}

export function getPlatformByValue(value: string): typeof PLATFORM_OPTIONS[0] | undefined {
  return PLATFORM_OPTIONS.find((p) => p.value === value);
}

export function getStyleByValue(value: string): typeof VISUAL_STYLE_OPTIONS[0] | undefined {
  return VISUAL_STYLE_OPTIONS.find((s) => s.value === value);
}

export function getToolByValue(value: string): typeof AI_TOOL_OPTIONS[0] | undefined {
  return AI_TOOL_OPTIONS.find((t) => t.value === value);
}

export const MAX_CONCEPT_LENGTH = 500;

export const PLAN_LABELS: Record<string, string> = {
  free: 'Free',
  creator: 'Creator',
  studio: 'Studio',
  pro: 'Pro',
  agency: 'Agency',
};

export const PLAN_LIMITS: Record<string, number> = {
  free: 3,
  creator: 15,
  studio: 20,
  pro: Infinity,
  agency: Infinity,
};

export const PLATFORM_LABELS: Record<string, string> = {
  youtube_shorts: 'YouTube Shorts',
  instagram_reels: 'Instagram Reels',
  tiktok: 'TikTok',
};

export const VISUAL_STYLE_LABELS: Record<string, string> = {
  cinematic: 'Cinematic',
  cartoon: 'Cartoon',
  realistic: 'Realistic',
  minimal: 'Minimal',
  anime: 'Anime',
};

export const AI_TOOL_LABELS: Record<string, string> = {
  veo3: 'VEO 3',
  kling: 'Kling 2.0',
  runway: 'Runway Gen-4',
  pika: 'Pika 2.0',
  midjourney: 'Midjourney',
  generic: 'Generic',
};

export const REGULAR_PRICING = {
  free: { usd: 0, inr: 0 },
  creator: { usd: 9.99, inr: 799 },
  pro: { usd: 19.99, inr: 1999 },
};

export const EARLY_BIRD_PRICING = {
  free: { usd: 0, inr: 0 },
  creator: { usd: 6.99, inr: 599 },
  pro: { usd: 12.99, inr: 1199 },
};

export const PRICING_USD = {
  creator: 9.99,
  pro: 19.99,
};

export const PRICING_INR = {
  creator: 799,
  pro: 1999,
};

export const EARLY_BIRD_ACTIVE = false;
export const EARLY_BIRD_TOTAL = 100;
export const EARLY_BIRD_CLAIMED = 0;

export const CLAUDE_MODEL = 'claude-haiku-4-5-20251001';

export function getUserScriptLimit(plan: UserPlan): number {
  return USAGE_LIMITS[plan];
}

// ============================================================================
// COPY STRINGS & LABELS
// ============================================================================

export const COPY = {
  LIMIT_REACHED: {
    free: "You've used all 3 free scripts this month",
    creator: "You've used all 15 Creator scripts this month",
    agency: "Error: Agency users should have unlimited scripts",
  },
  UPGRADE_CTA: {
    free: 'Upgrade to Creator for more scripts and voiceover',
    creator: 'Upgrade to Studio for video generation',
    studio: 'Upgrade to Agency for unlimited teams and white label',
  },
  PAGE_TITLES: {
    dashboard: "Dashboard",
    generate: "Create New Script",
    settings: "Account Settings",
    login: "Sign In",
    signup: "Sign Up",
  },
};
