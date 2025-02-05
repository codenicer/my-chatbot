'use client'

import { AIService, ChatMessage, PersonalContext } from '@my-chatbot/core'
import React from 'react'

export function useChat() {
  const [messages, setMessages] = React.useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = React.useState(false)

  const sendMessage = React.useCallback(
    async (content: string, aiService: AIService, context: PersonalContext) => {
      setIsLoading(true)
      try {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: 'user',
            content,
            timestamp: Date.now(),
          },
        ])

        const response = await aiService.getResponse(content, context)
        setMessages((prev) => [...prev, response])
      } catch (error) {
        console.error('Failed to send message:', error)
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  return { messages, setMessages, isLoading, setIsLoading, sendMessage }
}
