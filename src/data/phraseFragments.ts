/**
 * Phrase Fragment Library
 *
 * Comprehensive collection of phrase fragments for building custom sentences.
 * Organized by type and category to enable rapid, expressive communication.
 */

import type { PhraseFragment, FragmentTemplate } from '../types/phraseFragments';

/**
 * SUBJECTS - Who or what the sentence is about
 */
export const subjectFragments: PhraseFragment[] = [
  // Personal pronouns
  { id: 's_i', text: 'I', type: 'subject', category: 'personal', commonality: 'very_common' },
  { id: 's_you', text: 'you', type: 'subject', category: 'personal', commonality: 'very_common' },
  { id: 's_we', text: 'we', type: 'subject', category: 'personal', commonality: 'very_common' },
  { id: 's_they', text: 'they', type: 'subject', category: 'personal', commonality: 'common' },
  { id: 's_he', text: 'he', type: 'subject', category: 'personal', commonality: 'common' },
  { id: 's_she', text: 'she', type: 'subject', category: 'personal', commonality: 'common' },

  // Family members (personalized for Ashley)
  { id: 's_tony', text: 'Tony', type: 'subject', category: 'personal', commonality: 'very_common' },
  { id: 's_michael', text: 'Michael', type: 'subject', category: 'personal', commonality: 'very_common' },
  { id: 's_claire', text: 'Claire', type: 'subject', category: 'personal', commonality: 'very_common' },
  { id: 's_kids', text: 'the kids', type: 'subject', category: 'personal', commonality: 'common' },
  { id: 's_family', text: 'my family', type: 'subject', category: 'personal', commonality: 'common' },

  // Abstract/philosophical subjects
  { id: 's_life', text: 'life', type: 'subject', category: 'philosophical', commonality: 'common' },
  { id: 's_world', text: 'the world', type: 'subject', category: 'philosophical', commonality: 'common' },
  { id: 's_people', text: 'people', type: 'subject', category: 'philosophical', commonality: 'common' },
  { id: 's_death', text: 'death', type: 'subject', category: 'philosophical', commonality: 'uncommon' },
  { id: 's_time', text: 'time', type: 'subject', category: 'philosophical', commonality: 'uncommon' },
  { id: 's_love', text: 'love', type: 'subject', category: 'emotional', commonality: 'common' },
  { id: 's_this', text: 'this', type: 'subject', category: 'personal', commonality: 'very_common' },
];

/**
 * VERBS - Actions, states of being, mental activities
 */
export const verbFragments: PhraseFragment[] = [
  // Common action verbs
  { id: 'v_want', text: 'want to', type: 'verb', category: 'action', commonality: 'very_common' },
  { id: 'v_need', text: 'need to', type: 'verb', category: 'action', commonality: 'very_common' },
  { id: 'v_can', text: 'can', type: 'verb', category: 'action', commonality: 'very_common' },
  { id: 'v_should', text: 'should', type: 'verb', category: 'action', commonality: 'common' },
  { id: 'v_will', text: 'will', type: 'verb', category: 'action', commonality: 'common' },
  { id: 'v_would_like', text: 'would like to', type: 'verb', category: 'action', commonality: 'common' },

  // Mental/emotional verbs
  { id: 'v_think', text: 'think', type: 'verb', category: 'action', commonality: 'very_common' },
  { id: 'v_feel', text: 'feel', type: 'verb', category: 'emotional', commonality: 'very_common' },
  { id: 'v_believe', text: 'believe', type: 'verb', category: 'philosophical', commonality: 'common' },
  { id: 'v_wonder', text: 'wonder', type: 'verb', category: 'philosophical', commonality: 'common' },
  { id: 'v_hope', text: 'hope', type: 'verb', category: 'emotional', commonality: 'common' },
  { id: 'v_fear', text: 'fear', type: 'verb', category: 'emotional', commonality: 'common' },
  { id: 'v_worry', text: 'worry', type: 'verb', category: 'emotional', commonality: 'common' },
  { id: 'v_love', text: 'love', type: 'verb', category: 'emotional', commonality: 'very_common' },
  { id: 'v_hate', text: 'hate', type: 'verb', category: 'emotional', commonality: 'uncommon' },
  { id: 'v_miss', text: 'miss', type: 'verb', category: 'emotional', commonality: 'common' },
  { id: 'v_appreciate', text: 'appreciate', type: 'verb', category: 'emotional', commonality: 'common' },
  { id: 'v_grateful', text: 'am grateful for', type: 'verb', category: 'emotional', commonality: 'common' },
  { id: 'v_understand', text: 'understand', type: 'verb', category: 'philosophical', commonality: 'common' },
  { id: 'v_question', text: 'question', type: 'verb', category: 'philosophical', commonality: 'common' },
  { id: 'v_doubt', text: 'doubt', type: 'verb', category: 'philosophical', commonality: 'uncommon' },
  { id: 'v_struggle', text: 'struggle with', type: 'verb', category: 'emotional', commonality: 'common' },
  { id: 'v_remember', text: 'remember', type: 'verb', category: 'personal', commonality: 'common' },
  { id: 'v_forget', text: 'forget', type: 'verb', category: 'personal', commonality: 'uncommon' },
  { id: 'v_regret', text: 'regret', type: 'verb', category: 'emotional', commonality: 'uncommon' },

  // States of being
  { id: 'v_am', text: 'am', type: 'verb', category: 'personal', commonality: 'very_common' },
  { id: 'v_was', text: 'was', type: 'verb', category: 'personal', commonality: 'common' },
  { id: 'v_have', text: 'have', type: 'verb', category: 'personal', commonality: 'very_common' },
  { id: 'v_had', text: 'had', type: 'verb', category: 'personal', commonality: 'common' },
];

