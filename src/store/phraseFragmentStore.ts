/**
 * Phrase Fragment Store
 *
 * Manages state for buildable phrase fragments, including:
 * - Current fragment selection during phrase building
 * - Saved built phrases
 * - Custom user fragments
 * - Usage tracking and personalization
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  PhraseFragment,
  BuiltPhrase,
  FragmentSelection,
  FragmentType,
  FragmentSuggestion,
  SemanticCategory,
} from '../types/phraseFragments';
import { getSemanticCategory, SEMANTIC_CATEGORY_MAP } from '../types/phraseFragments';
import { allFragments } from '../data/phraseFragments';

interface PhraseFragmentState {
  // Current fragment selection during building
  currentSelection: FragmentSelection;

  // Active semantic category for navigation
  activeCategory: SemanticCategory;

  // Saved built phrases
  builtPhrases: BuiltPhrase[];

  // Custom user-created fragments
  customFragments: PhraseFragment[];

  // Recently used fragments (for quick access)
  recentFragmentIds: string[];

  // Favorite fragments
  favoriteFragmentIds: string[];

  // Usage counts (fragment ID -> count)
  usageCounts: Record<string, number>;

  // Actions: Fragment Selection
  addFragment: (fragment: PhraseFragment) => void;
  removeLastFragment: () => void;
  clearSelection: () => void;
  setCurrentSelection: (selection: FragmentSelection) => void;

  // Actions: Semantic Category Navigation
  setActiveCategory: (category: SemanticCategory) => void;
  getSuggestedCategory: () => SemanticCategory;

  // Actions: Built Phrases
  saveBuiltPhrase: (phrase?: Partial<BuiltPhrase>) => void;
  deleteBuiltPhrase: (id: string) => void;
  toggleFavoritePhrase: (id: string) => void;
  useBuiltPhrase: (id: string) => string;

  // Actions: Custom Fragments
  addCustomFragment: (fragment: Omit<PhraseFragment, 'id' | 'isCustom'>) => void;
  deleteCustomFragment: (id: string) => void;

  // Actions: Personalization
  incrementUsage: (fragmentId: string) => void;
  toggleFavoriteFragment: (fragmentId: string) => void;
  clearRecents: () => void;

  // Getters
  getAllFragments: () => PhraseFragment[];
  getFragmentsByType: (type: FragmentType) => PhraseFragment[];
  getFragmentsBySemanticCategory: (category: SemanticCategory) => PhraseFragment[];
  getSuggestedFragments: (currentType: FragmentType | null) => FragmentSuggestion[];
  getPreviewText: () => string;
}

/**
 * Generate preview text from current fragment selection
 * Note: No automatic punctuation - user controls when sentence is complete
 */
const generatePreviewText = (fragments: PhraseFragment[]): string => {
  if (fragments.length === 0) return '';

  // Join fragments with proper spacing
  let text = fragments.map(f => f.text).join(' ');

  // Capitalize first letter
  text = text.charAt(0).toUpperCase() + text.slice(1);

  return text;
};

/**
 * Determine what type of fragment should come next
 */
const getNextFragmentType = (fragments: PhraseFragment[]): FragmentType | null => {
  if (fragments.length === 0) return 'subject';

  const lastFragment = fragments[fragments.length - 1];
  const hasSubject = fragments.some(f => f.type === 'subject');
  const hasVerb = fragments.some(f => f.type === 'verb');
  const hasObject = fragments.some(f => f.type === 'object' || f.type === 'emotion');

  // Basic pattern: subject -> verb -> object/emotion
  if (!hasSubject) return 'subject';
  if (!hasVerb) return 'verb';
  if (!hasObject) return 'object'; // Could also be 'emotion'

  // After basic sentence, allow modifiers or connectors
  if (lastFragment.type === 'verb') return 'object';
  if (lastFragment.type === 'subject') return 'verb';
  if (lastFragment.type === 'object' || lastFragment.type === 'emotion') {
    // Can add modifier, connector, or finish
    return null;
  }

  return null; // Complete
};

/**
 * Get suggested semantic category based on current fragments
 * Follows natural English SVO patterns as a visual hint only
 */
