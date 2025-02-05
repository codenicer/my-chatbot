'use client'

import { PersonalContext } from '../types'

export class EmailService {
  private baseUrl: string
  private headers: HeadersInit

  constructor() {
    this.baseUrl = '/api/email'
    this.headers = {
      'Content-Type': 'application/json',
    }
  }

  async sendProfileEmail(toEmail: string, context: PersonalContext) {
    try {
      const response = await fetch(`${this.baseUrl}/send-profile`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          toEmail,
          context,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send email')
      }

      return await response.json()
    } catch (error) {
      console.error('Email service error:', error)
      throw new Error('Failed to send email')
    }
  }
}