/**
 * OBJECTS/TOPICS - What the action is directed toward
 */
export const objectFragments: PhraseFragment[] = [
  // Communication actions
  { id: 'o_talk', text: 'talk', type: 'object', category: 'social', commonality: 'very_common' },
  { id: 'o_discuss', text: 'discuss', type: 'object', category: 'social', commonality: 'common' },
  { id: 'o_share', text: 'share', type: 'object', category: 'social', commonality: 'common' },
  { id: 'o_express', text: 'express', type: 'object', category: 'social', commonality: 'common' },
  { id: 'o_say', text: 'say', type: 'object', category: 'social', commonality: 'very_common' },
  { id: 'o_ask', text: 'ask', type: 'object', category: 'social', commonality: 'common' },
  { id: 'o_tell', text: 'tell you', type: 'object', category: 'social', commonality: 'common' },

  // Basic needs
  { id: 'o_eat', text: 'eat', type: 'object', category: 'personal', commonality: 'very_common' },
  { id: 'o_drink', text: 'drink', type: 'object', category: 'personal', commonality: 'common' },
  { id: 'o_sleep', text: 'sleep', type: 'object', category: 'personal', commonality: 'common' },
  { id: 'o_rest', text: 'rest', type: 'object', category: 'personal', commonality: 'common' },

  // Philosophical/abstract topics
  { id: 'o_meaning', text: 'meaning', type: 'object', category: 'philosophical', commonality: 'uncommon' },
  { id: 'o_purpose', text: 'purpose', type: 'object', category: 'philosophical', commonality: 'uncommon' },
  { id: 'o_existence', text: 'existence', type: 'object', category: 'philosophical', commonality: 'specialized' },
  { id: 'o_mortality', text: 'mortality', type: 'object', category: 'philosophical', commonality: 'specialized' },
  { id: 'o_death', text: 'death', type: 'object', category: 'philosophical', commonality: 'uncommon' },
  { id: 'o_dying', text: 'dying', type: 'object', category: 'philosophical', commonality: 'uncommon' },
  { id: 'o_legacy', text: 'legacy', type: 'object', category: 'philosophical', commonality: 'uncommon' },
  { id: 'o_identity', text: 'identity', type: 'object', category: 'philosophical', commonality: 'specialized' },
  { id: 'o_consciousness', text: 'consciousness', type: 'object', category: 'philosophical', commonality: 'specialized' },
  { id: 'o_freedom', text: 'freedom', type: 'object', category: 'philosophical', commonality: 'uncommon' },
  { id: 'o_choice', text: 'choice', type: 'object', category: 'philosophical', commonality: 'uncommon' },
  { id: 'o_suffering', text: 'suffering', type: 'object', category: 'philosophical', commonality: 'uncommon' },
  { id: 'o_joy', text: 'joy', type: 'object', category: 'emotional', commonality: 'common' },
  { id: 'o_pain', text: 'pain', type: 'object', category: 'emotional', commonality: 'common' },
  { id: 'o_hope', text: 'hope', type: 'object', category: 'emotional', commonality: 'common' },
  { id: 'o_fear', text: 'fear', type: 'object', category: 'emotional', commonality: 'common' },

  // Relationships
  { id: 'o_relationship', text: 'our relationship', type: 'object', category: 'social', commonality: 'common' },
  { id: 'o_connection', text: 'connection', type: 'object', category: 'social', commonality: 'uncommon' },
  { id: 'o_family', text: 'family', type: 'object', category: 'social', commonality: 'common' },
  { id: 'o_love', text: 'love', type: 'object', category: 'emotional', commonality: 'common' },
  { id: 'o_loss', text: 'loss', type: 'object', category: 'emotional', commonality: 'uncommon' },

  // Time and change
  { id: 'o_future', text: 'the future', type: 'object', category: 'philosophical', commonality: 'common' },
  { id: 'o_past', text: 'the past', type: 'object', category: 'philosophical', commonality: 'common' },
  { id: 'o_time', text: 'time', type: 'object', category: 'philosophical', commonality: 'common' },
  { id: 'o_change', text: 'change', type: 'object', category: 'philosophical', commonality: 'common' },
  { id: 'o_memories', text: 'memories', type: 'object', category: 'personal', commonality: 'common' },

  // Current experience
  { id: 'o_this', text: 'this', type: 'object', category: 'personal', commonality: 'very_common' },
  { id: 'o_that', text: 'that', type: 'object', category: 'personal', commonality: 'very_common' },
  { id: 'o_everything', text: 'everything', type: 'object', category: 'personal', commonality: 'common' },
  { id: 'o_nothing', text: 'nothing', type: 'object', category: 'personal', commonality: 'common' },
];

