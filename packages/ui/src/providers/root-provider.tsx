'use client'

import * as React from 'react'
import { ChatProvider } from './chat-provider'
import {
  CalendarService,
  PersonalContext,
  RateLimitParams,
} from '@my-chatbot/core'
import { AIModel } from '@my-chatbot/core'

interface RootProviderProps {
  children: React.ReactNode
  personalContext: PersonalContext
  apiKey: string
  calendarService: CalendarService
  model?: AIModel
  rateLimit: RateLimitParams
}

export function RootProvider({
  children,
  personalContext,
  apiKey,
  model,
  rateLimit,
}: RootProviderProps) {
  return (
    <ChatProvider
      personalContext={personalContext}
      apiKey={apiKey}
      model={model}
      rateLimit={rateLimit}
    >
      {children}
    </ChatProvider>
  )
}
