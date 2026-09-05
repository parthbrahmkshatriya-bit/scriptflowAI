/**
 * Video model registry — single source of truth for fal.ai endpoints.
 *
 * Both /api/generate-video and its status route read from here. They used to
 * carry duplicate hardcoded endpoint constants, which drift apart silently and
 * break polling (status must query the SAME endpoint the job was submitted to).
 *
 * Costs are USD per second of output, used for spend observability and as the
 * basis for model-weighted credit pricing.
 */

export type VideoTier = "draft" | "pro";

export interface VideoModel {
  /** Stable internal key, safe to persist. */
  key: string;
  /** fal.ai endpoint path. */
  endpoint: string;
  label: string;
  /** USD per second of generated video. */
  costPerSecondUsd: number;
  /** Returns synchronised dialogue/ambience/SFX in the same call. */
  nativeAudio: boolean;
  acceptsImage: boolean;
  /** Durations the endpoint accepts, in seconds. Anything else is rejected. */
  allowedDurations: readonly number[];
  /** How this endpoint wants duration expressed. */
  durationFormat: "suffixed" | "plain" | "number";
  /** Omitted when the endpoint takes no resolution parameter. */
  resolution?: "720p" | "1080p";
}

export const VIDEO_MODELS = {
  /**
   * Standard delivery model. Replaced fal-ai/veo3 ($0.40/s) — Veo 3.1 is a
   * newer generation at a quarter the cost with native audio retained.
   */
  veo31_fast: {
    key: "veo31_fast",
    endpoint: "fal-ai/veo3.1/fast",
    label: "Veo 3.1 Fast",
    costPerSecondUsd: 0.1,
    nativeAudio: true,
    acceptsImage: false,
    allowedDurations: [4, 6, 8],
    durationFormat: "suffixed",
    resolution: "720p",
  },

  /** Draft tier — same model family as delivery, so a draft predicts the final. */
  veo31_lite: {
    key: "veo31_lite",
    endpoint: "fal-ai/veo3.1/lite",
    label: "Veo 3.1 Lite",
    costPerSecondUsd: 0.05,
    nativeAudio: true,
    acceptsImage: false,
    allowedDurations: [4, 6, 8],
    durationFormat: "suffixed",
    resolution: "720p",
  },

  /**
   * Image-to-video. The user's own product image carries product identity,
   * which text prompting cannot reproduce. No native audio.
   */
  kling_i2v: {
    key: "kling_i2v",
    endpoint: "fal-ai/kling-video/v2.1/standard/image-to-video",
    label: "Kling 2.1 (image-to-video)",
    costPerSecondUsd: 0.05,
    nativeAudio: false,
    acceptsImage: true,
    allowedDurations: [5, 10],
    durationFormat: "plain",
  },
} as const satisfies Record<string, VideoModel>;

export type VideoModelKey = keyof typeof VIDEO_MODELS;

/**
 * Plans that may render with the higher-fidelity model and at 1080p.
 *
 * This is the one plan differentiator that improves margin rather than costing
 * it: the expensive model is reachable only by the tiers whose price funds it,
 * which is also what bounds the worst case on cheaper plans.
 */
const PREMIUM_RENDER_PLANS: ReadonlySet<string> = new Set(["studio", "pro", "agency"]);

/**
 * 1080p is narrower than the Fast model. It multiplies an already-doubled rate,
 * and on Studio that combination is what takes a fully-consumed plan to roughly
 * -1,385 INR. Restricting it to the top tier cuts that worst case by ~76%.
 */
const HD_PLANS: ReadonlySet<string> = new Set(["pro", "agency"]);

export function planAllowsProModel(plan: string): boolean {
  return PREMIUM_RENDER_PLANS.has(plan);
}

export function planAllowsHD(plan: string): boolean {
  return HD_PLANS.has(plan);
}

export interface ResolvedModel {
  model: VideoModel;
  /** The plan asked for the pro model but is not entitled to it. */
  downgraded: boolean;
  /** True when the render uses the Fast model or 1080p — costs more credits. */
  usedPremium: boolean;
  resolution?: "720p" | "1080p";
}

/**
 * Pick the model for a request. Image input always wins — it is the only path
 * that preserves the actual product. Entitlement is decided here, server-side,
 * so a client cannot ask for a model its plan does not pay for.
 */