const computeSuggestedCategory = (fragments: PhraseFragment[]): SemanticCategory => {
  if (fragments.length === 0) return 'WHO'; // Start with subject

  const lastFragment = fragments[fragments.length - 1];
  const lastCategory = getSemanticCategory(lastFragment.type);

  // Common SVO pattern suggestions
  switch (lastCategory) {
    case 'WHO': return 'DO';      // Subject → Verb
    case 'DO': return 'WHAT';     // Verb → Object
    case 'FEEL': return 'HOW';    // Emotion → Modifier (about what)
    case 'WHAT': return 'LINK';   // Object → Connector (to continue)
    case 'HOW': return 'WHAT';    // Modifier → Object
    case 'LINK': return 'WHO';    // Connector → New subject
    case 'VOICE': return 'WHO';   // Emotion tag → Subject
    default: return 'DO';
  }
};

export const usePhraseFragmentStore = create<PhraseFragmentState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentSelection: {
        fragments: [],
        currentType: 'subject',
        previewText: '',
        isComplete: false,
      },
      activeCategory: 'WHO',
      builtPhrases: [],
      customFragments: [],
      recentFragmentIds: [],
      favoriteFragmentIds: [],
      usageCounts: {},

      // Fragment Selection Actions
      addFragment: (fragment: PhraseFragment) => {
        set((state) => {
          const newFragments = [...state.currentSelection.fragments, fragment];
          const previewText = generatePreviewText(newFragments);
          const currentType = getNextFragmentType(newFragments);
          const isComplete = currentType === null || newFragments.length >= 6; // Max 6 fragments

          // Update usage count and recents
          const newUsageCounts = { ...state.usageCounts };
          newUsageCounts[fragment.id] = (newUsageCounts[fragment.id] || 0) + 1;

          const newRecents = [fragment.id, ...state.recentFragmentIds.filter(id => id !== fragment.id)].slice(0, 20);

          return {
            currentSelection: {
              fragments: newFragments,
              currentType,
              previewText,
              isComplete,
            },
            usageCounts: newUsageCounts,
            recentFragmentIds: newRecents,
          };
        });
      },

      removeLastFragment: () => {
        set((state) => {
          if (state.currentSelection.fragments.length === 0) return state;

          const newFragments = state.currentSelection.fragments.slice(0, -1);
          const previewText = generatePreviewText(newFragments);
          const currentType = getNextFragmentType(newFragments);
          const isComplete = false;

          return {
            currentSelection: {
              fragments: newFragments,
              currentType,
              previewText,
              isComplete,
            },
          };
        });
      },

      clearSelection: () => {
        set({
          currentSelection: {
            fragments: [],
            currentType: 'subject',
            previewText: '',
            isComplete: false,
          },
          activeCategory: 'WHO',
        });
      },

      setCurrentSelection: (selection: FragmentSelection) => {
        set({ currentSelection: selection });
      },

      // Semantic Category Navigation Actions
      setActiveCategory: (category: SemanticCategory) => {
        set({ activeCategory: category });
      },

      getSuggestedCategory: () => {
        const state = get();
        return computeSuggestedCategory(state.currentSelection.fragments);
      },

      // Built Phrases Actions
      saveBuiltPhrase: (phrase?: Partial<BuiltPhrase>) => {
        const state = get();
        const fragments = phrase?.fragments || state.currentSelection.fragments;
        const fullText = phrase?.fullText || generatePreviewText(fragments);

        if (fragments.length === 0) return;

        const newPhrase: BuiltPhrase = {
          id: phrase?.id || `bp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          fragments,
          fullText,
          usageCount: phrase?.usageCount || 0,
          isFavorite: phrase?.isFavorite || false,
          createdAt: phrase?.createdAt || new Date(),
          lastUsedAt: phrase?.lastUsedAt,
          context: phrase?.context,
        };

        set((state) => ({
          builtPhrases: [newPhrase, ...state.builtPhrases],
        }));

        // Clear current selection after saving
        get().clearSelection();
      },

      deleteBuiltPhrase: (id: string) => {
        set((state) => ({
          builtPhrases: state.builtPhrases.filter(p => p.id !== id),
        }));
      },

      toggleFavoritePhrase: (id: string) => {
        set((state) => ({
          builtPhrases: state.builtPhrases.map(p =>
            p.id === id ? { ...p, isFavorite: !p.isFavorite } : p
          ),
        }));
      },

      useBuiltPhrase: (id: string) => {
        const phrase = get().builtPhrases.find(p => p.id === id);
        if (!phrase) return '';

        set((state) => ({
          builtPhrases: state.builtPhrases.map(p =>
            p.id === id
              ? { ...p, usageCount: p.usageCount + 1, lastUsedAt: new Date() }
              : p
          ),
        }));

        return phrase.fullText;
      },

      // Custom Fragments Actions
      addCustomFragment: (fragment: Omit<PhraseFragment, 'id' | 'isCustom'>) => {
        const newFragment: PhraseFragment = {
          ...fragment,
          id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          isCustom: true,
          createdAt: new Date(),
        };

        set((state) => ({
          customFragments: [newFragment, ...state.customFragments],
        }));
      },

      deleteCustomFragment: (id: string) => {
        set((state) => ({
          customFragments: state.customFragments.filter(f => f.id !== id),
        }));
      },

      // Personalization Actions
      incrementUsage: (fragmentId: string) => {
        set((state) => {
          const newUsageCounts = { ...state.usageCounts };
          newUsageCounts[fragmentId] = (newUsageCounts[fragmentId] || 0) + 1;
          return { usageCounts: newUsageCounts };
        });
      },

      toggleFavoriteFragment: (fragmentId: string) => {
        set((state) => {
          const isFavorite = state.favoriteFragmentIds.includes(fragmentId);
          const newFavorites = isFavorite
            ? state.favoriteFragmentIds.filter(id => id !== fragmentId)
            : [...state.favoriteFragmentIds, fragmentId];
          return { favoriteFragmentIds: newFavorites };
        });
      },

      clearRecents: () => {
        set({ recentFragmentIds: [] });
      },

      // Getters
      getAllFragments: () => {
        const state = get();
        return [...allFragments, ...state.customFragments];
      },

      getFragmentsByType: (type: FragmentType) => {
        const allFrags = get().getAllFragments();
        const state = get();

        // Filter by type
        let fragments = allFrags.filter(f => f.type === type);

        // Sort by usage count (personalization)
        fragments.sort((a, b) => {
          const aCount = state.usageCounts[a.id] || 0;
          const bCount = state.usageCounts[b.id] || 0;
          if (aCount !== bCount) return bCount - aCount;

          // Then by commonality
          const commonalityOrder = { very_common: 0, common: 1, uncommon: 2, specialized: 3 };
          return commonalityOrder[a.commonality] - commonalityOrder[b.commonality];
        });

        return fragments;
      },

      getFragmentsBySemanticCategory: (category: SemanticCategory) => {
        const allFrags = get().getAllFragments();
        const state = get();
        const types = SEMANTIC_CATEGORY_MAP[category];

        // Filter by types in this semantic category
        let fragments = allFrags.filter(f => types.includes(f.type));

        // Sort: very_common first, then by usage count
        fragments.sort((a, b) => {
          // Commonality first (core vocabulary emphasis)
          const commonalityOrder = { very_common: 0, common: 1, uncommon: 2, specialized: 3 };
          const commonalityDiff = commonalityOrder[a.commonality] - commonalityOrder[b.commonality];
          if (commonalityDiff !== 0) return commonalityDiff;

          // Then by usage count (personalization)
          const aCount = state.usageCounts[a.id] || 0;
          const bCount = state.usageCounts[b.id] || 0;
          return bCount - aCount;
        });

        return fragments;
      },

      getSuggestedFragments: (currentType: FragmentType | null) => {
        if (!currentType) return [];

        const fragments = get().getFragmentsByType(currentType);
        const state = get();

        // Convert to suggestions with confidence scores
        const suggestions: FragmentSuggestion[] = fragments.map(fragment => {
          let confidence = 0.5;
          let reason: FragmentSuggestion['reason'] = 'frequency';

          // Boost confidence for frequently used
          const usageCount = state.usageCounts[fragment.id] || 0;
          if (usageCount > 10) {
            confidence = 0.9;
            reason = 'frequency';
          } else if (usageCount > 5) {
            confidence = 0.7;
            reason = 'frequency';
          }

          // Boost confidence for favorites
          if (state.favoriteFragmentIds.includes(fragment.id)) {
            confidence = Math.min(confidence + 0.2, 1.0);
          }

          // Boost confidence for common fragments
          if (fragment.commonality === 'very_common') {
            confidence = Math.max(confidence, 0.6);
          }

          return { fragment, confidence, reason };
        });

        // Sort by confidence
        suggestions.sort((a, b) => b.confidence - a.confidence);

        return suggestions;
      },

      getPreviewText: () => {
        const state = get();
        return state.currentSelection.previewText;
      },
    }),
    {
      name: 'phrase-fragment-storage',
      partialize: (state) => ({
        builtPhrases: state.builtPhrases,
        customFragments: state.customFragments,
        recentFragmentIds: state.recentFragmentIds,
        favoriteFragmentIds: state.favoriteFragmentIds,
        usageCounts: state.usageCounts,
      }),
    }
  )
);
