import type { Transporter } from 'nodemailer'
import { PersonalContext } from '../types'

export interface SendResumeEmailParams {
  toEmail: string
  subject: string
  context: PersonalContext
  transporter: Transporter
  from: string
}

export async function sendResumeEmail(params: SendResumeEmailParams) {
  try {
    const { toEmail, subject, context, transporter, from } = params

    // Download the resume PDF
    const resumeResponse = await fetch(context.information.resumeUrl)
    if (!resumeResponse.ok) {
      throw new Error('Failed to download resume')
    }
    const resumeBuffer = await resumeResponse.arrayBuffer()

    // Create email content
    const htmlContent = `
      <h2>Hello,</h2>
      <p>Thank you for your interest in ${context.information.name}'s profile.</p>
      <p>Please find attached their resume for the ${context.professional.currentRole} position.</p>
      <br/>
      <p><strong>Current Role:</strong> ${context.professional.currentRole} at ${context.professional.company}</p>
      <p><strong>Experience:</strong> ${context.professional.experience} years</p>
      <p><strong>Key Skills:</strong> ${context.professional.skills.map((s) => s.name).join(', ')}</p>
      <br/>
      <p>Best regards,</p>
      <p>${context.assistant.name}</p>
      <p>${context.information.name}'s AI Assistant</p>
    `

    // Send email with attachment
    await transporter.sendMail({
      from,
      to: toEmail,
      subject,
      html: htmlContent,
      attachments: [
        {
          filename: `${context.information.name.toLowerCase()}_resume.pdf`,
          content: Buffer.from(resumeBuffer),
          contentType: 'application/pdf',
        },
      ],
    })

    return { success: true }
  } catch (error) {
    console.error('Email send error:', error)
    throw error
  }
}
