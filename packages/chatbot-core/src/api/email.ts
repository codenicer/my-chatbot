import { ApiResponse, createResponse } from './utils'
import type { PersonalContext } from '../types'

export interface EmailConfig {
  from: string
  transport: {
    sendMail(options: {
      from: string
      to: string
      subject: string
      text: string
      attachments: Array<{ filename: string; content: string }>
    }): Promise<any>
  }
}

export interface EmailRequest {
  json(): Promise<{
    toEmail: string
    context: PersonalContext
  }>
}

export function createEmailHandler(config: EmailConfig) {
  function generateCSV(context: PersonalContext): string {
    const rows = [
      ['Name', `${context.information.name} ${context.information.lastName}`],
      ['Current Role', context.professional.currentRole],
      ['Company', context.professional.company],
      ['Experience', `${context.professional.experience} years`],
      [
        'Skills',
        context.professional.skills
          .map((s) => `${s.name} (${s.experience} years)`)
          .join(', '),
      ],
    ]
    return rows.map((row) => row.join(',')).join('\n')
  }

  async function POST(request: EmailRequest): Promise<ApiResponse> {
    try {
      const { toEmail, context } = await request.json()
      const csvContent = generateCSV(context)

      await config.transport.sendMail({
        from: config.from,
        to: toEmail,
        subject: `Professional Profile - ${context.information.name}`,
        text: 'Please find attached the professional profile.',
        attachments: [
          {
            filename: 'profile.csv',
            content: csvContent,
          },
        ],
      })

      return createResponse({ success: true })
    } catch (error) {
      console.error('Email API error:', error)
      return createResponse({ error: 'Failed to send email' }, 500)
    }
  }

  return { POST }
}
