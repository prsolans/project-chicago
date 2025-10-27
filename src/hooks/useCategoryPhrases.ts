import { useState, useEffect, useCallback } from 'react';
import { generateCategoryPredictions } from '../services/claudeApi';
import { useConversation } from './useConversation';
import type { AIPrediction, PredictionContext } from '../types/conversation';
import type { PhraseCategory } from '../data/staticPhrases';
import { usePhraseLibrary } from '../store/phraseLibraryStore';
import type { Phrase } from '../types/database';
import {
  getAllCachedPhrases,
  setAllCachedPhrases,
  getCacheStats
} from '../services/phrasesCache';

interface UseCategoryPhrasesOptions {
  categories?: PhraseCategory[];
  enabled?: boolean;
}

interface UseCategoryPhrasesResult {
  categoryPredictions: Record<string, AIPrediction[]>;
  isLoading: boolean;
  error: string | null;
  refreshPredictions: () => void;
  activeCategory: string | null;
  setActiveCategory: (category: string | null) => void;
  cacheStats: ReturnType<typeof getCacheStats>;
  trackPhraseSelection: (phraseId: string) => Promise<void>;
}

const DEFAULT_CATEGORIES: PhraseCategory[] = [
  'family',       // "I love you Tony", "Good morning Michael"
  'medical',      // "I need medication", "I'm in pain"
  'comfort',      // "I'm cold", "Adjust my position"
  'social',       // "Thank you", "I love you"
  'responses',    // "Yes", "No", "Maybe"
  'questions',    // "What time is it?", "Who's here?"
  'food',         // "I'm hungry", "Can I have water?"
  'feelings',     // "I'm happy", "I'm tired"
  'entertainment', // "Can you turn on the TV?", "Play some music"
];

/**
 * Convert database Phrase to AIPrediction format
 */
function phraseToAIPrediction(phrase: Phrase): AIPrediction {
  // Map PhraseSource to AIPrediction source
  const sourceMap: Record<string, 'ai' | 'cache' | 'pattern' | 'static'> = {
    static: 'static',
    ai_generated: 'ai',
    user_typed: 'pattern',
    user_custom: 'pattern',
  };

  return {
    id: phrase.id,
    content: phrase.text,
    confidence: phrase.confidence,
    category: phrase.category,
    source: sourceMap[phrase.source] || 'static',
  };
}

