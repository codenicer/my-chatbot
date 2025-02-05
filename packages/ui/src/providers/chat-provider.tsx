'use client'

import * as React from 'react'
import { AIService, PersonalContext, ChatMessage, AIModel, EmailService, RateLimitParams } from '@my-chatbot/core'
import { useChat } from '../hooks/use-chat'
import { checkRateLimit } from '@my-chatbot/core'

interface ChatContextValue {
  sendMessage: (content: string) => Promise<void>
  messages: Array<Omit<ChatMessage, 'role'> & { role: 'assistant' | 'user' }>
  isLoading: boolean
  context: PersonalContext
}

export const ChatContext = React.createContext<ChatContextValue | null>(null)

interface ChatProviderProps {
  children: React.ReactNode
  personalContext: PersonalContext
  apiKey: string
  model?: AIModel
  rateLimit: RateLimitParams
}

export function ChatProvider({ 
  children, 
  personalContext, 
  apiKey,
  model = 'gpt-4o-mini',
  rateLimit
}: ChatProviderProps) {
  const aiService = React.useMemo(() => new AIService(apiKey, model), [apiKey, model])
  const emailService = React.useMemo(() => new EmailService(), [])
  const { messages, isLoading, setMessages, setIsLoading } = useChat()

  const handleMessage = React.useCallback(async (message: string) => {
    const sendResumeMatch = message.match(/SEND_RESUME:([^\s]+)/)
    if (sendResumeMatch) {
      const email = sendResumeMatch[1].trim()
      
      // Send "sending" message with EmailSendingIndicator
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: `📧 Preparing to send resume...`,
        timestamp: Date.now(),
      }])

      try {
        await emailService.sendResume(email, personalContext)
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'assistant',
          content: `✅ Resume successfully sent to ${email}! Let me know if you have any questions about ${personalContext.information.name}'s experience.`,
          timestamp: Date.now(),
        }])
      } catch (error) {
        console.error('Failed to send email:', error)
        // Send error message
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'assistant',
          content: `❌ I apologize, but there was an issue sending the resume to ${email}. Please try again or reach out directly.`,
          timestamp: Date.now(),
        }])
      }
      return true
    }
    return false
  }, [emailService, personalContext, setMessages])

  const handleSendMessage = React.useCallback(
    async (content: string) => {
      try {
        setIsLoading(true)

        // Check rate limit before processing message
        try {
          console.log('HERE!!,checkRateLimit',
           {
            identifier: 'chat', // You might want to use user ID or IP here
            limit: rateLimit.limit,
            window: rateLimit.window ,
            redis: rateLimit.redis
          }
          )
          await checkRateLimit({
            identifier: 'chat', // You might want to use user ID or IP here
            limit: rateLimit.limit,
            window: rateLimit.window ,
            redis: rateLimit.redis
          })
        } catch (error) {
          console.log('error', error)
          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: 'assistant',
            content: `⚠️ Message limit reached (${rateLimit.limit} messages per hour). Please try again later.`,
            timestamp: Date.now(),
          }])
          return
        }
        
        // Add user message
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'user',
          content,
          timestamp: Date.now(),
        }])
        
        const response = await aiService.getResponse(content, personalContext)
        
        // Add AI response
        setMessages(prev => [...prev, response])
        
        // Check if response contains email command
        await handleMessage(response.content)
      } catch (error) {
        console.error('Error in handleSendMessage:', error)
      } finally {
        setIsLoading(false)  // Clear loading state when done
      }
    },
    [aiService, personalContext, handleMessage, setMessages, setIsLoading, rateLimit]
  )

  const value = React.useMemo(
    () => ({
      sendMessage: handleSendMessage,
      messages: messages.filter(
        (msg): msg is ChatContextValue['messages'][number] => 
          msg.role === 'assistant' || msg.role === 'user'
      ),
      isLoading,
      context: personalContext,
    }),
    [handleSendMessage, messages, isLoading, personalContext]
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