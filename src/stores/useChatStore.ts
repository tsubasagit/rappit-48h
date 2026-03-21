import { create } from 'zustand';
import { sendChatMessage } from '../lib/api';

interface ChatState {
  isAiTyping: boolean;
  inputMessage: string;
  error: string | null;
  setAiTyping: (value: boolean) => void;
  setInputMessage: (value: string) => void;
  setError: (error: string | null) => void;
  sendMessage: (projectId: string, message: string) => Promise<void>;
}

export const useChatStore = create<ChatState>((set) => ({
  isAiTyping: false,
  inputMessage: '',
  error: null,

  setAiTyping: (value) => set({ isAiTyping: value }),
  setInputMessage: (value) => set({ inputMessage: value }),
  setError: (error) => set({ error }),

  sendMessage: async (projectId, message) => {
    set({ isAiTyping: true, error: null });
    try {
      await sendChatMessage(projectId, message);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '送信に失敗しました';
      set({ error: errorMessage });
    } finally {
      set({ isAiTyping: false });
    }
  },
}));
