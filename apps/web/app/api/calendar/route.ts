import { google } from 'googleapis'
import { NextResponse } from 'next/server'
import { CalendarHandler } from '@my-chatbot/core'

const calendar = google.calendar('v3')

const auth = new google.auth.JWT({
  email: process.env.NEXT_PUBLIC_CALENDAR_EMAIL,
  key: process.env.NEXT_PUBLIC_CALENDAR_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  scopes: ['https://www.googleapis.com/auth/calendar'],
})

const calendarHandler = new CalendarHandler({ calendar, auth })

export async function POST(request: Request) {
  const body = await request.json()
  const result = await calendarHandler.createEvent(body)

  if (result.status === 200) {
    return NextResponse.json(result.data)
  }

  return NextResponse.json({ error: result.error }, { status: result.status })
}
