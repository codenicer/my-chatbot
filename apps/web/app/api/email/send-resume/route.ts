import { NextResponse } from 'next/server'
import { sendResumeEmail } from '@my-chatbot/core'
import nodemailer from 'nodemailer'

// Configure email transport in the Next.js app
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const result = await sendResumeEmail({
      ...body,
      transporter,
      from: process.env.SMTP_FROM!,
    })

    return NextResponse.json({
      success: true,
      message: `Resume sent to ${body.toEmail}`,
      result,
    })
  } catch (error) {
    console.error('Email send error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to send email' },
      { status: 500 }
    )
  }
}
