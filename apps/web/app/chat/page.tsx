'use client'

import { PersonalContext, CalendarService } from '@my-chatbot/core'
import { RootProvider, ChatWidget } from '@my-chatbot/ui'

export default function ChatPage() {
  const calendarService = new CalendarService()
  const personalContext: PersonalContext = {
    assistant: {
      name: 'AI Assistant',
    },
    professional: {
      currentRole: 'Software Engineer',
      company: 'Tech Corp',
      skills: [{ name: 'JavaScript', experience: 5 }],
      experience: 5,
      currentRoutine: '9-5',
      jobSearchStatus: 'active' as PersonalContext['professional']['jobSearchStatus'],
    },
    information: {
      name: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      location: {
        city: 'San Francisco',
        country: 'USA',
      },
    },
    preferences: {
      minSalary: 100000,
      location: 'San Francisco',
      remoteWork: true,
    },
  }


  if (!process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold text-red-500">Error</h1>
        <p>API keys are not configured</p>
      </div>
    )
  }

  return (
    <RootProvider
      key="chat-provider"
      personalContext={personalContext}
      apiKey={process.env.NEXT_PUBLIC_OPENAI_API_KEY!}
      calendarService={calendarService}
    >
      <main className="min-h-screen p-4 bg-white dark:bg-gray-900">
        <h1 className="text-2xl font-bold mb-8 text-gray-900 dark:text-white">
          AI Chat Assistant
        </h1>
        <div className="max-w-4xl mx-auto">
          <ChatWidget position="bottom-right" />
        </div>
      </main>
    </RootProvider>
  )
}