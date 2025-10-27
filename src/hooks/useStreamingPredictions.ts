import { useState, useEffect, useCallback, useRef } from 'react';
import { streamPredictions } from '../services/claudeApi';
import { useConversation } from './useConversation';
import type { AIPrediction, PredictionContext } from '../types/conversation';

interface UseStreamingPredictionsOptions {
  enabled?: boolean;
  minCharacters?: number;
}

interface UseStreamingPredictionsResult {
  streamingPredictions: AIPrediction[];
  isStreaming: boolean;
  error: string | null;
  startStreaming: (input: string) => void;
  stopStreaming: () => void;
}

/**
 * Hook to enable real-time streaming predictions
 * Predictions update progressively as AI generates them
 */
export function useStreamingPredictions({
  enabled = false, // Disabled by default (Phase 5 feature)
  minCharacters = 1,
}: UseStreamingPredictionsOptions = {}): UseStreamingPredictionsResult {
  const [streamingPredictions, setStreamingPredictions] = useState<AIPrediction[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { messages, currentContext, getCurrentTimeOfDay } = useConversation();
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Build prediction context for streaming
   */
  const buildContext = useCallback((input: string): PredictionContext => {
    const recentMessages = messages.slice(-5);
    const recentSelections = messages.slice(-10).map(msg => msg.content);

    return {
      conversationHistory: recentMessages,
      currentInput: input,
      activeParticipants: [],
      timeContext: getCurrentTimeOfDay(),
      userFatigueLevel: currentContext.userFatigueLevel || 'moderate',
      recentSelections,
    };
  }, [messages, currentContext, getCurrentTimeOfDay]);

  /**
   * Start streaming predictions
   */
  const startStreaming = useCallback(async (input: string) => {
    if (!enabled || input.trim().length < minCharacters) {
      return;
    }

    // Stop any existing stream
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setIsStreaming(true);
    setError(null);
    setStreamingPredictions([]);

    try {
      const context = buildContext(input);
      const generator = streamPredictions(context);

      // Consume the async generator
      for await (const predictions of generator) {
        setStreamingPredictions(predictions);
        console.log(`🌊 Streaming update: ${predictions.length} predictions`);
      }

      console.log('✅ Streaming complete');
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Error streaming predictions:', err);
        setError('Streaming failed');
      }
    } finally {
      setIsStreaming(false);
    }
  }, [enabled, minCharacters, buildContext]);

  /**
   * Stop streaming
   */
  const stopStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      stopStreaming();
    };
  }, [stopStreaming]);

  return {
    streamingPredictions,
    isStreaming,
    error,
    startStreaming,
    stopStreaming,
  };
}

/**
 * Hook to manage parallel thought streams
 * Shows multiple prediction streams that update in real-time
 */
interface ThoughtStream {
  id: string;
  label: string;
  predictions: AIPrediction[];
  isActive: boolean;
}

interface UseParallelThoughtStreamsResult {
  streams: ThoughtStream[];
  activeStream: string | null;
  setActiveStream: (streamId: string) => void;
  refreshStreams: () => void;
}

export function useParallelThoughtStreams({
  enabled: _enabled = false,
}: { enabled?: boolean } = {}): UseParallelThoughtStreamsResult {
  const [streams, setStreams] = useState<ThoughtStream[]>([
    {
      id: 'continuation',
      label: 'Continue Sentence',
      predictions: [],
      isActive: true,
    },
    {
      id: 'question',
      label: 'Ask Question',
      predictions: [],
      isActive: false,
    },
    {
      id: 'response',
      label: 'Respond',
      predictions: [],
      isActive: false,
    },
  ]);

  const [activeStream, setActiveStreamState] = useState<string | null>('continuation');

  const setActiveStream = useCallback((streamId: string) => {
    setActiveStreamState(streamId);
    setStreams(prev =>
      prev.map(stream => ({
        ...stream,
        isActive: stream.id === streamId,
      }))
    );
  }, []);

  const refreshStreams = useCallback(() => {
    console.log('🔄 Refreshing parallel thought streams');
    // This would trigger streaming for all streams
    // Implementation depends on how we want to handle multiple concurrent streams
  }, []);

  return {
    streams,
    activeStream,
    setActiveStream,
    refreshStreams,
  };
}