export function useCategoryPhrases({
  categories = DEFAULT_CATEGORIES,
  enabled = true,
}: UseCategoryPhrasesOptions = {}): UseCategoryPhrasesResult {
  const [categoryPredictions, setCategoryPredictions] = useState<Record<string, AIPrediction[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [cacheStats, setCacheStats] = useState(getCacheStats());

  const { messages, currentContext, getCurrentTimeOfDay } = useConversation();
  const { getPhrasesByCategory, trackUsage } = usePhraseLibrary();

  /**
   * Build prediction context for category phrases
   */
  const buildContext = useCallback((): PredictionContext => {
    const recentMessages = messages.slice(-5);

    return {
      conversationHistory: recentMessages,
      currentInput: '', // No current input for category phrases
      activeParticipants: [], // Simplified for single user
      timeContext: getCurrentTimeOfDay(),
      userFatigueLevel: currentContext.userFatigueLevel || 'moderate',
      recentSelections: messages.slice(-10).map(msg => msg.content),
    };
  }, [messages, currentContext, getCurrentTimeOfDay]);

  /**
   * Load phrases with cloud-first strategy:
   * 1. Load from database (instant with offline cache)
   * 2. Check AI cache and merge (instant)
   * 3. Background AI call to supplement (async, NEVER shows loading)
   */
  const loadPhrases = useCallback(async () => {
    if (!enabled) return;

    const recentMessageTexts = messages.slice(-5).map(msg => msg.content);

    // Step 1: Load phrases from database (cloud-synced with offline cache)
    const dbPhrases: Record<string, AIPrediction[]> = {};
    for (const category of categories) {
      const phrases = await getPhrasesByCategory(category, true); // true = smart sort
      dbPhrases[category] = phrases.map(phraseToAIPrediction);
    }

    // Step 2: Check AI cache and merge with database phrases
    const cachedAIPhrases = getAllCachedPhrases(categories, recentMessageTexts);

    // Merge database phrases with cached AI phrases for each category
    const mergedPhrases: Record<string, AIPrediction[]> = {};
    for (const category of categories) {
      const dbList = dbPhrases[category] || [];
      const aiList = cachedAIPhrases[category] || [];

      // Combine: show AI phrases first (contextual), then database phrases
      // Limit to first 20 total to keep UI manageable
      mergedPhrases[category] = [...aiList, ...dbList].slice(0, 20);
    }

    // ALWAYS set phrases immediately - never show loading state
    setCategoryPredictions(mergedPhrases);
    setCacheStats(getCacheStats());
    console.log(`📚 Loaded ${categories.length} categories from database merged with AI cache`);

    // Step 3: Silent background AI call to refresh cache (only for missing categories)
    // This happens silently without showing loading state
    const categoriesToRefresh = categories.filter(cat => !cachedAIPhrases[cat] || cachedAIPhrases[cat].length === 0);

    if (categoriesToRefresh.length > 0) {
      // Don't set loading state - refresh happens silently
      setError(null);

      try {
        const context = buildContext();
        const aiPhrases = await generateCategoryPredictions(context, categoriesToRefresh);

        // Save to cache
        setAllCachedPhrases(aiPhrases, recentMessageTexts);

        // Merge new AI phrases with existing merged phrases
        setCategoryPredictions(prev => {
          const updated = { ...prev };
          for (const category of categoriesToRefresh) {
            const dbList = dbPhrases[category] || [];
            const aiList = aiPhrases[category] || [];
            // Merge AI (contextual) + database, limit to 20
            updated[category] = [...aiList, ...dbList].slice(0, 20);
          }
          return updated;
        });
        setCacheStats(getCacheStats());

        console.log(`✅ AI-supplemented ${categoriesToRefresh.length} categories silently in background`);
      } catch (err) {
        console.error('Error fetching AI predictions:', err);
        setError('Failed to refresh some AI phrases (using database)');
        // Keep database phrases even on error
      }
    }
  }, [enabled, buildContext, categories, messages, getPhrasesByCategory]);

  /**
   * Refresh all predictions manually (forces AI refresh and updates cache)
   */
  const refreshPredictions = useCallback(async () => {
    if (!enabled) return;

    setIsLoading(true);
    setError(null);

    try {
      const context = buildContext();
      const recentMessageTexts = messages.slice(-5).map(msg => msg.content);
      const aiPhrases = await generateCategoryPredictions(context, categories);

      // Update cache
      setAllCachedPhrases(aiPhrases, recentMessageTexts);

      // Load database phrases
      const dbPhrases: Record<string, AIPrediction[]> = {};
      for (const category of categories) {
        const phrases = await getPhrasesByCategory(category, true); // true = smart sort
        dbPhrases[category] = phrases.map(phraseToAIPrediction);
      }

      const mergedPhrases: Record<string, AIPrediction[]> = {};
      for (const category of categories) {
        const dbList = dbPhrases[category] || [];
        const aiList = aiPhrases[category] || [];
        // Show AI phrases first (more contextual), then database, limit to 20
        mergedPhrases[category] = [...aiList, ...dbList].slice(0, 20);
      }

      setCategoryPredictions(mergedPhrases);
      setCacheStats(getCacheStats());
      console.log(`✅ Manual refresh: ${categories.length} categories updated with AI + database phrases`);
    } catch (err) {
      console.error('Error refreshing category predictions:', err);
      setError('Failed to refresh phrases');
    } finally {
      setIsLoading(false);
    }
  }, [enabled, buildContext, categories, messages, getPhrasesByCategory]);

  /**
   * Initial load on mount only (not on every message change)
   */
  useEffect(() => {
    if (!enabled) return;
    loadPhrases();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]); // Only reload when enabled changes, not on every message

  /**
   * Track phrase selection and usage
   */
  const trackPhraseSelection = useCallback(async (phraseId: string) => {
    try {
      await trackUsage(phraseId, 'category'); // 'category' input method for CategoryPhrasesPanel
      console.log(`✅ Tracked usage for phrase: ${phraseId}`);
    } catch (err) {
      console.error('Failed to track phrase usage:', err);
    }
  }, [trackUsage]);

  // Note: Automatic time-of-day refresh disabled - phrases only refresh when user clicks "Refresh" button

  return {
    categoryPredictions,
    isLoading,
    error,
    refreshPredictions,
    activeCategory,
    setActiveCategory,
    cacheStats,
    trackPhraseSelection,
  };
}
