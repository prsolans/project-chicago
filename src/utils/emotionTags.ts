/**
 * Emotion Tags Utility
 * Defines supported emotion/effect tags and parses them from text
 */

export interface EmotionTag {
  tag: string;
  label: string;
  description: string;
  category: 'emotion' | 'effect' | 'pacing';
}

export interface ParsedLine {
  originalText: string;
  displayText: string;
  emotionSettings: EmotionSettings;
}

export interface EmotionSettings {
  emotion?: string;
  effect?: string;
  speed?: number;
  pauseAfter?: number;
}

/**
 * All supported emotion/effect tags
 */
export const EMOTION_TAGS: EmotionTag[] = [
  // Basic emotions
  { tag: 'excited', label: '[excited]', description: 'Enthusiastic, high energy', category: 'emotion' },
  { tag: 'sad', label: '[sad]', description: 'Somber, melancholic', category: 'emotion' },
  { tag: 'angry', label: '[angry]', description: 'Frustrated, intense', category: 'emotion' },
  { tag: 'scared', label: '[scared]', description: 'Fearful, anxious', category: 'emotion' },
  { tag: 'happy', label: '[happy]', description: 'Joyful, cheerful', category: 'emotion' },
  { tag: 'serious', label: '[serious]', description: 'Calm, measured', category: 'emotion' },

  // Effects
  { tag: 'laughs', label: '[laughs]', description: 'Adds laughter', category: 'effect' },
  { tag: 'sighs', label: '[sighs]', description: 'Adds sighing', category: 'effect' },
  { tag: 'whispers', label: '[whispers]', description: 'Soft, quiet', category: 'effect' },
  { tag: 'shouts', label: '[shouts]', description: 'Loud, emphasized', category: 'effect' },

  // Pacing
  { tag: 'fast', label: '[fast]', description: 'Quick speech (1.3x)', category: 'pacing' },
  { tag: 'slow', label: '[slow]', description: 'Slower speech (0.8x)', category: 'pacing' },
  { tag: 'pause:short', label: '[pause:short]', description: '500ms pause after', category: 'pacing' },
  { tag: 'pause:long', label: '[pause:long]', description: '2000ms pause after', category: 'pacing' },
];

/**
 * Map emotion tags to ElevenLabs voice settings
 */
export function getVoiceSettingsForEmotion(emotion: string): {
  stability: number;
  similarity_boost: number;
  style?: number;
  use_speaker_boost?: boolean;
} {
  switch (emotion) {
    case 'excited':
      return { stability: 0.3, similarity_boost: 0.7, style: 0.8, use_speaker_boost: true };
    case 'sad':
      return { stability: 0.7, similarity_boost: 0.8, style: 0.6, use_speaker_boost: false };
    case 'angry':
      return { stability: 0.4, similarity_boost: 0.8, style: 0.85, use_speaker_boost: true };
    case 'scared':
      return { stability: 0.5, similarity_boost: 0.7, style: 0.7, use_speaker_boost: true };
    case 'happy':
      return { stability: 0.4, similarity_boost: 0.7, style: 0.75, use_speaker_boost: true };
    case 'serious':
      return { stability: 0.8, similarity_boost: 0.8, style: 0.2, use_speaker_boost: false };
    case 'whispers':
      return { stability: 0.7, similarity_boost: 0.6, style: 0.4, use_speaker_boost: false };
    case 'shouts':
      return { stability: 0.3, similarity_boost: 0.8, style: 0.9, use_speaker_boost: true };
    default:
      return { stability: 0.5, similarity_boost: 0.75, style: 0.5, use_speaker_boost: true };
  }
}

/**
 * Map speed tags to playback rate
 */
export function getSpeedMultiplier(speedTag: string): number {
  switch (speedTag) {
    case 'fast':
      return 1.3;
    case 'slow':
      return 0.8;
    default:
      return 1.0;
  }
}

/**
 * Map pause tags to milliseconds
 */
export function getPauseMilliseconds(pauseTag: string): number {
  switch (pauseTag) {
    case 'pause:short':
      return 500;
    case 'pause:long':
      return 2000;
    default:
      return 0;
  }
}

/**
 * Parse a line of text to extract emotion tags and settings
 */
export function parseEmotionTags(text: string): ParsedLine {
  let displayText = text;
  const settings: EmotionSettings = {};

  // Extract tags in format [tag] at the start of the line
  const tagRegex = /^\[(excited|sad|angry|scared|happy|serious|laughs|sighs|whispers|shouts|fast|slow|pause:short|pause:long)\]\s*/i;
  const match = text.match(tagRegex);

  if (match) {
    const tag = match[1].toLowerCase();

    // Determine tag category and set appropriate setting
    if (['excited', 'sad', 'angry', 'scared', 'happy', 'serious'].includes(tag)) {
      settings.emotion = tag;
    } else if (['laughs', 'sighs', 'whispers', 'shouts'].includes(tag)) {
      settings.effect = tag;
      // Effects can also act as emotions for voice settings
      if (['whispers', 'shouts'].includes(tag)) {
        settings.emotion = tag;
      }
    } else if (['fast', 'slow'].includes(tag)) {
      settings.speed = getSpeedMultiplier(tag);
    } else if (tag.startsWith('pause:')) {
      settings.pauseAfter = getPauseMilliseconds(tag);
    }

    // Keep the tag in display text as per user preference
    // displayText remains unchanged to show [tag]
  }

  return {
    originalText: text,
    displayText,
    emotionSettings: settings,
  };
}

/**
 * Convert ElevenLabs-style effects to their text representation
 * [laughs] → actual laugh sound in ElevenLabs
 * [sighs] → actual sigh sound
 */
export function prepareTextForElevenLabs(text: string): string {
  // ElevenLabs natively supports [laughs] and [sighs] tags
  // We just need to ensure they're in the text
  return text;
}

/**
 * For Web Speech API fallback, remove effect tags since they're not supported
 */
export function prepareTextForWebSpeech(text: string): string {
  // Remove effect tags that Web Speech doesn't understand
  return text.replace(/\[(laughs|sighs)\]/gi, '');
}

/**
 * Get tag suggestions for autocomplete
 * Returns tags filtered by partial input
 */
export function getTagSuggestions(partial: string): EmotionTag[] {
  const lower = partial.toLowerCase();
  return EMOTION_TAGS.filter(tag =>
    tag.tag.startsWith(lower) || tag.label.includes(lower)
  );
}

/**
 * Check if a tag is valid
 */
export function isValidTag(tag: string): boolean {
  return EMOTION_TAGS.some(t => t.tag === tag.toLowerCase());
}
