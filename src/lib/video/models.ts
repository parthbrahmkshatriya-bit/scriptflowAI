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

/** Pick the model for a request. Image input always wins — it is the only
 *  path that preserves the actual product. */
export function resolveModel(opts: { tier: VideoTier; hasImage: boolean }): VideoModel {
  if (opts.hasImage) return VIDEO_MODELS.kling_i2v;
  return opts.tier === "draft" ? VIDEO_MODELS.veo31_lite : VIDEO_MODELS.veo31_fast;
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

/** Estimated render spend in USD, for logging and credit pricing. */
export function estimateCostUsd(model: VideoModel, seconds: number): number {
  return Number((model.costPerSecondUsd * seconds).toFixed(4));
}

/** Model-weighted credit cost. One credit is $0.05 of render spend. */
export const USD_PER_CREDIT = 0.05;

export function creditsFor(model: VideoModel, seconds: number): number {
  return Math.max(1, Math.ceil(estimateCostUsd(model, seconds) / USD_PER_CREDIT));
}
