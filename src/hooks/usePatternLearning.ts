import { useState, useEffect, useCallback } from 'react';
import { useConversation } from './useConversation';
import type { AIPrediction } from '../types/conversation';

interface WordSequence {
  sequence: string[]; // e.g., ["I", "need", "water"]
  frequency: number;
  lastUsed: number;
}

interface UsePatternLearningResult {
  getPatternPredictions: (currentInput: string) => AIPrediction[];
  learnedSequences: WordSequence[];
  clearLearning: () => void;
}

const MAX_SEQUENCES = 50; // Keep top 50 most frequent sequences
const MIN_FREQUENCY = 2; // Need at least 2 uses to suggest
const SEQUENCE_LENGTH = 3; // Track trigrams (3-word sequences)

/**
 * Hook to learn and predict based on user's word usage patterns
 */
export function usePatternLearning(): UsePatternLearningResult {
  const { messages } = useConversation();
  const [learnedSequences, setLearnedSequences] = useState<WordSequence[]>([]);

  /**
   * Extract word sequences from messages
   */
  const extractSequences = useCallback((text: string): string[][] => {
    // Clean and split into words
    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, '') // Remove punctuation
      .split(/\s+/)
      .filter(word => word.length > 0);

    const sequences: string[][] = [];

    // Extract all n-grams from 2 to SEQUENCE_LENGTH
    for (let n = 2; n <= SEQUENCE_LENGTH; n++) {
      for (let i = 0; i <= words.length - n; i++) {
        sequences.push(words.slice(i, i + n));
      }
    }

    return sequences;
  }, []);

  /**
   * Learn from all messages
   */
  const learnFromMessages = useCallback(() => {
    const sequenceMap = new Map<string, WordSequence>();

    // Extract sequences from all messages
    messages.forEach((message) => {
      const sequences = extractSequences(message.content);

      sequences.forEach((seq) => {
        const key = seq.join(' ');
        const existing = sequenceMap.get(key);

        if (existing) {
          existing.frequency++;
          existing.lastUsed = message.timestamp;
        } else {
          sequenceMap.set(key, {
            sequence: seq,
            frequency: 1,
            lastUsed: message.timestamp,
          });
        }
      });
    });

    // Convert to array and sort by frequency (and recency as tiebreaker)
    const sortedSequences = Array.from(sequenceMap.values())
      .filter(seq => seq.frequency >= MIN_FREQUENCY)
      .sort((a, b) => {
        // Sort by frequency first
        if (b.frequency !== a.frequency) {
          return b.frequency - a.frequency;
        }
        // If same frequency, prefer more recent
        return b.lastUsed - a.lastUsed;
      })
      .slice(0, MAX_SEQUENCES);

    setLearnedSequences(sortedSequences);

    if (sortedSequences.length > 0) {
      console.log(`📚 Learned ${sortedSequences.length} frequent word patterns`);
      console.log(`   Top 3: ${sortedSequences.slice(0, 3).map(s => `"${s.sequence.join(' ')}" (${s.frequency}x)`).join(', ')}`);
    }
  }, [messages, extractSequences]);

  /**
   * Re-learn when messages change
   */
  useEffect(() => {
    if (messages.length > 0) {
      learnFromMessages();
    }
  }, [messages, learnFromMessages]);

  /**
   * Get pattern-based predictions for current input
   */
  const getPatternPredictions = useCallback((currentInput: string): AIPrediction[] => {
    if (!currentInput || currentInput.trim().length === 0) {
      return [];
    }

    const inputWords = currentInput
      .toLowerCase()
      .trim()
      .split(/\s+/)
      .filter(word => word.length > 0);

    if (inputWords.length === 0) {
      return [];
    }

    const predictions: AIPrediction[] = [];

    // Find sequences that start with the current input
    learnedSequences.forEach((seq) => {
      const sequenceWords = seq.sequence;

      // Check if this sequence starts with current input
      const matchLength = Math.min(inputWords.length, sequenceWords.length - 1);
      let matches = true;

      for (let i = 0; i < matchLength; i++) {
        if (!sequenceWords[i].startsWith(inputWords[i])) {
          matches = false;
          break;
        }
      }

      if (matches) {
        // Predict the next word in the sequence
        const nextWordIndex = inputWords.length;
        if (nextWordIndex < sequenceWords.length) {
          const nextWord = sequenceWords[nextWordIndex];

          // Calculate confidence based on frequency and recency
          const maxFrequency = Math.max(...learnedSequences.map(s => s.frequency));
          const frequencyScore = seq.frequency / maxFrequency;

          const hoursSinceUse = (Date.now() - seq.lastUsed) / (1000 * 60 * 60);
          const recencyScore = Math.max(0, 1 - (hoursSinceUse / 168)); // Decay over a week

          const confidence = (frequencyScore * 0.7) + (recencyScore * 0.3);

          // Only add if not already in predictions
          if (!predictions.find(p => p.content === nextWord)) {
            predictions.push({
              id: `pattern-${seq.sequence.join('-')}-${nextWordIndex}`,
              content: nextWord,
              confidence: Math.max(0.3, confidence), // Minimum 30% confidence
              category: 'pattern',
              source: 'pattern' as const,
            });
          }
        }
      }
    });

    // Sort by confidence
    predictions.sort((a, b) => b.confidence - a.confidence);

    // Return top 3 pattern predictions
    const topPredictions = predictions.slice(0, 3);

    if (topPredictions.length > 0) {
      console.log(`🔮 Pattern predictions for "${currentInput}":`, topPredictions.map(p => p.content).join(', '));
    }

    return topPredictions;
  }, [learnedSequences]);

  /**
   * Clear all learned patterns
   */
  const clearLearning = useCallback(() => {
    setLearnedSequences([]);
    console.log('🗑️ Cleared learned patterns');
  }, []);

  return {
    getPatternPredictions,
    learnedSequences,
    clearLearning,
  };
}
