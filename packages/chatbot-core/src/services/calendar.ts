'use client'

export interface MeetingDetails {
  purpose: 'interview' | 'followup' | 'technical' | 'other'
  duration: number
  preferredDates: string[]
  preferredTimeRanges: Array<{ start: string; end: string }>
  attendees: string[]
  notes?: string
}

export class CalendarService {
  private baseUrl: string
  private headers: HeadersInit

  constructor() {
    this.baseUrl = '/api/calendar'
    this.headers = {
      'Content-Type': 'application/json',
    }
  }

  async checkSlotAvailability(
    startTime: Date,
    duration: number
  ): Promise<boolean> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          action: 'check',
          startTime: startTime.toISOString(),
          duration,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to check availability')
      }

      const data = await response.json()
      return data.available
    } catch (error) {
      console.error('Calendar availability check error:', error)
      throw new Error('Failed to check availability')
    }
  }

  async suggestMeetingSlots(details: MeetingDetails) {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          action: 'suggest',
          duration: details.duration,
          preferredDates: details.preferredDates,
          preferredTimeRanges: details.preferredTimeRanges,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get available slots')
      }

      const data = await response.json()
      return data.slots.map((slot: any) => ({
        start: slot.start as string,
        end: slot.end as string,
      }))
    } catch (error) {
      console.error('Calendar slot suggestion error:', error)
      throw new Error('Failed to get available slots')
    }
  }

  async scheduleMeeting(details: MeetingDetails) {
    try {
      const startTime = new Date(details.preferredDates[0])
      const endTime = new Date(startTime.getTime() + details.duration * 60000)

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          action: 'create',
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          summary: `${details.purpose.toUpperCase()} Meeting`,
          description: details.notes,
          attendees: details.attendees,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to schedule meeting')
      }

      const data = await response.json()
      return {
        id: data.id as string,
        meetLink: data.meetLink as string,
        startTime: data.startTime as string,
        endTime: data.endTime as string,
      }
    } catch (error) {
      console.error('Calendar scheduling error:', error)
      throw new Error('Failed to schedule meeting')
    }
  }
}
