import { useCallback, useEffect } from 'react';
import { useConversationStore } from '../store/conversationStore';
import type { MessageMethod, SpeakerRole } from '../types/conversation';

/**
 * Custom hook for managing conversations
 * Provides convenient methods for common conversation operations
 */
export function useConversation() {
  const store = useConversationStore();

  // Auto-start session if none exists
  useEffect(() => {
    if (!store.currentSession) {
      store.startNewSession();
    }
  }, []);

  /**
   * Send a message from the current speaker
   */
  const sendMessage = useCallback((content: string, method: MessageMethod = 'typed') => {
    if (!content.trim()) return;
    store.addMessage(content, method);
  }, [store]);

  /**
   * Quick method to add participant and set as active
   */
  const addAndActivateParticipant = useCallback((name: string, role: SpeakerRole) => {
    const participant = store.addParticipant(name, role);
    const currentActive = store.activeParticipants;
    store.setActiveParticipants([...currentActive, participant.id]);
    return participant;
  }, [store]);

  /**
   * Get display name for a participant ID
   */
  const getParticipantName = useCallback((participantId: string) => {
    const participant = store.allParticipants.find(p => p.id === participantId);
    return participant?.name || 'Unknown';
  }, [store.allParticipants]);

  /**
   * Get participant by ID
   */
  const getParticipant = useCallback((participantId: string) => {
    return store.allParticipants.find(p => p.id === participantId);
  }, [store.allParticipants]);

  /**
   * Get active participants (full objects)
   */
  const getActiveParticipants = useCallback(() => {
    return store.allParticipants.filter(p => store.activeParticipants.includes(p.id));
  }, [store.allParticipants, store.activeParticipants]);

  /**
   * Get current speaker
   */
  const getCurrentSpeaker = useCallback(() => {
    return store.allParticipants.find(p => p.id === store.currentSpeakerId);
  }, [store.allParticipants, store.currentSpeakerId]);

  /**
   * Toggle participant active status
   */
  const toggleParticipant = useCallback((participantId: string) => {
    const isActive = store.activeParticipants.includes(participantId);
    if (isActive) {
      store.setActiveParticipants(
        store.activeParticipants.filter(id => id !== participantId)
      );
    } else {
      store.setActiveParticipants([...store.activeParticipants, participantId]);
    }
  }, [store]);

  return {
    // State
    currentSession: store.currentSession,
    allParticipants: store.allParticipants,
    activeParticipants: getActiveParticipants(),
    currentSpeaker: getCurrentSpeaker(),
    currentContext: store.currentContext,
    messages: store.currentSession?.messages || [],

    // Actions
    sendMessage,
    editMessage: store.editMessage,
    deleteMessage: store.deleteMessage,

    // Participant management
    addParticipant: store.addParticipant,
    addAndActivateParticipant,
    setCurrentSpeaker: store.setCurrentSpeaker,
    toggleParticipant,
    getParticipantName,
    getParticipant,

    // Context
    updateContext: store.updateContext,
    getCurrentTimeOfDay: store.getCurrentTimeOfDay,

    // Session management
    startNewSession: store.startNewSession,
    endCurrentSession: store.endCurrentSession,

    // History
    getRecentMessages: store.getRecentMessages,
    searchMessages: store.searchMessages,
    exportSession: store.exportSession,
  };
}
