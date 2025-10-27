import { useState, useEffect, useCallback, useRef } from 'react';
import { generateThoughtCompletions } from '../services/claudeApi';
import { predictionCache } from '../services/predictionCache';
import { useConversation } from './useConversation';
import { usePatternLearning } from './usePatternLearning';
import type { AIPrediction, PredictionContext } from '../types/conversation';

interface UseThoughtCompletionOptions {
  minCharacters?: number; // Minimum characters before triggering predictions
  maxPredictions?: number; // Maximum number of predictions to show
  debounceMs?: number; // Debounce time before calling API
  enabled?: boolean; // Enable/disable predictions
}

interface UseThoughtCompletionResult {
  predictions: AIPrediction[];
  isLoading: boolean;
  error: string | null;
  triggerPredictions: (input: string) => void;
  clearPredictions: () => void;
}

export function useThoughtCompletion({
  minCharacters = 2,
  maxPredictions = 6,
  debounceMs = 400,
  enabled = true,
}: UseThoughtCompletionOptions = {}): UseThoughtCompletionResult {
  const [predictions, setPredictions] = useState<AIPrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { messages, currentContext, getCurrentTimeOfDay } = useConversation();
  const { getPatternPredictions } = usePatternLearning();
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastInputRef = useRef<string>('');

  /**
   * Build prediction context from current state
   */
  const buildPredictionContext = useCallback((input: string): PredictionContext => {
    // Get recent messages for context (last 5)
    const recentMessages = messages.slice(-5);

    // Get recent user selections for pattern learning
    const recentSelections = messages
      .slice(-10)
      .map(msg => msg.content);

    return {
      conversationHistory: recentMessages,
      currentInput: input,
      activeParticipants: [], // Simplified - no multi-party yet
      timeContext: getCurrentTimeOfDay(),
      userFatigueLevel: currentContext.userFatigueLevel || 'moderate',
      recentSelections,
    };
  }, [messages, currentContext, getCurrentTimeOfDay]);

  /**
   * Fetch predictions from cache or API, and merge with pattern predictions
   */
  const fetchPredictions = useCallback(async (input: string) => {
    if (!enabled) return;

    setIsLoading(true);
    setError(null);

    try {
      const context = buildPredictionContext(input);

      // Get pattern-based predictions (instant, local)
      const patternPredictions = getPatternPredictions(input);

      // Try cache first
      const cachedPredictions = predictionCache.get(context);
      if (cachedPredictions) {
        console.log('✅ Cache hit for AI predictions');

        // Merge pattern and AI predictions
        const merged = mergePredictions(patternPredictions, cachedPredictions, maxPredictions);
        setPredictions(merged);
        setIsLoading(false);
        return;
      }

      // If we have pattern predictions, show them immediately while AI loads
      if (patternPredictions.length > 0) {
        setPredictions(patternPredictions.slice(0, maxPredictions));
        console.log(`🔮 Showing ${patternPredictions.length} pattern predictions while AI loads...`);
      }

      console.log('🔄 Cache miss, calling Claude API...');

      // Call API
      const result = await generateThoughtCompletions({
        context,
        maxPredictions,
      });

      if (result.predictions.length > 0) {
        // Cache the results
        predictionCache.set(context, result.predictions);

        // Merge pattern and AI predictions
        const merged = mergePredictions(patternPredictions, result.predictions, maxPredictions);
        setPredictions(merged);
        console.log(`✅ Got ${result.predictions.length} AI + ${patternPredictions.length} pattern predictions in ${result.processingTime}ms`);
      } else {
        // Fall back to pattern predictions only
        setPredictions(patternPredictions.slice(0, maxPredictions));
        console.log('⚠️ No AI predictions, using pattern predictions only');
      }
    } catch (err) {
      console.error('Error fetching predictions:', err);
      setError('Failed to get predictions');

      // Fall back to pattern predictions on error
      const patternPredictions = getPatternPredictions(input);
      if (patternPredictions.length > 0) {
        setPredictions(patternPredictions.slice(0, maxPredictions));
        console.log('⚠️ AI error, falling back to pattern predictions');
      } else {
        setPredictions([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [enabled, buildPredictionContext, getPatternPredictions, maxPredictions]);

  /**
   * Merge pattern and AI predictions, prioritizing diversity
   */
  const mergePredictions = useCallback((
    patternPreds: AIPrediction[],
    aiPreds: AIPrediction[],
    maxCount: number
  ): AIPrediction[] => {
    const merged: AIPrediction[] = [];
    const seen = new Set<string>();

    // Alternate between pattern and AI predictions
    const maxLen = Math.max(patternPreds.length, aiPreds.length);

    for (let i = 0; i < maxLen && merged.length < maxCount; i++) {
      // Add pattern prediction if available and not duplicate
      if (i < patternPreds.length && !seen.has(patternPreds[i].content.toLowerCase())) {
        merged.push(patternPreds[i]);
        seen.add(patternPreds[i].content.toLowerCase());
      }

      if (merged.length >= maxCount) break;

      // Add AI prediction if available and not duplicate
      if (i < aiPreds.length && !seen.has(aiPreds[i].content.toLowerCase())) {
        merged.push(aiPreds[i]);
        seen.add(aiPreds[i].content.toLowerCase());
      }
    }

    return merged.slice(0, maxCount);
  }, []);

  /**
   * Trigger predictions with debouncing
   */
  const triggerPredictions = useCallback((input: string) => {
    if (!enabled) return;

    // Don't trigger if input is too short (but allow empty for first word predictions)
    if (input.length > 0 && input.trim().length < minCharacters) {
      setPredictions([]);
      return;
    }

    // Don't re-fetch if input hasn't changed
    if (input === lastInputRef.current) {
      return;
    }

    lastInputRef.current = input;

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer
    debounceTimerRef.current = setTimeout(() => {
      fetchPredictions(input);
    }, debounceMs);
  }, [enabled, minCharacters, debounceMs, fetchPredictions]);

  /**
   * Clear predictions
   */
  const clearPredictions = useCallback(() => {
    setPredictions([]);
    setError(null);
    lastInputRef.current = '';

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    predictions,
    isLoading,
    error,
    triggerPredictions,
    clearPredictions,
  };
}
