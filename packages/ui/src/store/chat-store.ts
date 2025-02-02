import { create } from 'zustand'
import { ChatMessage, PersonalContext } from '@my-chatbot/core'

interface ChatState {
  messages: ChatMessage[]
  context: PersonalContext | null
  isLoading: boolean
  error: string | null
  addMessage: (message: ChatMessage) => void
  setContext: (context: PersonalContext) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearMessages: () => void
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  context: null,
  isLoading: false,
  error: null,
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  setContext: (context) => set({ context }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  clearMessages: () => set({ messages: [] }),
}))
