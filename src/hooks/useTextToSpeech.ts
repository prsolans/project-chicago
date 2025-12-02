import { useState, useCallback, useRef, useEffect } from 'react';
import { textToSpeech, isElevenLabsConfigured } from '../services/elevenLabsApi';
import { useSettingsStore } from '../store/settingsStore';
import type { EmotionSettings } from '../utils/emotionTags';
import { getVoiceSettingsForEmotion, prepareTextForElevenLabs, prepareTextForWebSpeech } from '../utils/emotionTags';

// Track if audio has been unlocked by user interaction
let audioUnlocked = false;

// Unlock audio context on first user interaction
const unlockAudio = () => {
  if (audioUnlocked) return;

  // Create and play a silent audio to unlock
  const silentAudio = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA');
  silentAudio.play().then(() => {
    audioUnlocked = true;
    console.log('TTS: Audio unlocked by user interaction');
  }).catch(() => {
    // Ignore errors - will try again on next interaction
  });

  // Also unlock Web Speech API
  if (window.speechSynthesis) {
    const utterance = new SpeechSynthesisUtterance('');
    window.speechSynthesis.speak(utterance);
    window.speechSynthesis.cancel();
  }
};

// Add global click listener to unlock audio
if (typeof window !== 'undefined') {
  const handleFirstInteraction = () => {
    unlockAudio();
  };
  document.addEventListener('click', handleFirstInteraction, { once: false });
  document.addEventListener('touchstart', handleFirstInteraction, { once: false });
}

interface SpeakOptions {
  emotionSettings?: EmotionSettings;
}

interface UseTextToSpeechReturn {
  speak: (text: string, options?: SpeakOptions) => Promise<void>;
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
  const speakWithWebSpeech = useCallback((text: string, options?: SpeakOptions): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!window.speechSynthesis) {
        reject(new Error('Web Speech API not supported'));
        return;
      }

      // Prepare text for Web Speech (removes unsupported tags)
      const cleanText = prepareTextForWebSpeech(text);
      const utterance = new SpeechSynthesisUtterance(cleanText);
      speechSynthesisRef.current = utterance;

      // Apply speed if specified
      if (options?.emotionSettings?.speed) {
        utterance.rate = options.emotionSettings.speed;
      }

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
  const speakWithElevenLabs = useCallback(async (text: string, options?: SpeakOptions): Promise<void> => {
    try {
      // Prepare text for ElevenLabs (keeps [laughs], [sighs], etc.)
      const preparedText = prepareTextForElevenLabs(text);

      // Get voice settings based on emotion
      const emotion = options?.emotionSettings?.emotion || options?.emotionSettings?.effect;
      const voiceSettings = emotion ? getVoiceSettingsForEmotion(emotion) : undefined;

      const audioBlob = await textToSpeech({
        voiceId,
        text: preparedText,
        ...(voiceSettings && {
          stability: voiceSettings.stability,
          similarityBoost: voiceSettings.similarity_boost,
          style: voiceSettings.style,
          useSpeakerBoost: voiceSettings.use_speaker_boost,
        }),
      });

      // Create audio element from blob
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      // Apply speed multiplier if specified
      if (options?.emotionSettings?.speed) {
        audio.playbackRate = options.emotionSettings.speed;
      }

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
  const speak = useCallback(async (text: string, options?: SpeakOptions) => {
    // Stop any current speech
    stop();

    // Don't speak empty text
    if (!text || text.trim() === '') {
      console.error('TTS: No text to speak');
      setError('No text to speak');
      return;
    }

    console.log('TTS: Starting speak', { text, elevenLabsConfigured: isElevenLabsConfigured() });
    setIsLoading(true);
    setError(null);

    try {
      // Try ElevenLabs first if configured
      if (isElevenLabsConfigured()) {
        console.log('TTS: Using ElevenLabs');
        await speakWithElevenLabs(text, options);
      } else {
        // Fall back to Web Speech API
        console.log('TTS: Using Web Speech API (ElevenLabs not configured)');
        await speakWithWebSpeech(text, options);
      }
    } catch (err) {
      console.error('TTS: Primary method failed', err);
      // If ElevenLabs fails, try Web Speech API as fallback
      try {
        console.log('TTS: Falling back to Web Speech API');
        await speakWithWebSpeech(text, options);
      } catch (fallbackErr) {
        console.error('TTS: Fallback also failed', fallbackErr);
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
