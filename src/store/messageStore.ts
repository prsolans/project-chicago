import { create } from 'zustand';
import { useConversationStore } from './conversationStore';
import type { MessageMethod } from '../types/conversation';

interface MessageStore {
  message: string;
  currentMethod: MessageMethod;
  addCharacter: (char: string) => void;
  addWord: (word: string) => void;
  deleteCharacter: () => void;
  deleteWord: () => void;
  clear: () => void;
  addSpace: () => void;
  sendMessage: (method?: MessageMethod) => void;
  setMessage: (text: string, method?: MessageMethod) => void;
}

export const useMessageStore = create<MessageStore>((set, get) => ({
  message: '',
  currentMethod: 'typed' as MessageMethod,

  addCharacter: (char) => set((state) => ({
    message: state.message + char,
    currentMethod: 'typed',
  })),

  addWord: (word) => set((state) => ({
    message: state.message + (state.message && !state.message.endsWith(' ') ? ' ' : '') + word,
    currentMethod: 'predicted',
  })),

  deleteCharacter: () => set((state) => ({
    message: state.message.slice(0, -1)
  })),

  deleteWord: () => set((state) => {
    const trimmed = state.message.trimEnd();
    const lastSpaceIndex = trimmed.lastIndexOf(' ');
    return {
      message: lastSpaceIndex === -1 ? '' : trimmed.slice(0, lastSpaceIndex + 1)
    };
  }),

  clear: () => set({ message: '', currentMethod: 'typed' }),

  addSpace: () => set((state) => ({
    message: state.message + ' '
  })),

  /**
   * Send the current message to the conversation store and clear the input
   */
  sendMessage: (method?: MessageMethod) => {
    const state = get();
    const messageToSend = state.message.trim();

    if (messageToSend) {
      const finalMethod = method || state.currentMethod;
      useConversationStore.getState().addMessage(messageToSend, finalMethod);
      set({ message: '', currentMethod: 'typed' });
    }
  },

  /**
   * Set message from a prediction or quick phrase
   */
  setMessage: (text: string, method: MessageMethod = 'predicted') => {
    set({ message: text, currentMethod: method });
  },
}));
