export type SpeakerRole = 'user' | 'caregiver' | 'family' | 'medical' | 'other';

export type MessageMethod = 'typed' | 'predicted' | 'quick_phrase' | 'thought_stream' | 'category';

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

export type FatigueLevel = 'fresh' | 'moderate' | 'tired';

export interface Participant {
  id: string;
  name: string;
  role: SpeakerRole;
  colorCode?: string; // For visual distinction in UI
}

export interface ConversationContext {
  timeOfDay: TimeOfDay;
  participantsPresent: string[]; // Participant IDs
  location?: string;
  recentActivity?: string;
  userFatigueLevel?: FatigueLevel;
  environmentalNotes?: string;
}

export interface Message {
  id: string;
  timestamp: number;
  speakerId: string; // Reference to Participant
  content: string;
  method: MessageMethod;
  context: ConversationContext;
  edited?: boolean;
  editedAt?: number;
}

export interface ConversationSession {
  id: string;
  startTime: number;
  endTime?: number;
  messages: Message[];
  participants: Participant[];
  summary?: string; // AI-generated summary
}

export interface PredictionContext {
  conversationHistory: Message[];
  currentInput: string;
  activeParticipants: Participant[];
  timeContext: TimeOfDay;
  userFatigueLevel: FatigueLevel;
  recentSelections: string[]; // For learning
}

export interface AIPrediction {
  id: string;
  content: string;
  confidence: number;
  category?: string;
  source: 'ai' | 'cache' | 'pattern' | 'static';
}

export interface GazeEvent {
  timestamp: number;
  targetId?: string;
  targetType?: 'key' | 'prediction' | 'category' | 'zone';
  dwellTime: number;
  selected: boolean;
}

export interface UserPattern {
  contextSignature: string;
  frequentPhrases: Map<string, number>; // phrase -> usage count
  timePatterns: Map<TimeOfDay, string[]>; // common phrases by time
  participantPatterns: Map<string, string[]>; // common phrases by participant
  lastUpdated: number;
}
