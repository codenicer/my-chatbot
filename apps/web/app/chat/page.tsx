'use client'

import { PersonalContext, CalendarService, RateLimitParams } from '@my-chatbot/core'
import { RootProvider, ChatWidget } from '@my-chatbot/ui'
import { Redis } from '@upstash/redis'
import { useEffect, useState } from 'react'

// Initialize Redis with public env vars
const redis = new Redis({
  url: process.env.NEXT_PUBLIC_REDIS_URL!,
  token: process.env.NEXT_PUBLIC_REDIS_TOKEN!,
})

export default function ChatPage() {
  const [clientIp, setClientIp] = useState<string>('unknown')
  const calendarService = new CalendarService()
  const personalContext: PersonalContext = {
   assistant: {
     name: 'Taiga',
   },
   professional: {
     currentRole: 'Full Stack Web Developer',
     company: 'Dashlabs.ai',
     skills: [
       { name: 'JavaScript', experience: 5 },
       { name: 'CSS', experience: 5 },
       { name: 'PHP', experience: 5 },
       { name: 'Typescript', experience: 5 },
     ],
     experience: 5,
     currentRoutine: '9-5',
     jobSearchStatus: 'active',
   },
   information: {
     name: 'Ruther',
     lastName: 'Tenido',
     email: 'ruther@example.com',
     resumeUrl: 'https://codenicer.dev/Tenido-Ruther-V.-Resume.pdf',
     location: {
       city: 'Laguna',
       country: 'Philippines',
     },
   },
   preferences: {
     minSalary: 100000,
     location: 'Laguna',
     remoteWork: true,
   },
 };

  useEffect(() => {
    // Fetch client IP on component mount
    fetch('/api/client-ip')
      .then(res => res.json())
      .then(data => setClientIp(data.ip))
      .catch(console.error)
  }, [])

  // Configure rate limit with client IP
  const rateLimit: RateLimitParams = {
    identifier: `chat:${clientIp}`,  // Use IP in identifier
    limit: 5,
    window: 3600,
    redis,
  }

  console.log('rateLimit', rateLimit)

  if (!process.env.NEXT_PUBLIC_OPENAI_API_KEY || !process.env.NEXT_PUBLIC_REDIS_URL || !process.env.NEXT_PUBLIC_REDIS_TOKEN) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold text-red-500">Error</h1>
        <p>Required environment variables are not configured</p>
      </div>
    )
  }

  return (
    <RootProvider
      key={`chat-provider-${clientIp}`} // Force re-render when IP changes
      personalContext={personalContext}
      apiKey={process.env.NEXT_PUBLIC_OPENAI_API_KEY}
      calendarService={calendarService}
      model="gpt-4o-mini"
      rateLimit={rateLimit}
    >
      <main className="min-h-screen p-4 bg-white dark:bg-gray-900">
        <h1 className="text-2xl font-bold mb-8 text-gray-900 dark:text-white">
          Chat with {personalContext.assistant.name}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          {personalContext.information.name}'s Professional AI Assistant
        </p>
        <div className="max-w-4xl mx-auto">
          <ChatWidget position="bottom-right" />
        </div>
      </main>
    </RootProvider>
  )
}