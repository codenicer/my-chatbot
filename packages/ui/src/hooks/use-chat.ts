import { useState, useCallback } from 'react'
import { useChatStore } from '../store/chat-store'
import { AIService, ChatMessage } from '@my-chatbot/core'

export function useChat() {
  const [isLoading, setIsLoading] = useState(false)
  const { messages, addMessage, setError } = useChatStore()

  const sendMessage = useCallback(
    async (content: string, aiService: AIService) => {
      try {
        setIsLoading(true)

        // Add user message
        const userMessage: ChatMessage = {
          id: Date.now().toString(),
          role: 'user',
          content,
          timestamp: Date.now(),
        }
        addMessage(userMessage)

        // Get AI response
        const response = await aiService.getResponse(content)
        addMessage(response)
      } catch (error) {
        setError(
          error instanceof Error ? error.message : 'Failed to send message'
        )
      } finally {
        setIsLoading(false)
      }
    },
    [addMessage, setError]
  )

  return {
    messages,
    isLoading,
    sendMessage,
  }
}