/**
 * MODIFIERS - How, when, where, or to what degree
 */
export const modifierFragments: PhraseFragment[] = [
  // Relational
  { id: 'm_about', text: 'about', type: 'modifier', category: 'personal', commonality: 'very_common' },
  { id: 'm_with', text: 'with', type: 'modifier', category: 'social', commonality: 'very_common' },
  { id: 'm_to', text: 'to', type: 'modifier', category: 'personal', commonality: 'very_common' },
  { id: 'm_for', text: 'for', type: 'modifier', category: 'personal', commonality: 'very_common' },
  { id: 'm_from', text: 'from', type: 'modifier', category: 'personal', commonality: 'common' },
  { id: 'm_without', text: 'without', type: 'modifier', category: 'personal', commonality: 'common' },

  // Frequency/time
  { id: 'm_always', text: 'always', type: 'modifier', category: 'temporal', commonality: 'common' },
  { id: 'm_never', text: 'never', type: 'modifier', category: 'temporal', commonality: 'common' },
  { id: 'm_sometimes', text: 'sometimes', type: 'modifier', category: 'temporal', commonality: 'common' },
  { id: 'm_often', text: 'often', type: 'modifier', category: 'temporal', commonality: 'common' },
  { id: 'm_rarely', text: 'rarely', type: 'modifier', category: 'temporal', commonality: 'uncommon' },
  { id: 'm_still', text: 'still', type: 'modifier', category: 'temporal', commonality: 'common' },
  { id: 'm_anymore', text: 'anymore', type: 'modifier', category: 'temporal', commonality: 'common' },
  { id: 'm_now', text: 'now', type: 'modifier', category: 'temporal', commonality: 'common' },
  { id: 'm_lately', text: 'lately', type: 'modifier', category: 'temporal', commonality: 'common' },

  // Intensity/degree
  { id: 'm_very', text: 'very', type: 'modifier', category: 'intensity', commonality: 'very_common' },
  { id: 'm_so', text: 'so', type: 'modifier', category: 'intensity', commonality: 'very_common' },
  { id: 'm_really', text: 'really', type: 'modifier', category: 'intensity', commonality: 'very_common' },
  { id: 'm_deeply', text: 'deeply', type: 'modifier', category: 'intensity', commonality: 'common' },
  { id: 'm_barely', text: 'barely', type: 'modifier', category: 'intensity', commonality: 'uncommon' },
  { id: 'm_truly', text: 'truly', type: 'modifier', category: 'intensity', commonality: 'common' },
  { id: 'm_desperately', text: 'desperately', type: 'modifier', category: 'intensity', commonality: 'uncommon' },
  { id: 'm_completely', text: 'completely', type: 'modifier', category: 'intensity', commonality: 'common' },
  { id: 'm_partially', text: 'partially', type: 'modifier', category: 'intensity', commonality: 'uncommon' },

  // Context/situation
  { id: 'm_right_now', text: 'right now', type: 'modifier', category: 'temporal', commonality: 'very_common' },
  { id: 'm_today', text: 'today', type: 'modifier', category: 'temporal', commonality: 'common' },
  { id: 'm_tonight', text: 'tonight', type: 'modifier', category: 'temporal', commonality: 'common' },
  { id: 'm_soon', text: 'soon', type: 'modifier', category: 'temporal', commonality: 'common' },
  { id: 'm_later', text: 'later', type: 'modifier', category: 'temporal', commonality: 'common' },
];

