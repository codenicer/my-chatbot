export type PersonalContext = {
  assistant: {
    name: string
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
