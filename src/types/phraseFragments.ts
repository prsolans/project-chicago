/**
 * Phrase Fragment Types
 *
 * Defines the structure for buildable phrase fragments that users can
 * combine to create custom sentences for rapid communication.
 */

/**
 * The grammatical/semantic type of a fragment
 */
export type FragmentType =
  | 'subject'       // I, you, we, they, Michael, etc.
  | 'verb'          // want to, need to, think, feel, etc.
  | 'auxiliary'     // do, will, would, can, could, have, etc.
  | 'negation'      // not, don't, won't, can't, never, etc.
  | 'interrogative' // what, why, how, when, where, who, which
  | 'object'        // talk, eat, understand, etc.
  | 'topic'         // meaning, purpose, death, freedom, etc.
  | 'modifier'      // about, with, sometimes, deeply, etc.
  | 'emotion'       // anxious, hopeful, conflicted, etc.
  | 'connector'     // and, but, because, etc.
  | 'emotionTag';   // [excited], [sad], [laughs], etc. - TTS modifiers

/**
 * Semantic categories for intuitive navigation
 * Groups grammatical types by communication function
 */
export type SemanticCategory =
  | 'WHO'   // subjects - who is speaking/being discussed
  | 'DO'    // verbs + auxiliaries - actions and states
  | 'FEEL'  // emotions - feelings and emotional states
  | 'WHAT'  // objects + topics - things being discussed
  | 'HOW'   // modifiers + interrogatives - context, manner, questions
  | 'LINK'  // connectors + negations - linking and negating
  | 'VOICE'; // emotion tags - TTS voice modifiers

/**
 * Maps semantic categories to their underlying fragment types
 */
export const SEMANTIC_CATEGORY_MAP: Record<SemanticCategory, FragmentType[]> = {
  WHO: ['subject'],
  DO: ['verb', 'auxiliary'],
  FEEL: ['emotion'],
  WHAT: ['object', 'topic'],
  HOW: ['modifier', 'interrogative'],
  LINK: ['connector', 'negation'],
  VOICE: ['emotionTag'],
};

/**
 * Get the semantic category for a fragment type
 */
export function getSemanticCategory(type: FragmentType): SemanticCategory {
  for (const [category, types] of Object.entries(SEMANTIC_CATEGORY_MAP)) {
    if (types.includes(type)) {
      return category as SemanticCategory;
    }
  }
  return 'WHAT'; // fallback
}

/**
 * Thematic category for organizing fragments
 */
export type FragmentCategory =
  | 'personal'       // Personal pronouns, names, basic needs
  | 'action'         // Actions, verbs, mental activities
  | 'grammatical'    // Grammar helpers (auxiliaries, negations, interrogatives)
  | 'emotional'      // Feelings, emotional states
  | 'social'         // Social interactions, relationships
  | 'temporal'       // Time-related modifiers and references
  | 'intensity'      // Degree/intensity modifiers
  | 'tts_emotion'    // TTS emotion tags ([excited], [sad], etc.)
  | 'tts_effect'     // TTS effect tags ([laughs], [sighs], etc.)
  | 'tts_pacing';    // TTS pacing tags ([fast], [slow])

/**
 * How commonly a fragment is used (for UI prioritization)
 */
export type FragmentCommonality = 'very_common' | 'common' | 'uncommon' | 'specialized';

/**
 * A single phrase fragment that can be combined with others
 */
export interface PhraseFragment {
  id: string;
  text: string;
  type: FragmentType;
  category: FragmentCategory;
  commonality: FragmentCommonality;
  usageCount?: number;        // Track how often user selects this
  isCustom?: boolean;         // User-created fragment
  createdAt?: Date;
  metadata?: {
    synonyms?: string[];      // Alternative phrasings
    followsWell?: string[];   // IDs of fragments that commonly follow
    precedesWell?: string[];  // IDs of fragments that commonly precede
  };
}

/**
 * A sequence of fragments that forms a complete thought
 */
export interface BuiltPhrase {
  id: string;
  fragments: PhraseFragment[];
  fullText: string;             // Computed from fragments
  usageCount: number;
  isFavorite?: boolean;
  createdAt: Date;
  lastUsedAt?: Date;
  context?: {
    timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
    participants?: string[];   // Who was present when used
    emotion?: string;          // Emotional context
  };
}

/**
 * Fragment selection state during phrase building
 */
export interface FragmentSelection {
  fragments: PhraseFragment[];
  currentType: FragmentType | null;  // What type should be selected next
  previewText: string;                // Current phrase preview
  isComplete: boolean;                // Can this be spoken?
}

/**
 * Template for common phrase patterns
 */
export interface FragmentTemplate {
  id: string;
  name: string;
  description: string;
  pattern: FragmentType[];            // Expected sequence of fragment types
  examples: string[];                 // Example sentences
  category: 'question' | 'statement' | 'request' | 'expression';
}

/**
 * Fragment library organization
 */
export interface FragmentLibrary {
  fragments: PhraseFragment[];
  builtPhrases: BuiltPhrase[];
  templates: FragmentTemplate[];
  customFragments: PhraseFragment[];
  recentlyUsed: string[];             // Fragment IDs
  favorites: string[];                // Fragment IDs
}

/**
 * Context-aware fragment suggestions
 */
export interface FragmentSuggestion {
  fragment: PhraseFragment;
  confidence: number;                 // 0-1, how confident this is relevant
  reason: 'frequency' | 'context' | 'time' | 'participants' | 'pattern';
}
