import { useState, useEffect, useCallback } from 'react';
import { generateCategoryPredictions } from '../services/claudeApi';
import { useConversation } from './useConversation';
import type { AIPrediction, PredictionContext } from '../types/conversation';
import type { PhraseCategory } from '../data/staticPhrases';
import { getStaticPhrases } from '../data/staticPhrases';
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
}

const DEFAULT_CATEGORIES: PhraseCategory[] = [
  'family',       // "I love you Tony", "Good morning Michael"
  'medical',      // "I need medication", "I'm in pain"
  'comfort',      // "I'm cold", "Adjust my position"
  'social',       // "Thank you", "I love you"
  'responses',    // "Yes", "No", "Maybe"
  'questions',    // "What time is it?", "Who's here?"
];

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
   * Load phrases with cache-first strategy:
   * 1. Check cache first (instant)
   * 2. Return static phrases as fallback (instant)
   * 3. Background AI call to refresh cache (async, NEVER shows loading)
   */
  const loadPhrases = useCallback(async () => {
    if (!enabled) return;

    const recentMessageTexts = messages.slice(-5).map(msg => msg.content);

    // Step 1: Always load static phrases as base
    const staticPhrases: Record<string, AIPrediction[]> = {};
    for (const category of categories) {
      staticPhrases[category] = getStaticPhrases(category);
    }

    // Step 2: Check cache and merge with static
    const cachedPhrases = getAllCachedPhrases(categories, recentMessageTexts);

    // Merge static with cached AI phrases for each category
    const mergedPhrases: Record<string, AIPrediction[]> = {};
    for (const category of categories) {
      const staticList = staticPhrases[category] || [];
      const cachedList = cachedPhrases[category] || [];

      // Combine: show AI phrases first (contextual), then static phrases
      // Limit to first 20 total to keep UI manageable
      mergedPhrases[category] = [...cachedList, ...staticList].slice(0, 20);
    }

    // ALWAYS set phrases immediately - never show loading state
    setCategoryPredictions(mergedPhrases);
    setCacheStats(getCacheStats());
    console.log(`📚 Loaded ${Object.keys(cachedPhrases).length} cached categories merged with static phrases`);

    // Step 3: Silent background AI call to refresh cache (only for missing categories)
    // This happens silently without showing loading state
    const categoriesToRefresh = categories.filter(cat => !cachedPhrases[cat]);

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
            const staticList = staticPhrases[category] || [];
            const aiList = aiPhrases[category] || [];
            // Merge AI (contextual) + static, limit to 20
            updated[category] = [...aiList, ...staticList].slice(0, 20);
          }
          return updated;
        });
        setCacheStats(getCacheStats());

        console.log(`✅ AI-refreshed ${categoriesToRefresh.length} categories silently in background`);
      } catch (err) {
        console.error('Error fetching AI predictions:', err);
        setError('Failed to refresh some phrases (using cached/static)');
        // Keep static/cached phrases even on error
      }
    }
  }, [enabled, buildContext, categories]);

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

      // Merge AI phrases with static phrases
      const staticPhrases: Record<string, AIPrediction[]> = {};
      for (const category of categories) {
        staticPhrases[category] = getStaticPhrases(category);
      }

      const mergedPhrases: Record<string, AIPrediction[]> = {};
      for (const category of categories) {
        const staticList = staticPhrases[category] || [];
        const aiList = aiPhrases[category] || [];
        // Show AI phrases first (more contextual), then static, limit to 20
        mergedPhrases[category] = [...aiList, ...staticList].slice(0, 20);
      }

      setCategoryPredictions(mergedPhrases);
      setCacheStats(getCacheStats());
      console.log(`✅ Manual refresh: ${categories.length} categories updated with AI + static phrases`);
    } catch (err) {
      console.error('Error refreshing category predictions:', err);
      setError('Failed to refresh phrases');
    } finally {
      setIsLoading(false);
    }
  }, [enabled, buildContext, categories, messages]);

  /**
   * Initial load on mount only (not on every message change)
   */
  useEffect(() => {
    if (!enabled) return;
    loadPhrases();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]); // Only reload when enabled changes, not on every message

  // Note: Automatic time-of-day refresh disabled - phrases only refresh when user clicks "Refresh" button

  return {
    categoryPredictions,
    isLoading,
    error,
    refreshPredictions,
    activeCategory,
    setActiveCategory,
    cacheStats,
  };
}
