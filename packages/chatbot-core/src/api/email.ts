import { ApiResponse, createResponse } from './utils'
import { PersonalContext } from '../types'
import type { Transporter } from 'nodemailer'

export interface EmailConfig {
  nodemailer: {
    createTransport: (config: any) => Transporter
  }
  configs: {
    host: string
    port: number
    user: string
    pass: string
    from: string
  }
}

export interface EmailRequest {
  body: {
    toEmail: string
    context: PersonalContext
  }
}

export function createEmailHandler(config: EmailConfig) {
  console.log('core:createEmailHandler', {
    host: config.configs.host,
    port: config.configs.port,
    secure: config.configs.port === 465,
    auth: {
      user: config.configs.user,
      pass: config.configs.pass,
    },
  })
  const transporter = config.nodemailer.createTransport({
    host: config.configs.host,
    port: config.configs.port,
    secure: config.configs.port === 465,
    auth: {
      user: config.configs.user,
      pass: config.configs.pass,
    },
  })

  async function POST(request: EmailRequest): Promise<ApiResponse> {
    try {
      const { toEmail, context } = request.body

      if (!toEmail?.trim()) {
        return createResponse({
          error: 'Email address is required',
          status: 400,
        })
      }

      const mailOptions = {
        from: config.configs.from,
        to: toEmail.trim(),
        subject: `${context.information.name}'s Resume`,
        text: `Hello,\n\nThank you for your interest in ${context.information.name}'s profile. Please find their resume attached.\n\nBest regards,\n${context.assistant.name}`,
        html: `
          <p>Hello,</p>
          <p>Thank you for your interest in ${context.information.name}'s profile. Please find their resume attached.</p>
          <p>Best regards,<br>${context.assistant.name}</p>
        `,
        attachments: [
          {
            filename: `${context.information.name}-Resume.pdf`,
            path: context.information.resumeUrl,
          },
        ],
      }

      const info = await transporter.sendMail(mailOptions)

      return createResponse({
        data: { messageId: info.messageId },
        status: 200,
      })
    } catch (error) {
      console.error('Email error:', error)
      return createResponse({
        error: 'Failed to send email',
        status: 500,
      })
    }
  }

  return { POST }
}
