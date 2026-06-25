/**
 * Database Types - Matching CLAUDE.md Section 4
 * These types correspond to the Supabase tables: users, scripts, scenes, subscriptions
 */

// ============================================================================
// USER TYPE
// ============================================================================

export type UserPlan = 'free' | 'creator' | 'pro' | 'studio' | 'agency';
export type Plan = UserPlan;
export type VideoDuration = '15s' | '30s' | '60s';
export type Platform = 'youtube_shorts' | 'instagram_reels' | 'tiktok';
export type AiTool = AITool;
export type SubscriptionStatus = 'active' | 'cancelled' | 'past_due' | 'none';
export type PaymentProvider = 'stripe' | 'razorpay' | 'paypal' | null;

export interface User {
  id: string; // UUID, PK - references auth.users.id
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  plan: UserPlan; // default: 'free'
  scripts_used_this_month: number; // resets on 1st of month, default: 0
  stripe_customer_id: string | null;
  razorpay_customer_id: string | null;
  payment_provider: PaymentProvider;
  subscription_status: SubscriptionStatus; // default: 'none'
  subscription_ends_at: string | null; // ISO 8601 timestamp
  preferred_platform: string | null;
  preferred_ai_tool: string | null;
  preferred_style: string | null;
  created_at: string; // ISO 8601 timestamp
  updated_at: string; // ISO 8601 timestamp
}

// ============================================================================
// SCRIPT TYPE
// ============================================================================

export type ScriptDuration = '15s' | '30s' | '60s';
export type ScriptPlatform = 'youtube_shorts' | 'instagram_reels' | 'tiktok';
export type VisualStyle =
  | 'cinematic'
  | 'cartoon'
  | 'realistic'
  | 'minimal'
  | 'anime';
export type AITool =
  | 'veo3'
  | 'kling'
  | 'runway'
  | 'pika'
  | 'midjourney'
  | 'generic';

export interface Script {
  id: string; // UUID, PK
  user_id: string; // UUID, FK -> users.id, ON DELETE CASCADE
  concept: string; // max 500 chars
  title: string; // AI-generated
  duration: ScriptDuration;
  platform: ScriptPlatform;
  visual_style: VisualStyle;
  ai_tool: AITool;
  scene_count: number;
  is_favorite: boolean; // default: false
  is_public: boolean; // default: false
  share_slug: string | null; // unique, for public sharing
  generation_time_ms: number | null;
  model_used: string | null;
  created_at: string; // ISO 8601 timestamp
}

// ============================================================================
// SCENE TYPE
// ============================================================================

export type TransitionType =
  | 'cut'
  | 'fade'
  | 'swipe'
  | 'zoom'
  | 'dissolve';

export interface Scene {
  id: string; // UUID, PK
  script_id: string; // UUID, FK -> scripts.id, ON DELETE CASCADE
  scene_number: number; // ordered position (1-based)
  duration_seconds: number;
  visual_description: string;
  camera_direction: string;
  voiceover_text: string | null;
  onscreen_text: string | null;
  ai_generation_prompt: string; // copy-paste ready for selected AI tool
  suggested_music: string | null;
  transition: TransitionType | null;
  video_url: string | null;
}

// ============================================================================
// SUBSCRIPTION TYPE
// ============================================================================

export type SubscriptionPlan = 'creator' | 'studio' | 'agency';
export type SubscriptionProviderStatus =
  | 'active'
  | 'cancelled'
  | 'past_due'
  | 'trialing'
  | 'none';

export interface Subscription {
  id: string; // UUID, PK
  user_id: string; // UUID, FK -> users.id
  provider: PaymentProvider; // 'stripe' | 'razorpay' | 'paypal'
  provider_subscription_id: string;
  plan: SubscriptionPlan;
  status: SubscriptionProviderStatus;
  current_period_start: string; // ISO 8601 timestamp
  current_period_end: string; // ISO 8601 timestamp
  cancel_at_period_end: boolean;
  created_at: string; // ISO 8601 timestamp
}

// ============================================================================
// UTILITY TYPES FOR API RESPONSES
// ============================================================================

export interface ScriptWithScenes extends Script {
  scenes: Scene[];
}

export interface GenerateScriptRequest {
  concept: string;
  duration: ScriptDuration;
  platform: ScriptPlatform;
  visual_style: VisualStyle;
  ai_tool: AITool;
}

export interface GenerateScriptResponse {
  script_id: string;
  title: string;
  scenes: Scene[];
  generation_time_ms: number;
}
