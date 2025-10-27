import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  ConversationSession,
  Message,
  Participant,
  ConversationContext,
  MessageMethod,
  SpeakerRole,
  TimeOfDay,
} from '../types/conversation';

interface ConversationState {
  // Current session
  currentSession: ConversationSession | null;

  // All participants (persisted across sessions)
  allParticipants: Participant[];

  // Active participants in current conversation
  activeParticipants: string[]; // Participant IDs

  // Current speaker (who is about to send a message)
  currentSpeakerId: string;

  // Session history
  pastSessions: ConversationSession[];

  // Current context
  currentContext: ConversationContext;

  // Actions
  startNewSession: () => void;
  endCurrentSession: () => void;
  addMessage: (content: string, method: MessageMethod) => void;
  editMessage: (messageId: string, newContent: string) => void;
  deleteMessage: (messageId: string) => void;

  // Participant management
  addParticipant: (name: string, role: SpeakerRole) => Participant;
  setCurrentSpeaker: (participantId: string) => void;
  setActiveParticipants: (participantIds: string[]) => void;

  // Context management
  updateContext: (updates: Partial<ConversationContext>) => void;
  getCurrentTimeOfDay: () => TimeOfDay;

  // History management
  getRecentMessages: (count: number) => Message[];
  getAllMessages: () => Message[];
  searchMessages: (query: string) => Message[];

  // Session management
  loadSession: (sessionId: string) => void;
  exportSession: (sessionId: string) => string;
}

const generateId = () => crypto.randomUUID();

const getTimeOfDay = (): TimeOfDay => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
};

const createDefaultUser = (): Participant => ({
  id: 'user-default',
  name: 'Me',
  role: 'user',
  colorCode: '#3b82f6', // blue
});

export const useConversationStore = create<ConversationState>()(
  persist(
    (set, get) => ({
      currentSession: null,
      allParticipants: [createDefaultUser()],
      activeParticipants: ['user-default'],
      currentSpeakerId: 'user-default',
      pastSessions: [],
      currentContext: {
        timeOfDay: getTimeOfDay(),
        participantsPresent: ['user-default'],
        userFatigueLevel: 'fresh',
      },

      startNewSession: () => {
        const currentSession = get().currentSession;

        // End current session if exists
        if (currentSession) {
          get().endCurrentSession();
        }

        const newSession: ConversationSession = {
          id: generateId(),
          startTime: Date.now(),
          messages: [],
          participants: get().allParticipants.filter(p =>
            get().activeParticipants.includes(p.id)
          ),
        };

        set({
          currentSession: newSession,
          currentContext: {
            ...get().currentContext,
            timeOfDay: getTimeOfDay(),
          },
        });
      },

      endCurrentSession: () => {
        const session = get().currentSession;
        if (!session) return;

        const endedSession: ConversationSession = {
          ...session,
          endTime: Date.now(),
        };

        set(state => ({
          pastSessions: [...state.pastSessions, endedSession],
          currentSession: null,
        }));
      },

      addMessage: (content: string, method: MessageMethod) => {
        const { currentSession, currentSpeakerId, currentContext } = get();

        // Auto-start session if none exists
        if (!currentSession) {
          get().startNewSession();
        }

        const message: Message = {
          id: generateId(),
          timestamp: Date.now(),
          speakerId: currentSpeakerId,
          content,
          method,
          context: { ...currentContext },
        };

        set(state => ({
          currentSession: state.currentSession ? {
            ...state.currentSession,
            messages: [...state.currentSession.messages, message],
          } : null,
          currentContext: {
            ...state.currentContext,
            timeOfDay: getTimeOfDay(),
          },
        }));
      },

      editMessage: (messageId: string, newContent: string) => {
        set(state => ({
          currentSession: state.currentSession ? {
            ...state.currentSession,
            messages: state.currentSession.messages.map(msg =>
              msg.id === messageId
                ? { ...msg, content: newContent, edited: true, editedAt: Date.now() }
                : msg
            ),
          } : null,
        }));
      },

      deleteMessage: (messageId: string) => {
        set(state => ({
          currentSession: state.currentSession ? {
            ...state.currentSession,
            messages: state.currentSession.messages.filter(msg => msg.id !== messageId),
          } : null,
        }));
      },

      addParticipant: (name: string, role: SpeakerRole) => {
        const newParticipant: Participant = {
          id: generateId(),
          name,
          role,
          colorCode: getColorForRole(role),
        };

        set(state => ({
          allParticipants: [...state.allParticipants, newParticipant],
        }));

        return newParticipant;
      },

      setCurrentSpeaker: (participantId: string) => {
        set({ currentSpeakerId: participantId });
      },

      setActiveParticipants: (participantIds: string[]) => {
        set(state => ({
          activeParticipants: participantIds,
          currentContext: {
            ...state.currentContext,
            participantsPresent: participantIds,
          },
        }));
      },

      updateContext: (updates: Partial<ConversationContext>) => {
        set(state => ({
          currentContext: {
            ...state.currentContext,
            ...updates,
            timeOfDay: getTimeOfDay(),
          },
        }));
      },

      getCurrentTimeOfDay: () => {
        return getTimeOfDay();
      },

      getRecentMessages: (count: number) => {
        const session = get().currentSession;
        if (!session) return [];
        return session.messages.slice(-count);
      },

      getAllMessages: () => {
        const session = get().currentSession;
        return session?.messages || [];
      },

      searchMessages: (query: string) => {
        const session = get().currentSession;
        if (!session) return [];

        const lowerQuery = query.toLowerCase();
        return session.messages.filter(msg =>
          msg.content.toLowerCase().includes(lowerQuery)
        );
      },

      loadSession: (sessionId: string) => {
        const session = get().pastSessions.find(s => s.id === sessionId);
        if (!session) return;

        set({
          currentSession: { ...session, endTime: undefined },
        });
      },

      exportSession: (sessionId: string) => {
        const session = sessionId === 'current'
          ? get().currentSession
          : get().pastSessions.find(s => s.id === sessionId);

        if (!session) return '';

        const participants = get().allParticipants;
        const lines = session.messages.map(msg => {
          const speaker = participants.find(p => p.id === msg.speakerId);
          const timestamp = new Date(msg.timestamp).toLocaleString();
          return `[${timestamp}] ${speaker?.name || 'Unknown'}: ${msg.content}`;
        });

        return lines.join('\n');
      },
    }),
    {
      name: 'conversation-storage',
      partialize: (state) => ({
        allParticipants: state.allParticipants,
        pastSessions: state.pastSessions,
        // Don't persist currentSession to avoid stale data on reload
      }),
    }
  )
);

// Helper function to assign colors based on role
function getColorForRole(role: SpeakerRole): string {
  const colorMap: Record<SpeakerRole, string> = {
    user: '#3b82f6', // blue
    caregiver: '#10b981', // green
    family: '#8b5cf6', // purple
    medical: '#ef4444', // red
    other: '#6b7280', // gray
  };
  return colorMap[role];
}
