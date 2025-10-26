/**
 * ElevenLabs Text-to-Speech API Service
 * Converts text to speech using ElevenLabs API
 */

const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;
const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1/text-to-speech';

export interface TTSOptions {
  voiceId: string;
  text: string;
  stability?: number;  // 0-1, default 0.5
  similarityBoost?: number;  // 0-1, default 0.75
}

export interface TTSError {
  message: string;
  code?: string;
}

/**
 * Convert text to speech using ElevenLabs API
 * @param options TTS options including voice ID and text
 * @returns Audio blob that can be played
 * @throws Error if API call fails or API key is missing
 */
export async function textToSpeech(options: TTSOptions): Promise<Blob> {
  const { voiceId, text, stability = 0.5, similarityBoost = 0.75 } = options;

  // Check if API key is configured
  if (!ELEVENLABS_API_KEY || ELEVENLABS_API_KEY === 'your_elevenlabs_api_key_here') {
    throw new Error('ElevenLabs API key not configured');
  }

  try {
    const response = await fetch(`${ELEVENLABS_API_URL}/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability,
          similarity_boost: similarityBoost,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.detail?.message ||
        `ElevenLabs API error: ${response.status} ${response.statusText}`
      );
    }

    // Return audio blob
    const audioBlob = await response.blob();
    return audioBlob;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Unknown error calling ElevenLabs API');
  }
}

/**
 * Check if ElevenLabs API is configured
 */
export function isElevenLabsConfigured(): boolean {
  return !!ELEVENLABS_API_KEY && ELEVENLABS_API_KEY !== 'your_elevenlabs_api_key_here';
}
