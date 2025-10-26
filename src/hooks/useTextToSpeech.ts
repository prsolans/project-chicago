import { useState, useCallback, useRef, useEffect } from 'react';
import { textToSpeech, isElevenLabsConfigured } from '../services/elevenLabsApi';
import { useSettingsStore } from '../store/settingsStore';

interface UseTextToSpeechReturn {
  speak: (text: string) => Promise<void>;
  stop: () => void;
  isSpeaking: boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook for Text-to-Speech functionality
 * Primary: ElevenLabs API
 * Fallback: Web Speech API
 */
export const useTextToSpeech = (): UseTextToSpeechReturn => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const voiceId = useSettingsStore((state) => state.voiceId);

  /**
   * Stop any currently playing speech
   */
  const stop = useCallback(() => {
    // Stop ElevenLabs audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }

    // Stop Web Speech API
    if (window.speechSynthesis && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    setIsSpeaking(false);
    setIsLoading(false);
    setError(null);
  }, []);

  /**
   * Speak using Web Speech API (fallback)
   */
  const speakWithWebSpeech = useCallback((text: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!window.speechSynthesis) {
        reject(new Error('Web Speech API not supported'));
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      speechSynthesisRef.current = utterance;

      utterance.onstart = () => {
        setIsLoading(false);
        setIsSpeaking(true);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        speechSynthesisRef.current = null;
        resolve();
      };

      utterance.onerror = (event) => {
        setIsSpeaking(false);
        setIsLoading(false);
        speechSynthesisRef.current = null;
        reject(new Error(`Speech synthesis error: ${event.error}`));
      };

      window.speechSynthesis.speak(utterance);
    });
  }, []);

  /**
   * Speak using ElevenLabs API (primary)
   */
  const speakWithElevenLabs = useCallback(async (text: string): Promise<void> => {
    try {
      const audioBlob = await textToSpeech({
        voiceId,
        text,
      });

      // Create audio element from blob
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      return new Promise((resolve, reject) => {
        audio.onloadedmetadata = () => {
          setIsLoading(false);
          setIsSpeaking(true);
        };

        audio.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
          audioRef.current = null;
          resolve();
        };

        audio.onerror = () => {
          setIsSpeaking(false);
          setIsLoading(false);
          URL.revokeObjectURL(audioUrl);
          audioRef.current = null;
          reject(new Error('Error playing audio'));
        };

        audio.play().catch(reject);
      });
    } catch (err) {
      throw err;
    }
  }, [voiceId]);

  /**
   * Main speak function
   * Tries ElevenLabs first, falls back to Web Speech API
   */
  const speak = useCallback(async (text: string) => {
    // Stop any current speech
    stop();

    // Don't speak empty text
    if (!text || text.trim() === '') {
      setError('No text to speak');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Try ElevenLabs first if configured
      if (isElevenLabsConfigured()) {
        await speakWithElevenLabs(text);
      } else {
        // Fall back to Web Speech API
        await speakWithWebSpeech(text);
      }
    } catch (err) {
      // If ElevenLabs fails, try Web Speech API as fallback
      try {
        await speakWithWebSpeech(text);
      } catch (fallbackErr) {
        const errorMessage = fallbackErr instanceof Error
          ? fallbackErr.message
          : 'Unknown error occurred';
        setError(errorMessage);
        setIsLoading(false);
      }
    }
  }, [stop, speakWithElevenLabs, speakWithWebSpeech]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return {
    speak,
    stop,
    isSpeaking,
    isLoading,
    error,
  };
};
