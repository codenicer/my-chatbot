'use client'

import { MeetingDetails, CalendarEvent } from '../types'

export class CalendarService {
  async scheduleMeeting(details: MeetingDetails): Promise<CalendarEvent> {
    try {
      const response = await fetch('/api/calendar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ details }),
      })

      if (!response.ok) {
        throw new Error('Failed to schedule meeting')
      }

      const data = await response.json()
      return {
        id: data.id,
        summary: data.summary,
        description: data.description,
        start: { dateTime: data.start?.dateTime },
        end: { dateTime: data.end?.dateTime },
        attendees: data.attendees?.map((a: any) => ({ email: a.email })),
        hangoutLink: data.hangoutLink,
      }
    } catch (error) {
      console.error('Failed to schedule meeting:', error)
      throw new Error('Failed to schedule meeting')
    }
  }
}
