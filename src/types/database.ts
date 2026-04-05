export type Plan = "free" | "creator" | "pro";
export type SubscriptionStatus = "active" | "cancelled" | "past_due" | "none";
export type PaymentProvider = "stripe" | "razorpay";
export type VideoDuration = "15s" | "30s" | "60s";
export type Platform =
  | "youtube_shorts"
  | "instagram_reels"
  | "tiktok";
export type VisualStyle =
  | "cinematic"
  | "cartoon"
  | "realistic"
  | "minimal"
  | "anime";
export type AiTool =
  | "veo3"
  | "kling"
  | "runway"
  | "pika"
  | "midjourney"
  | "generic";
export type Transition =
  | "cut"
  | "fade"
  | "swipe"
  | "zoom"
  | "dissolve";

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  plan: Plan;
  scripts_used_this_month: number;
  stripe_customer_id: string | null;
  razorpay_customer_id: string | null;
  payment_provider: PaymentProvider | null;
  subscription_status: SubscriptionStatus;
  subscription_ends_at: string | null;
  preferred_platform: string | null;
  preferred_ai_tool: string | null;
  preferred_style: string | null;
  created_at: string;
  updated_at: string;
}

export interface Script {
  id: string;
  user_id: string;
  concept: string;
  title: string;
  duration: VideoDuration;
  platform: Platform;
  visual_style: VisualStyle;
  ai_tool: AiTool;
  scene_count: number;
  is_favorite: boolean;
  is_public: boolean;
  share_slug: string | null;
  generation_time_ms: number | null;
  model_used: string | null;
  created_at: string;
}

export interface Scene {
  id: string;
  script_id: string;
  scene_number: number;
  duration_seconds: number;
  visual_description: string;
  camera_direction: string;
  voiceover_text: string | null;
  onscreen_text: string | null;
  ai_generation_prompt: string;
  suggested_music: string | null;
  transition: string | null;
}

export interface Subscription {
  id: string;
  user_id: string;
  provider: PaymentProvider;
  provider_subscription_id: string;
  plan: "creator" | "pro";
  status: "active" | "cancelled" | "past_due" | "trialing";
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  created_at: string;
}

export interface ScriptWithScenes extends Script {
  scenes: Scene[];
}

export interface UserInsert {
  id: string;
  email: string;
  full_name?: string | null;
  avatar_url?: string | null;
  plan?: Plan;
  scripts_used_this_month?: number;
  stripe_customer_id?: string | null;
  razorpay_customer_id?: string | null;
  payment_provider?: PaymentProvider | null;
  subscription_status?: SubscriptionStatus;
  subscription_ends_at?: string | null;
  preferred_platform?: string | null;
  preferred_ai_tool?: string | null;
  preferred_style?: string | null;
}

export interface ScriptInsert {
  user_id: string;
  concept: string;
  title: string;
  duration: VideoDuration;
  platform: Platform;
  visual_style: VisualStyle;
  ai_tool: AiTool;
  scene_count: number;
  is_favorite?: boolean;
  is_public?: boolean;
  share_slug?: string | null;
  generation_time_ms?: number | null;
  model_used?: string | null;
}

export interface SceneInsert {
  script_id: string;
  scene_number: number;
  duration_seconds: number;
  visual_description: string;
  camera_direction: string;
  voiceover_text?: string | null;
  onscreen_text?: string | null;
  ai_generation_prompt: string;
  suggested_music?: string | null;
  transition?: string | null;
}

export interface SubscriptionInsert {
  user_id: string;
  provider: PaymentProvider;
  provider_subscription_id: string;
  plan: "creator" | "pro";
  status: "active" | "cancelled" | "past_due" | "trialing";
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end?: boolean;
}

export interface Database {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: UserInsert;
        Update: Partial<UserInsert>;
        Relationships: [];
      };
      scripts: {
        Row: Script;
        Insert: ScriptInsert;
        Update: Partial<ScriptInsert>;
        Relationships: [];
      };
      scenes: {
        Row: Scene;
        Insert: SceneInsert;
        Update: Partial<SceneInsert>;
        Relationships: [];
      };
      subscriptions: {
        Row: Subscription;
        Insert: SubscriptionInsert;
        Update: Partial<SubscriptionInsert>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
