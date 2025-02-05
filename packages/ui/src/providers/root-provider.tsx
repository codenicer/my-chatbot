'use client'

import * as React from 'react'
import { ChatProvider } from './chat-provider'
import { CalendarProvider } from './calendar-provider'
import { CalendarService, PersonalContext, RateLimitParams } from '@my-chatbot/core'
import { AIModel } from '@my-chatbot/core'
import { Redis } from '@upstash/redis'

interface RootProviderProps {
  children: React.ReactNode
  personalContext: PersonalContext
  apiKey: string
  calendarService: CalendarService
  model?: AIModel,
  rateLimit: RateLimitParams
}

export function RootProvider({
  children,
  personalContext,
  apiKey,
  calendarService,
  model,
  rateLimit,
}: RootProviderProps) {
  return (
    <ChatProvider personalContext={personalContext} apiKey={apiKey} model={model} rateLimit={rateLimit}>
      <CalendarProvider calendarService={calendarService}>
        {children}
      </CalendarProvider>
    </ChatProvider>
  )
} 