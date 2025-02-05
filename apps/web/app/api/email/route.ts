import { createEmailHandler } from '@my-chatbot/core'
import nodemailer from 'nodemailer'
import { NextRequest, NextResponse } from 'next/server'

const transport = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
})

const handler = createEmailHandler({
  from: process.env.EMAIL_USER!,
  transport,
})

export async function POST(request: NextRequest) {
  const result = await handler.POST(request)
  return NextResponse.json(result.json, { status: result.status })
}
