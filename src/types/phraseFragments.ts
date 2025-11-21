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
  | 'subject'      // I, you, we, they, Michael, etc.
  | 'verb'         // want to, need to, think, feel, etc.
  | 'object'       // talk, eat, understand, etc.
  | 'topic'        // meaning, purpose, death, freedom, etc.
  | 'modifier'     // about, with, sometimes, deeply, etc.
  | 'emotion'      // anxious, hopeful, conflicted, etc.
  | 'connector';   // and, but, because, etc.

/**
 * Thematic category for organizing fragments
 */
export type FragmentCategory =
  | 'personal'       // Personal pronouns, names
  | 'action'         // Actions, verbs
  | 'philosophical'  // Abstract concepts, existential topics
  | 'emotional'      // Feelings, emotional states
  | 'social'         // Social interactions, relationships
  | 'temporal'       // Time-related modifiers
  | 'intensity';     // Degree/intensity modifiers

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
