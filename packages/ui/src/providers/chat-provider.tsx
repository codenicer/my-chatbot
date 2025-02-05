'use client'

import * as React from 'react'
import { AIService, PersonalContext, ChatMessage, AIModel } from '@my-chatbot/core'
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
  model?: AIModel
}

export function ChatProvider({ 
  children, 
  personalContext, 
  apiKey,
  model = 'gpt-4o-mini'
}: ChatProviderProps) {
  const aiService = React.useMemo(() => new AIService(apiKey, model), [apiKey, model])
  const { messages, isLoading, sendMessage } = useChat()

  const handleSendMessage = React.useCallback(
    async (content: string) => {
      await sendMessage(content, aiService, personalContext)
    },
    [sendMessage, aiService, personalContext]
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