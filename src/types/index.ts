export interface KeyConfig {
  id: string;
  label: string;
  value: string;
  type: 'letter' | 'number' | 'space' | 'delete' | 'speak' | 'clear';
  gridArea?: string;
  className?: string;
}

export interface FirstWord {
  id: string;
  text: string;
  category: 'family' | 'responses' | 'common';
}

export interface UserSettings {
  dwellTime: number; // milliseconds
  voiceId: string;
  enableAI: boolean;
  enableSound: boolean;
}

export interface Prediction {
  text: string;
  confidence: number;
  source: 'local' | 'ai';
}