export function resolveModel(opts: {
  tier: VideoTier;
  hasImage: boolean;
  plan: string;
  hd?: boolean;
}): ResolvedModel {
  // Image-to-video runs on Kling at $0.05/s — as cheap as Lite, so it never
  // consumes a premium slot regardless of plan.
  if (opts.hasImage) {
    return {
      model: VIDEO_MODELS.kling_i2v,
      downgraded: false,
      usedPremium: false,
    };
  }

  const wantsPro = opts.tier === "pro";
  const mayUsePro = planAllowsProModel(opts.plan);
  const wantsHd = !!opts.hd;
  const mayUseHd = planAllowsHD(opts.plan);

  // What the plan entitles them to, before quota.
  const entitledPro = wantsPro && mayUsePro;
  const entitledHd = wantsHd && mayUseHd;
  const wantsPremium = entitledPro || entitledHd;

  // The premium render counter that used to live here is gone. Credits bound
  // spend directly — an expensive combination simply costs more of them — so a
  // separate cap on how often it may be chosen is redundant. Plan entitlement
  // above is kept, because that is a product differentiator rather than a cost
  // control.
  return {
    model: entitledPro ? VIDEO_MODELS.veo31_fast : VIDEO_MODELS.veo31_lite,
    downgraded: wantsPro && !mayUsePro,
    usedPremium: wantsPremium,
    // 1080p costs materially more per second, so it is opt-in even where
    // allowed; 720p stays the default on every plan.
    resolution: entitledHd ? "1080p" : "720p",
  };
}

/** Look up by endpoint path — used by the status route to recover model config. */
export function modelByEndpoint(endpoint: string): VideoModel | null {
  return (
    Object.values(VIDEO_MODELS).find((m) => m.endpoint === endpoint) ?? null
  );
}

/**
 * Snap a requested duration to one the endpoint actually accepts.
 * Ties resolve DOWNWARD: a 5s scene renders at 4s rather than 6s, which is
 * imperceptible in short-form and meaningfully cheaper.
 */
export function snapDuration(model: VideoModel, requestedSeconds: number): number {
  const allowed = model.allowedDurations;
  let best = allowed[0];
  let bestDelta = Math.abs(requestedSeconds - best);

  for (const candidate of allowed) {
    const delta = Math.abs(requestedSeconds - candidate);
    // Strictly-less keeps the earlier (smaller) value on a tie.
    if (delta < bestDelta) {
      best = candidate;
      bestDelta = delta;
    }
  }
  return best;
}

/**
 * Choose a clip length that can actually hold the narration.
 *
 * snapDuration alone resolves ties downward to save cost, which is right for a
 * silent clip but truncates a spoken one: the model reaches the end of the clip
 * mid-sentence and the video looks half-finished. When narration is present the
 * clip is instead the shortest allowed length that fits it — paying for two
 * extra seconds beats shipping a cut-off ad.
 *
 * If the narration exceeds even the longest allowed clip, the maximum is used
 * and the caller is told, so it can be surfaced rather than silently clipped.
 */
export function fitDuration(
  model: VideoModel,
  requestedSeconds: number,
  neededForSpeechSeconds: number
): { seconds: number; truncated: boolean } {
  if (neededForSpeechSeconds <= 0) {
    return { seconds: snapDuration(model, requestedSeconds), truncated: false };
  }

  const ascending = [...model.allowedDurations].sort((a, b) => a - b);
  const viable = ascending.filter((d) => d >= neededForSpeechSeconds);

  if (viable.length === 0) {
    return { seconds: ascending[ascending.length - 1], truncated: true };
  }

  // Among lengths that hold the narration, take the one nearest the scripted
  // duration so the cut still runs to its intended length — ties downward, so
  // a short line in a 5s scene renders at 4s rather than paying for 6s.
  let best = viable[0];
  let bestDelta = Math.abs(requestedSeconds - best);
  for (const candidate of viable) {
    const delta = Math.abs(requestedSeconds - candidate);
    if (delta < bestDelta) {
      best = candidate;
      bestDelta = delta;
    }
  }
  return { seconds: best, truncated: false };
}

/** Render duration in the shape this endpoint expects. */
export function formatDuration(model: VideoModel, seconds: number): string | number {
  switch (model.durationFormat) {
    case "suffixed":
      return `${seconds}s`;
    case "plain":
      return String(seconds);
    case "number":
      return seconds;
  }
}

/**
 * 1080p costs more per second than 720p — Veo 3.1 Lite is $0.05 against $0.08,
 * so resolution has to be priced, not just duration and model.
 */
const RESOLUTION_MULTIPLIER: Record<string, number> = {
  "720p": 1,
  "1080p": 1.6,
};

/** Estimated render spend in USD, for logging and credit pricing. */
export function estimateCostUsd(
  model: VideoModel,
  seconds: number,
  resolution?: string | null
): number {
  const mult = RESOLUTION_MULTIPLIER[resolution ?? "720p"] ?? 1;
  return Number((model.costPerSecondUsd * seconds * mult).toFixed(4));
}

/**
 * Model-weighted credit cost. One credit is $0.05 of render spend, so a plan's
 * credit grant is exactly its render cost ceiling.
 */
export const USD_PER_CREDIT = 0.05;

export function creditsFor(
  model: VideoModel,
  seconds: number,
  resolution?: string | null
): number {
  return Math.max(
    1,
    Math.ceil(estimateCostUsd(model, seconds, resolution) / USD_PER_CREDIT)
  );
}
