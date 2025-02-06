import { google } from 'googleapis'
import { createCalendarHandler } from '@my-chatbot/core'
import { NextResponse } from 'next/server'

const handler = createCalendarHandler({
  serviceAccountEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
  privateKey: process.env.GOOGLE_PRIVATE_KEY!,
  google: google,
})

export async function POST(request: Request) {
  const body = await request.json()
  const result = await handler.POST({ body })
  return NextResponse.json(result.json, { status: result.status })
}
