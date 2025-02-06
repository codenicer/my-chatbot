'use client'

import { MeetingDetails, CalendarEvent } from '../types'

export class CalendarService {
  async scheduleMeeting(details: {
    purpose: string
    date: string
    duration: number
    email: string
  }) {
    try {
      // Convert date string to ISO format
      const startTime = new Date(details.date)
      const endTime = new Date(startTime.getTime() + details.duration * 60000) // Convert minutes to milliseconds

      const event = {
        summary: details.purpose,
        description: `Meeting scheduled via AI Assistant`,
        start: {
          dateTime: startTime.toISOString(),
          timeZone: 'Asia/Manila', // You may want to make this dynamic
        },
        end: {
          dateTime: endTime.toISOString(),
          timeZone: 'Asia/Manila',
        },
        attendees: [{ email: details.email }],
      }

      // Call Google Calendar API to create event
      const response = await fetch('/api/calendar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      })

      if (!response.ok) {
        throw new Error('Failed to schedule meeting')
      }

      const result = await response.json()
      return {
        id: result.id,
        hangoutLink: result.hangoutLink,
        htmlLink: result.htmlLink,
      }
    } catch (error) {
      console.error('Calendar service error:', error)
      throw new Error('Failed to schedule meeting')
    }
  }
}
