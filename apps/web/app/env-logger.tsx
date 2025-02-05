'use client'

import { useEffect } from 'react'

export function EnvLogger() {
  useEffect(() => {
    console.log('Environment Variables:', {
      REDIS_URL: process.env.REDIS_URL,
      REDIS_TOKEN: process.env.REDIS_TOKEN,
      GOOGLE_SERVICE_ACCOUNT_EMAIL: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      GOOGLE_PRIVATE_KEY: process.env.GOOGLE_PRIVATE_KEY?.slice(0, 20) + '...',
      EMAIL_USER: process.env.EMAIL_USER,
      EMAIL_PASSWORD: '****',
      NEXT_PUBLIC_OPENAI_API_KEY: process.env.NEXT_PUBLIC_OPENAI_API_KEY?.slice(0, 20) + '...',
    })
  }, [])

  return null
} 