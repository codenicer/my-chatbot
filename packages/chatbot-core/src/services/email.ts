'use client'

import { PersonalContext } from '../types'

export class EmailService {
  private baseUrl: string
  private headers: Record<string, string>

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

  async sendResume(recipientEmail: string, context: PersonalContext) {
    console.log('sendResume', recipientEmail, context)
    try {
      const response = await fetch(`${this.baseUrl}/send-resume`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          toEmail: recipientEmail,
          subject: `${context.information.name}'s Resume - ${context.professional.currentRole}`,
          context,
          template: {
            name: 'resume',
            data: {
              recruiterEmail: recipientEmail,
              candidateName: context.information.name,
              role: context.professional.currentRole,
              company: context.professional.company,
              resumeUrl: context.information.resumeUrl,
            },
          },
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send email')
      }

      return await response.json()
    } catch (error) {
      console.error('Email service error:', error)
      throw error
    }
  }
}
