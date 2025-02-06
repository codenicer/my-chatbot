import { createEmailHandler } from '@my-chatbot/core'
import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

const handler = createEmailHandler({
  nodemailer,
  configs: {
    host: process.env.SMTP_HOST!,
    port: Number(process.env.SMTP_PORT),
    user: process.env.SMTP_USER!,
    pass: process.env.SMTP_PASS!,
    from: process.env.SMTP_FROM!,
  },
})

export async function POST(request: Request) {
  try {
    const body = await request.json()

    console.log('body', body)
    const result = await handler.POST({ body })
    console.log('email result', result)
    return NextResponse.json(result.json, { status: result.status || 500 })
  } catch (error) {
    console.error('Email route error:', error)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}
