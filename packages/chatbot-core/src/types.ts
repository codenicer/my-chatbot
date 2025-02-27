import { Redis } from '@upstash/redis'

export type PersonalContext = {
  assistant: {
    name: string
    avatarUrl?: string
  }
  professional: {
    currentRole: string
    company: string
    skills: Array<{
      name: string
      experience: number
    }>
    experience: number
    currentRoutine: string
    jobSearchStatus: 'active' | 'passive' | 'not-looking'
  }
  information: {
    name: string
    lastName: string
    email: string
    phone?: string
    location: {
      city: string
      country: string
      openToRelocation?: boolean
    }
    resumeUrl: string
  }
  preferences: {
    minSalary: number
    maxSalary?: number
    location: string
    remoteWork: boolean
  }
}

export type ChatMessage = {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
}

export type ChatError = {
  code: string
  message: string
  timestamp: number
}

export interface MeetingDetails {
  purpose: string
  date: string
  duration: number
  email: string
}

export interface CalendarEvent {
  id?: string
  summary?: string
  description?: string
  start?: { dateTime?: string }
  end?: { dateTime?: string }
  attendees?: { email: string }[]
  hangoutLink?: string
}

export interface ChatTheme {
  primary: {
    background: string // Dark navy blue from your site
    text: string // White/light text
  }
  secondary: {
    background: string // Golden/bronze color from your text
    text: string // Dark text for contrast
  }
  accent: {
    background: string // Light blue from your links
    text: string
  }
  neutral: {
    background: string // For input fields, cards
    text: string
    border: string
  }
}

export type AIProvider = 'openai' | 'gemini'

export type AIModelConfig = {
  provider: AIProvider
  model?: string
  apiKey: string
  temperature?: number
}
export interface RateLimitParams {
  identifier: string
  limit: number
  window: number
  redis: Redis
}
