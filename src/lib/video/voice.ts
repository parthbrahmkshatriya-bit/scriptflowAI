/**
 * Voice direction and speech timing for generated video.
 *
 * Two problems this solves:
 *
 * 1. ACCENT. The video prompt used to hardcode "a clear, neutral American
 *    English accent" for every render. A script written in Hindi or Gujarati
 *    was therefore narrated by an American voice reading the local language,
 *    which is exactly what a native speaker hears as wrong. The language is
 *    detected from the voiceover text itself and the prompt asks for a native
 *    speaker of that language.
 *
 * 2. TRUNCATION. Video endpoints accept only fixed clip lengths. If the
 *    narration needs longer than the clip, the model runs out of time and the
 *    sentence is cut off mid-word — the video looks half-finished. Speech
 *    length is estimated up front so the clip can be sized to fit it.
 */

export interface VoiceProfile {
  /** BCP-47-ish code, for logging and future TTS routing. */
  code: string;
  name: string;
  /** Spoken units per second at natural narration pace. */
  unitsPerSecond: number;
  /** Scripts without spaces are measured in characters, not words. */
  measure: "words" | "chars";
  /** How the narrator should sound, embedded verbatim into the prompt. */
  accent: string;
}

const ENGLISH: VoiceProfile = {
  code: "en",
  name: "English",
  unitsPerSecond: 2.6,
  measure: "words",
  accent:
    "a professional narrator with a clear, neutral English accent, warm and confident",
};

/**
 * Unicode block ranges, checked in order. Kana is tested before Han so that
 * Japanese text containing kanji is not misread as Chinese.
 */
const SCRIPT_RANGES: Array<{ re: RegExp; profile: VoiceProfile }> = [
  {
    re: /[઀-૿]/,
    profile: {
      code: "gu", name: "Gujarati", unitsPerSecond: 2.3, measure: "words",
      accent: "a native Gujarati speaker from Gujarat, India, narrating in natural conversational Gujarati with an authentic local accent — warm, confident, and completely native, never a foreign or American accent",
    },
  },
  {
    re: /[਀-੿]/,
    profile: {
      code: "pa", name: "Punjabi", unitsPerSecond: 2.3, measure: "words",
      accent: "a native Punjabi speaker from Punjab, India, narrating in natural conversational Punjabi with an authentic local accent — warm and lively, never a foreign or American accent",
    },
  },
  {
    re: /[ঀ-৿]/,
    profile: {
      code: "bn", name: "Bengali", unitsPerSecond: 2.3, measure: "words",
      accent: "a native Bengali speaker, narrating in natural conversational Bengali with an authentic local accent — warm and expressive, never a foreign or American accent",
    },
  },
  {
    re: /[஀-௿]/,
    profile: {
      code: "ta", name: "Tamil", unitsPerSecond: 2.2, measure: "words",
      accent: "a native Tamil speaker from Tamil Nadu, India, narrating in natural conversational Tamil with an authentic local accent — never a foreign or American accent",
    },
  },
  {
    re: /[ఀ-౿]/,
    profile: {
      code: "te", name: "Telugu", unitsPerSecond: 2.2, measure: "words",
      accent: "a native Telugu speaker, narrating in natural conversational Telugu with an authentic local accent — never a foreign or American accent",
    },
  },
  {
    re: /[ಀ-೿]/,
    profile: {
      code: "kn", name: "Kannada", unitsPerSecond: 2.2, measure: "words",
      accent: "a native Kannada speaker from Karnataka, India, narrating in natural conversational Kannada with an authentic local accent — never a foreign or American accent",
    },
  },
  {
    re: /[ഀ-ൿ]/,
    profile: {
      code: "ml", name: "Malayalam", unitsPerSecond: 2.2, measure: "words",
      accent: "a native Malayalam speaker from Kerala, India, narrating in natural conversational Malayalam with an authentic local accent — never a foreign or American accent",
    },
  },
  {
    re: /[଀-୿]/,
    profile: {
      code: "or", name: "Odia", unitsPerSecond: 2.2, measure: "words",
      accent: "a native Odia speaker, narrating in natural conversational Odia with an authentic local accent — never a foreign or American accent",
    },
  },
  {
    // Devanagari covers Hindi and Marathi; Hindi is the far more common case.
    re: /[ऀ-ॿ]/,
    profile: {
      code: "hi", name: "Hindi", unitsPerSecond: 2.3, measure: "words",
      accent: "a native Hindi speaker from India, narrating in natural conversational Hindi with an authentic Indian accent — warm, confident and completely native, never a foreign or American accent",
    },
  },
  {
    re: /[؀-ۿ]/,
    profile: {
      code: "ar", name: "Arabic", unitsPerSecond: 2.2, measure: "words",
      accent: "a native Arabic speaker narrating in natural Modern Standard Arabic with an authentic native accent",
    },
  },
  {
    re: /[฀-๿]/,
    profile: {
      code: "th", name: "Thai", unitsPerSecond: 5.5, measure: "chars",
      accent: "a native Thai speaker narrating in natural conversational Thai with an authentic local accent",
    },
  },
  {
    re: /[぀-ヿ]/,
    profile: {
      code: "ja", name: "Japanese", unitsPerSecond: 6.0, measure: "chars",
      accent: "a native Japanese speaker narrating in natural conversational Japanese with an authentic native accent",
    },
  },
  {
    re: /[가-힯]/,
    profile: {
      code: "ko", name: "Korean", unitsPerSecond: 5.0, measure: "chars",
      accent: "a native Korean speaker narrating in natural conversational Korean with an authentic native accent",
    },
  },
  {
    re: /[一-鿿]/,
    profile: {
      code: "zh", name: "Chinese", unitsPerSecond: 5.0, measure: "chars",
      accent: "a native Mandarin Chinese speaker narrating in natural conversational Mandarin with an authentic native accent",
    },
  },
  {
    re: /[Ѐ-ӿ]/,
    profile: {
      code: "ru", name: "Russian", unitsPerSecond: 2.3, measure: "words",
      accent: "a native Russian speaker narrating in natural conversational Russian with an authentic native accent",
    },
  },
];

