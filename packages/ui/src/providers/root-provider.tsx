'use client'

import * as React from 'react'
import { ChatProvider } from './chat-provider'
import { CalendarProvider } from './calendar-provider'
import { CalendarService, PersonalContext } from '@my-chatbot/core'

interface RootProviderProps {
  children: React.ReactNode
  personalContext: PersonalContext
  apiKey: string
  calendarService: CalendarService
}

export function RootProvider({
  children,
  personalContext,
  apiKey,
  calendarService,
}: RootProviderProps) {
  return (
    <ChatProvider personalContext={personalContext} apiKey={apiKey}>
      <CalendarProvider calendarService={calendarService}>
        {children}
      </CalendarProvider>
    </ChatProvider>
  )
} 