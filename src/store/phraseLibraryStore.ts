/**
 * Phrase Library Store
 * Manages cloud-synced phrase library with offline caching
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Phrase, PhraseCategory, InputMethod } from '../types/database';
import {
  getAllPhrases,
  getSmartPhrasesForCategory,
  addPhrase,
  updatePhrase,
  deletePhrase,
  trackPhraseUsage,
} from '../services/phraseService';

interface PhraseLibraryState {
  // Phrase library (cached)
  phrases: Phrase[];

  // Loading states
  isLoading: boolean;
  lastSyncTime: number | null;
  syncError: string | null;

  // Phrase candidates (for suggestions)
  pendingCandidatesCount: number;

  // Actions
  loadPhrases: () => Promise<void>;
  refreshPhrases: () => Promise<void>;
  getPhrasesByCategory: (category: PhraseCategory, smartSort?: boolean) => Promise<Phrase[]>;

  // Phrase management
  addNewPhrase: (text: string, category: PhraseCategory) => Promise<Phrase | null>;
  updateExistingPhrase: (id: string, text: string) => Promise<boolean>;
  removePhrase: (id: string) => Promise<boolean>;

  // Usage tracking
  trackUsage: (phraseId: string, method: InputMethod) => Promise<void>;

  // Helpers
  getPhraseById: (id: string) => Phrase | null;
  searchPhrases: (query: string) => Phrase[];
  getCategoryCounts: () => Record<PhraseCategory, number>;
}

export const usePhraseLibrary = create<PhraseLibraryState>()(
  persist(
    (set, get) => ({
      phrases: [],
      isLoading: false,
      lastSyncTime: null,
      syncError: null,
      pendingCandidatesCount: 0,

      /**
       * Load all phrases from Supabase (initial load or refresh)
       */
      loadPhrases: async () => {
        // Don't reload if already loaded recently (within 5 minutes)
        const lastSync = get().lastSyncTime;
        if (lastSync && Date.now() - lastSync < 5 * 60 * 1000) {
          console.log('Using cached phrases');
          return;
        }

        set({ isLoading: true, syncError: null });

        try {
          const phrases = await getAllPhrases();
          set({
            phrases,
            lastSyncTime: Date.now(),
            isLoading: false,
            syncError: null,
          });
        } catch (error) {
          console.error('Error loading phrases:', error);
          set({
            isLoading: false,
            syncError: error instanceof Error ? error.message : 'Failed to load phrases',
          });
          // Keep using cached phrases on error
        }
      },

      /**
       * Force refresh phrases from cloud
       */
      refreshPhrases: async () => {
        set({ isLoading: true, syncError: null, lastSyncTime: null });
        await get().loadPhrases();
      },

      /**
       * Get phrases for a specific category
       * @param smartSort - If true, uses usage-based smart sorting
       */
      getPhrasesByCategory: async (category: PhraseCategory, smartSort: boolean = true) => {
        if (smartSort) {
          try {
            // Use smart sorting with time-awareness and usage stats
            return await getSmartPhrasesForCategory(category);
          } catch (error) {
            console.error('Error getting smart phrases, falling back to cache:', error);
            // Fall through to cached phrases
          }
        }

        // Use cached phrases
        return get().phrases.filter(p => p.category === category && p.is_active);
      },

      /**
       * Add a new phrase to the library
       */
      addNewPhrase: async (text: string, category: PhraseCategory) => {
        try {
          const newPhrase = await addPhrase({
            text,
            category,
            time_of_day: 'anytime',
            source: 'user_custom',
            confidence: 1.0,
            is_active: true,
          });

          // Add to local cache
          set(state => ({
            phrases: [...state.phrases, newPhrase],
          }));

          return newPhrase;
        } catch (error) {
          console.error('Error adding phrase:', error);
          return null;
        }
      },

      /**
       * Update existing phrase
       */
      updateExistingPhrase: async (id: string, text: string) => {
        try {
          const updated = await updatePhrase(id, { text });

          // Update local cache
          set(state => ({
            phrases: state.phrases.map(p => p.id === id ? updated : p),
          }));

          return true;
        } catch (error) {
          console.error('Error updating phrase:', error);
          return false;
        }
      },

      /**
       * Remove phrase (soft delete)
       */
      removePhrase: async (id: string) => {
        try {
          await deletePhrase(id);

          // Remove from local cache
          set(state => ({
            phrases: state.phrases.filter(p => p.id !== id),
          }));

          return true;
        } catch (error) {
          console.error('Error deleting phrase:', error);
          return false;
        }
      },

      /**
       * Track phrase usage
       */
      trackUsage: async (phraseId: string, method: InputMethod) => {
        try {
          await trackPhraseUsage(phraseId, method);
        } catch (error) {
          console.error('Error tracking phrase usage:', error);
          // Don't throw - usage tracking should not block the UI
        }
      },

      /**
       * Get a specific phrase by ID
       */
      getPhraseById: (id: string) => {
        return get().phrases.find(p => p.id === id) || null;
      },

      /**
       * Search phrases by text
       */
      searchPhrases: (query: string) => {
        const lowerQuery = query.toLowerCase();
        return get().phrases.filter(p =>
          p.is_active && p.text.toLowerCase().includes(lowerQuery)
        );
      },

      /**
       * Get count of phrases per category
       */
      getCategoryCounts: () => {
        const phrases = get().phrases.filter(p => p.is_active);
        const counts: Record<PhraseCategory, number> = {
          family: 0,
          medical: 0,
          comfort: 0,
          social: 0,
          responses: 0,
          questions: 0,
          food: 0,
          feelings: 0,
          entertainment: 0,
        };

        phrases.forEach(p => {
          counts[p.category]++;
        });

        return counts;
      },
    }),
    {
      name: 'phrase-library-storage',
      partialize: (state) => ({
        phrases: state.phrases,
        lastSyncTime: state.lastSyncTime,
        // Don't persist loading states
      }),
    }
  )
);

/**
 * Initialize phrase library on app start
 * Call this once in App.tsx
 */
export function initializePhraseLibrary() {
  const { loadPhrases } = usePhraseLibrary.getState();
  loadPhrases().catch(console.error);
}
