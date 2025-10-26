import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserSettings } from '../types/index';

interface SettingsStore extends UserSettings {
  setDwellTime: (time: number) => void;
  setVoiceId: (id: string) => void;
  setEnableAI: (enabled: boolean) => void;
  setEnableSound: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      dwellTime: 600,
      voiceId: '21m00Tcm4TlvDq8ikWAM', // Default ElevenLabs voice
      enableAI: true,
      enableSound: true,

      setDwellTime: (time) => set({ dwellTime: time }),
      setVoiceId: (id) => set({ voiceId: id }),
      setEnableAI: (enabled) => set({ enableAI: enabled }),
      setEnableSound: (enabled) => set({ enableSound: enabled }),
    }),
    {
      name: 'hellofriend-settings',
    }
  )
);