/**
 * Romanised Hindi ("Hinglish") is written in Latin script, so script
 * detection cannot see it. These are high-frequency function words that are
 * rare as standalone English words; several hits together is a strong signal.
 */
const HINGLISH_MARKERS = [
  "hai", "hain", "kya", "aur", "nahi", "nahin", "mera", "meri", "tera",
  "tumhara", "aapka", "karo", "karna", "kiya", "bhi", "yeh", "woh", "kaise",
  "kyun", "acha", "accha", "bohot", "bahut", "jaldi", "abhi", "matlab",
  "chahiye", "sakta", "sakte", "raha", "rahi", "hoga", "hogi",
];
const HINGLISH_THRESHOLD = 3;

function looksRomanisedHindi(text: string): boolean {
  const words = text.toLowerCase().split(/[^a-z]+/).filter(Boolean);
  if (words.length < 4) return false;
  const set = new Set(words);
  let hits = 0;
  for (const m of HINGLISH_MARKERS) {
    if (set.has(m)) hits++;
    if (hits >= HINGLISH_THRESHOLD) return true;
  }
  return false;
}

export function detectVoiceProfile(text: string | null | undefined): VoiceProfile {
  if (!text?.trim()) return ENGLISH;

  for (const { re, profile } of SCRIPT_RANGES) {
    if (re.test(text)) return profile;
  }

  if (looksRomanisedHindi(text)) {
    return {
      code: "hi-Latn",
      name: "Hindi (romanised)",
      unitsPerSecond: 2.3,
      measure: "words",
      accent:
        "a native Hindi speaker from India, narrating in natural conversational Hindi with an authentic Indian accent — the text is Hindi written in Latin letters, so pronounce it as Hindi, never as English words, and never with a foreign or American accent",
    };
  }

  return ENGLISH;
}

/** Seconds of speech the narration needs, including a short lead-in and tail. */
export function estimateSpeechSeconds(
  text: string | null | undefined,
  profile: VoiceProfile = detectVoiceProfile(text)
): number {
  if (!text?.trim()) return 0;

  const units =
    profile.measure === "chars"
      ? text.replace(/\s+/g, "").length
      : text.trim().split(/\s+/).length;

  // ~0.7s covers the pause before the first word and after the last.
  return units / profile.unitsPerSecond + 0.7;
}

/** The narrator description injected into the prompt. */
export function buildVoiceDirection(text: string): string {
  const profile = detectVoiceProfile(text);
  return (
    `Voiceover narration: ${profile.accent}. ` +
    `Natural conversational pacing with slight emphasis on key words. ` +
    `Studio-quality audio — crisp and clean, no distortion, no robotic artifacts, no background noise during speech. ` +
    `The narrator speaks these exact words verbatim, completing every word before the clip ends: "${text.trim()}"`
  );
}
