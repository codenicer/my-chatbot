import * as React from 'react'
import { AIService, PersonalContext, ChatMessage } from '@my-chatbot/core'
import { useChat } from '../hooks/use-chat'

interface ChatContextValue {
  sendMessage: (content: string) => Promise<void>
  messages: Array<Omit<ChatMessage, 'role'> & { role: 'assistant' | 'user' }>
  isLoading: boolean
}

export const ChatContext = React.createContext<ChatContextValue | null>(null)

interface ChatProviderProps {
  children: React.ReactNode
  personalContext: PersonalContext
  apiKey: string
}

export function ChatProvider({ children, personalContext, apiKey }: ChatProviderProps) {
  const aiService = React.useMemo(
    () => new AIService(apiKey, personalContext),
    [apiKey, personalContext]
  )

  const { messages, isLoading, sendMessage } = useChat()

  const handleSendMessage = React.useCallback(
    async (content: string) => {
      await sendMessage(content, aiService)
    },
    [sendMessage, aiService]
  )

  const value = React.useMemo(
    () => ({
      sendMessage: handleSendMessage,
      messages: messages.filter(
        (msg): msg is ChatContextValue['messages'][number] => 
          msg.role === 'assistant' || msg.role === 'user'
      ),
      isLoading,
    }),
    [handleSendMessage, messages, isLoading]
  )

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

export function useChatter() {
  const context = React.useContext(ChatContext)
  if (!context) {
    throw new Error('useChatter must be used within a ChatProvider')
  }
  return context
} 