/**
 * EMOTIONS - Specific emotional states
 */
export const emotionFragments: PhraseFragment[] = [
  // Basic emotions
  { id: 'e_happy', text: 'happy', type: 'emotion', category: 'emotional', commonality: 'very_common' },
  { id: 'e_sad', text: 'sad', type: 'emotion', category: 'emotional', commonality: 'very_common' },
  { id: 'e_angry', text: 'angry', type: 'emotion', category: 'emotional', commonality: 'common' },
  { id: 'e_scared', text: 'scared', type: 'emotion', category: 'emotional', commonality: 'common' },
  { id: 'e_worried', text: 'worried', type: 'emotion', category: 'emotional', commonality: 'common' },

  // Complex emotions
  { id: 'e_anxious', text: 'anxious', type: 'emotion', category: 'emotional', commonality: 'common' },
  { id: 'e_hopeful', text: 'hopeful', type: 'emotion', category: 'emotional', commonality: 'common' },
  { id: 'e_conflicted', text: 'conflicted', type: 'emotion', category: 'emotional', commonality: 'uncommon' },
  { id: 'e_grateful', text: 'grateful', type: 'emotion', category: 'emotional', commonality: 'common' },
  { id: 'e_frustrated', text: 'frustrated', type: 'emotion', category: 'emotional', commonality: 'common' },
  { id: 'e_curious', text: 'curious', type: 'emotion', category: 'emotional', commonality: 'common' },
  { id: 'e_lonely', text: 'lonely', type: 'emotion', category: 'emotional', commonality: 'common' },
  { id: 'e_peaceful', text: 'peaceful', type: 'emotion', category: 'emotional', commonality: 'common' },
  { id: 'e_overwhelmed', text: 'overwhelmed', type: 'emotion', category: 'emotional', commonality: 'common' },
  { id: 'e_exhausted', text: 'exhausted', type: 'emotion', category: 'emotional', commonality: 'common' },
  { id: 'e_confused', text: 'confused', type: 'emotion', category: 'emotional', commonality: 'common' },
  { id: 'e_nostalgic', text: 'nostalgic', type: 'emotion', category: 'emotional', commonality: 'uncommon' },
  { id: 'e_proud', text: 'proud', type: 'emotion', category: 'emotional', commonality: 'common' },
  { id: 'e_ashamed', text: 'ashamed', type: 'emotion', category: 'emotional', commonality: 'uncommon' },
  { id: 'e_guilty', text: 'guilty', type: 'emotion', category: 'emotional', commonality: 'uncommon' },
  { id: 'e_relieved', text: 'relieved', type: 'emotion', category: 'emotional', commonality: 'common' },
  { id: 'e_disappointed', text: 'disappointed', type: 'emotion', category: 'emotional', commonality: 'common' },
  { id: 'e_numb', text: 'numb', type: 'emotion', category: 'emotional', commonality: 'uncommon' },
  { id: 'e_alive', text: 'alive', type: 'emotion', category: 'emotional', commonality: 'uncommon' },
  { id: 'e_trapped', text: 'trapped', type: 'emotion', category: 'emotional', commonality: 'uncommon' },
  { id: 'e_free', text: 'free', type: 'emotion', category: 'emotional', commonality: 'uncommon' },
  { id: 'e_loved', text: 'loved', type: 'emotion', category: 'emotional', commonality: 'common' },
  { id: 'e_invisible', text: 'invisible', type: 'emotion', category: 'emotional', commonality: 'uncommon' },
  { id: 'e_seen', text: 'seen', type: 'emotion', category: 'emotional', commonality: 'uncommon' },
  { id: 'e_heard', text: 'heard', type: 'emotion', category: 'emotional', commonality: 'uncommon' },
];

