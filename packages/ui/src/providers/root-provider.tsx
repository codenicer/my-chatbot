'use client'

import * as React from 'react'
import { ChatProvider } from './chat-provider'
import {
  PersonalContext,
  RateLimitParams,
  AIModelConfig,
} from '@my-chatbot/core'

interface RootProviderProps {
  children: React.ReactNode
  personalContext: PersonalContext
  aiConfig: AIModelConfig
  rateLimit: RateLimitParams
}

export function RootProvider({
  children,
  personalContext,
  aiConfig,
  rateLimit,
}: RootProviderProps) {
  return (
    <ChatProvider
      personalContext={personalContext}
      aiConfig={aiConfig}
      rateLimit={rateLimit}
    >
      {children}
    </ChatProvider>
  )
}
