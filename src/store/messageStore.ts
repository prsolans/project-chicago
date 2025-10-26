import { create } from 'zustand';

interface MessageStore {
  message: string;
  addCharacter: (char: string) => void;
  addWord: (word: string) => void;
  deleteCharacter: () => void;
  deleteWord: () => void;
  clear: () => void;
  addSpace: () => void;
}

export const useMessageStore = create<MessageStore>((set) => ({
  message: '',

  addCharacter: (char) => set((state) => ({
    message: state.message + char
  })),

  addWord: (word) => set((state) => ({
    message: state.message + (state.message && !state.message.endsWith(' ') ? ' ' : '') + word
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

  clear: () => set({ message: '' }),

  addSpace: () => set((state) => ({
    message: state.message + ' '
  })),
}));