/**
 * CONNECTORS - Link fragments together
 */
export const connectorFragments: PhraseFragment[] = [
  { id: 'c_and', text: 'and', type: 'connector', category: 'personal', commonality: 'very_common' },
  { id: 'c_but', text: 'but', type: 'connector', category: 'personal', commonality: 'very_common' },
  { id: 'c_because', text: 'because', type: 'connector', category: 'personal', commonality: 'common' },
  { id: 'c_so', text: 'so', type: 'connector', category: 'personal', commonality: 'common' },
  { id: 'c_or', text: 'or', type: 'connector', category: 'personal', commonality: 'common' },
  { id: 'c_if', text: 'if', type: 'connector', category: 'personal', commonality: 'common' },
  { id: 'c_when', text: 'when', type: 'connector', category: 'personal', commonality: 'common' },
  { id: 'c_while', text: 'while', type: 'connector', category: 'personal', commonality: 'uncommon' },
  { id: 'c_though', text: 'though', type: 'connector', category: 'personal', commonality: 'uncommon' },
  { id: 'c_yet', text: 'yet', type: 'connector', category: 'personal', commonality: 'uncommon' },
];

/**
 * All fragments combined
 */
export const allFragments: PhraseFragment[] = [
  ...subjectFragments,
  ...verbFragments,
  ...objectFragments,
  ...modifierFragments,
  ...emotionFragments,
  ...connectorFragments,
];

/**
 * Common phrase templates/patterns
 */
export const fragmentTemplates: FragmentTemplate[] = [
  {
    id: 'tpl_simple_statement',
    name: 'Simple Statement',
    description: 'I [verb] [object/emotion]',
    pattern: ['subject', 'verb', 'object'],
    examples: ['I feel anxious', 'I want talk', 'I love you'],
    category: 'statement',
  },
  {
    id: 'tpl_modified_statement',
    name: 'Modified Statement',
    description: 'I [modifier] [verb] [object]',
    pattern: ['subject', 'modifier', 'verb', 'object'],
    examples: ['I deeply love you', 'I always think about death'],
    category: 'statement',
  },
  {
    id: 'tpl_about_statement',
    name: 'About Statement',
    description: 'I [verb] about [topic]',
    pattern: ['subject', 'verb', 'modifier', 'object'],
    examples: ['I think about meaning', 'I wonder about purpose'],
    category: 'expression',
  },
  {
    id: 'tpl_with_statement',
    name: 'With Statement',
    description: 'I want to [verb] with [subject]',
    pattern: ['subject', 'verb', 'object', 'modifier', 'subject'],
    examples: ['I want to talk with you', 'I want to share with Tony'],
    category: 'request',
  },
  {
    id: 'tpl_feeling',
    name: 'Feeling Expression',
    description: 'I feel [emotion] about [topic]',
    pattern: ['subject', 'verb', 'emotion', 'modifier', 'object'],
    examples: ['I feel anxious about death', 'I feel grateful for family'],
    category: 'expression',
  },
  {
    id: 'tpl_comparison',
    name: 'Comparison',
    description: '[Subject] [verb] [object] but [subject] [verb] [object]',
    pattern: ['subject', 'verb', 'object', 'connector', 'subject', 'verb', 'object'],
    examples: ['I want rest but I fear death', 'I love life but I suffer'],
    category: 'expression',
  },
];

/**
 * Get fragments by type
 */
export const getFragmentsByType = (type: string): PhraseFragment[] => {
  return allFragments.filter(f => f.type === type);
};

/**
 * Get fragments by category
 */
export const getFragmentsByCategory = (category: string): PhraseFragment[] => {
  return allFragments.filter(f => f.category === category);
};

/**
 * Get fragment by ID
 */
export const getFragmentById = (id: string): PhraseFragment | undefined => {
  return allFragments.find(f => f.id === id);
};
