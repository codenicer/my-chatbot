'use client'

import * as React from 'react'
import { AIService, PersonalContext, ChatMessage, AIModel, EmailService, RateLimitParams, MeetingDetails } from '@my-chatbot/core'
import { useChat } from '../hooks/use-chat'
import { checkRateLimit } from '@my-chatbot/core'
import { CalendarService } from '@my-chatbot/core'

interface ChatContextValue {
  sendMessage: (content: string) => Promise<void>
  messages: Array<Omit<ChatMessage, 'role'> & { role: 'assistant' | 'user' }>
  isLoading: boolean
  isSendingEmail: boolean
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

interface MeetingContextState {
  purpose?: string;
  datetime?: string;
  duration?: number;
  attendees?: string[];
  status: 'idle' | 'collecting' | 'complete';
}


export function ChatProvider({ 
  children, 
  personalContext, 
  apiKey,
  model = 'gpt-4o-mini',
  rateLimit,
}: ChatProviderProps) {
  const aiService = React.useMemo(() => new AIService(apiKey, model), [apiKey, model])
  const emailService = React.useMemo(() => new EmailService(), [])
  const { messages, isLoading, setMessages, setIsLoading } = useChat()
  const calendarService = React.useMemo(() => new CalendarService(), [])
  const [isSendingEmail, setIsSendingEmail] = React.useState(false)
  const [meetingContext, setMeetingContext] = React.useState<MeetingContextState>({
    status: 'idle'
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const updateMeetingContext = (update: Partial<MeetingContextState>) => {
    setMeetingContext(prev => ({
      ...prev,
      ...update,
      status: 'collecting'
    }));
  };

  console.log('meetingContext', meetingContext)

  const handleMessage = React.useCallback(async (message: string) => {
    // First check if this is a meeting request
    if (meetingContext.status === 'collecting') {
      const parsedInfo = await aiService.parseMeetingInfo(message)
      if (parsedInfo.details) {
        updateMeetingContext(parsedInfo.details)
        console.log('Updated meeting context:', meetingContext)
      }
    } else if (message.toLowerCase().includes('meeting') || 
      message.toLowerCase().includes('schedule') || 
      message.toLowerCase().includes('interview')) {
      setMeetingContext(prev => ({
        ...prev,
        status: 'collecting'
      }))
    }

    const sendResumeMatch = message.match(/SEND_RESUME:([^\s\n]+)/)
    if (sendResumeMatch) {
      const email = sendResumeMatch[1].trim()
      
      try {
        setIsSendingEmail(true)
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'assistant',
          content: `📧 I'm sending ${personalContext.information.name}'s resume to ${email} now...`,
          timestamp: Date.now(),
        }])
        
        await emailService.sendResume(email, personalContext)
        
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'assistant',
          content: `✅ Great! I've sent ${personalContext.information.name}'s resume to ${email}. Please check your inbox. Let me know if you need anything else!`,
          timestamp: Date.now(),
        }])
      } catch (error) {
        console.error('Failed to send email:', error)
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'assistant',
          content: `❌ I apologize, but I couldn't send the resume to ${email}. This might be due to a technical issue. Could you please try again or use a different email address?`,
          timestamp: Date.now(),
        }])
      } finally {
        setIsSendingEmail(false)
      }
      return true
    }

    // Check for meeting scheduling command
    const meetingMatch = message.match(/SCHEDULE_MEETING:(.+)/)
    if (meetingMatch) {
      try {
        const meetingDetails: MeetingDetails = JSON.parse(meetingMatch[1])
        
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'assistant',
          content: '📅 Scheduling your meeting...',
          timestamp: Date.now(),
        }])

        const event = await calendarService.scheduleMeeting(meetingDetails)
        
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'assistant',
          content: `✅ Meeting scheduled successfully!\n\n📆 ${meetingDetails.purpose}\n⏰ ${new Date(meetingDetails.datetime).toLocaleString()}\n👥 Attendees: ${meetingDetails.attendees.join(', ')}\n\n${event.hangoutLink ? `🎥 Meet link: ${event.hangoutLink}` : ''}`,
          timestamp: Date.now(),
        }])
      } catch (error) {
        console.error('Failed to schedule meeting:', error)
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'assistant',
          content: '❌ Sorry, I encountered an error while scheduling the meeting. Please try again or reach out directly.',
          timestamp: Date.now(),
        }])
      }
      return true
    }

    return false
  }, [emailService, personalContext, setMessages, calendarService, meetingContext, updateMeetingContext, aiService])

  const createSystemPrompt = React.useCallback(() => {
    let prompt = aiService.getBaseSystemPrompt(personalContext);
    
    if (meetingContext.status === 'collecting') {
      prompt += '\nCurrently collecting meeting details:\n';
      if (!meetingContext.purpose) {
        prompt += '- Ask for the purpose of the meeting\n';
      }
      if (!meetingContext.datetime) {
        prompt += '- Ask for preferred date and time (with timezone)\n';
      }
      if (!meetingContext.duration) {
        prompt += '- Ask for meeting duration\n';
      }
      if (!meetingContext.attendees?.length) {
        prompt += '- Ask for attendee email addresses\n';
      }
      prompt += 'Only ask for missing information one at a time. Do not repeat questions for information already provided.';
    }

    return prompt;
  }, [meetingContext, aiService, personalContext]);

  const handleSendMessage = React.useCallback(
    async (content: string) => {
      try {
        // Check rate limit before processing message
        try {
          await checkRateLimit({
            identifier: 'chat',
            limit: rateLimit.limit,
            window: rateLimit.window,
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
        
        // Add user message first
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'user',
          content,
          timestamp: Date.now(),
        }])

        // Start loading and add delay
        setIsLoading(true)
   
        
        const response = await aiService.getResponse(content, personalContext, createSystemPrompt())
        
        // Add AI response
        setMessages(prev => [...prev, response])
        
        // Check if response contains email command
        await handleMessage(response.content)
      } catch (error) {
        console.error('Error in handleSendMessage:', error)
      } finally {
        setIsLoading(false)
      }
    },
    [aiService, personalContext, handleMessage, setMessages, setIsLoading, rateLimit, createSystemPrompt]
  )

  const value = React.useMemo(
    () => ({
      sendMessage: handleSendMessage,
      messages: messages.filter(
        (msg): msg is ChatContextValue['messages'][number] => 
          msg.role === 'assistant' || msg.role === 'user'
      ),
      isLoading,
      isSendingEmail,
      context: personalContext,
    }),
    [handleSendMessage, messages, isLoading, isSendingEmail, personalContext]
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