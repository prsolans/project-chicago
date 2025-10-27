import type { AIPrediction, PredictionContext } from '../types/conversation';

const CACHE_SIZE = parseInt(import.meta.env.VITE_PREDICTION_CACHE_SIZE || '1000');
const CACHE_TTL_MS = parseInt(import.meta.env.VITE_CACHE_TTL_MINUTES || '30') * 60 * 1000;

interface CacheEntry {
  contextSignature: string;
  predictions: AIPrediction[];
  confidence: number;
  timestamp: number;
  useCount: number;
  lastAccessed: number;
}

interface CacheStats {
  totalEntries: number;
  hits: number;
  misses: number;
  hitRate: number;
  averageConfidence: number;
}

class PredictionCache {
  private cache: Map<string, CacheEntry> = new Map();
  private stats = {
    hits: 0,
    misses: 0,
  };

  /**
   * Generate a signature for the current context to use as cache key
   */
  private generateContextSignature(context: PredictionContext): string {
    const {
      currentInput,
      timeContext,
      activeParticipants,
      userFatigueLevel,
      recentSelections,
    } = context;

    // Normalize input (lowercase, trim)
    const normalizedInput = currentInput.toLowerCase().trim();

    // Get participant roles (not IDs, for generalization)
    const participantRoles = activeParticipants
      .map(p => p.role)
      .sort()
      .join(',');

    // Include only last 3 recent selections for pattern matching
    const recentPattern = recentSelections.slice(-3).join('|');

    // Create signature
    return `${normalizedInput}::${timeContext}::${participantRoles}::${userFatigueLevel}::${recentPattern}`;
  }

  /**
   * Get predictions from cache if available and not expired
   */
  get(context: PredictionContext): AIPrediction[] | null {
    const signature = this.generateContextSignature(context);
    const entry = this.cache.get(signature);

    if (!entry) {
      this.stats.misses++;
      return null;
    }

    // Check if entry is expired
    const age = Date.now() - entry.timestamp;
    if (age > CACHE_TTL_MS) {
      this.cache.delete(signature);
      this.stats.misses++;
      return null;
    }

    // Check confidence threshold (lower confidence = don't use cache)
    if (entry.confidence < 0.7) {
      this.stats.misses++;
      return null;
    }

    // Update access stats
    entry.useCount++;
    entry.lastAccessed = Date.now();
    this.stats.hits++;

    return entry.predictions;
  }

  /**
   * Store predictions in cache
   */
  set(context: PredictionContext, predictions: AIPrediction[]): void {
    // Don't cache if no predictions or low confidence
    if (predictions.length === 0) return;

    const avgConfidence = predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length;
    if (avgConfidence < 0.5) return;

    const signature = this.generateContextSignature(context);

    const entry: CacheEntry = {
      contextSignature: signature,
      predictions,
      confidence: avgConfidence,
      timestamp: Date.now(),
      useCount: 0,
      lastAccessed: Date.now(),
    };

    this.cache.set(signature, entry);

    // Enforce cache size limit using LRU eviction
    if (this.cache.size > CACHE_SIZE) {
      this.evictOldest();
    }
  }

  /**
   * Evict oldest entries when cache is full (LRU strategy)
   */
  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      // Consider both age and usage for eviction
      const score = entry.lastAccessed - (entry.useCount * 1000);
      if (score < oldestTime) {
        oldestTime = score;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Pre-cache common predictions for known contexts
   */
  async prewarm(commonContexts: PredictionContext[], generateFn: (ctx: PredictionContext) => Promise<AIPrediction[]>): Promise<void> {
    for (const context of commonContexts) {
      const predictions = await generateFn(context);
      this.set(context, predictions);
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const totalRequests = this.stats.hits + this.stats.misses;
    const hitRate = totalRequests > 0 ? this.stats.hits / totalRequests : 0;

    let totalConfidence = 0;
    let entryCount = 0;

    for (const entry of this.cache.values()) {
      totalConfidence += entry.confidence;
      entryCount++;
    }

    return {
      totalEntries: this.cache.size,
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate,
      averageConfidence: entryCount > 0 ? totalConfidence / entryCount : 0,
    };
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.stats.hits = 0;
    this.stats.misses = 0;
  }

  /**
   * Remove expired entries
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > CACHE_TTL_MS) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get most frequently used predictions (for learning)
   */
  getTopPredictions(limit: number = 10): Array<{ prediction: string; count: number }> {
    const predictionCounts = new Map<string, number>();

    for (const entry of this.cache.values()) {
      for (const pred of entry.predictions) {
        const current = predictionCounts.get(pred.content) || 0;
        predictionCounts.set(pred.content, current + entry.useCount);
      }
    }

    return Array.from(predictionCounts.entries())
      .map(([prediction, count]) => ({ prediction, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  /**
   * Export cache for persistence/analysis
   */
  export(): string {
    const data = {
      stats: this.getStats(),
      entries: Array.from(this.cache.entries()).map(([key, entry]) => ({
        key,
        ...entry,
      })),
    };
    return JSON.stringify(data, null, 2);
  }

  /**
   * Import cache from exported data
   */
  import(data: string): void {
    try {
      const parsed = JSON.parse(data);
      this.cache.clear();

      for (const entry of parsed.entries || []) {
        const { key, ...cacheEntry } = entry;
        this.cache.set(key, cacheEntry);
      }
    } catch (error) {
      console.error('Error importing cache:', error);
    }
  }
}

// Singleton instance
export const predictionCache = new PredictionCache();

// Cleanup expired entries every 5 minutes
setInterval(() => {
  predictionCache.cleanup();
}, 5 * 60 * 1000);

// Common context patterns for pre-warming
export const COMMON_CONTEXTS = {
  morning: {
    greetings: ['good morning', 'hi', 'hello'],
    needs: ['i need', 'can you', 'help me'],
    bathroom: ['bathroom', 'i need to use'],
  },
  evening: {
    greetings: ['good evening', 'hi', 'hey'],
    needs: ['i need', 'can you help'],
    comfort: ['tired', 'pain', 'uncomfortable'],
  },
  medical: {
    pain: ['pain', 'hurts', 'uncomfortable'],
    medication: ['medication', 'meds', 'pills'],
    help: ['help', 'need help', 'urgent'],
  },
};

/**
 * Generate common context variations for pre-warming cache
 */
export function generateCommonContexts(activeParticipants: any[]): PredictionContext[] {
  const contexts: PredictionContext[] = [];

  // Morning greetings with different participant combinations
  for (const greeting of COMMON_CONTEXTS.morning.greetings) {
    contexts.push({
      conversationHistory: [],
      currentInput: greeting,
      activeParticipants,
      timeContext: 'morning',
      userFatigueLevel: 'fresh',
      recentSelections: [],
    });
  }

  // Common needs across all times
  for (const need of COMMON_CONTEXTS.morning.needs) {
    contexts.push({
      conversationHistory: [],
      currentInput: need,
      activeParticipants,
      timeContext: 'afternoon',
      userFatigueLevel: 'moderate',
      recentSelections: [],
    });
  }

  return contexts;
}
