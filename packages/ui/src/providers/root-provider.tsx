'use client'

import * as React from 'react'
import { ChatProvider } from './chat-provider'
import { CalendarProvider } from './calendar-provider'
import { CalendarService, PersonalContext } from '@my-chatbot/core'
import { AIModel } from '@my-chatbot/core'

interface RootProviderProps {
  children: React.ReactNode
  personalContext: PersonalContext
  apiKey: string
  calendarService: CalendarService
  model?: AIModel
}

export function RootProvider({
  children,
  personalContext,
  apiKey,
  calendarService,
  model,
}: RootProviderProps) {
  return (
    <ChatProvider personalContext={personalContext} apiKey={apiKey} model={model}>
      <CalendarProvider calendarService={calendarService}>
        {children}
      </CalendarProvider>
    </ChatProvider>
  )
} 