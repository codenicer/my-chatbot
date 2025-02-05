import { google } from 'googleapis'
import { createCalendarHandler } from '@my-chatbot/core'
import { NextRequest, NextResponse } from 'next/server'

const calendar = google.calendar({
  version: 'v3',
  auth: new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/calendar'],
  }),
})

const handler = createCalendarHandler({ calendar })

export async function POST(request: NextRequest) {
  const result = await handler.POST(request)
  return NextResponse.json(result.json, { status: result.status })
}
