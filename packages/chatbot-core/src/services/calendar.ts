import { google } from 'googleapis'
import { JWT } from 'google-auth-library'

export interface ServiceAccountConfig {
  email: string
  privateKey: string
  scopes: string[]
}

export interface MeetingRequest {
  summary: string
  description: string
  startTime: Date
  duration: number // in minutes
  attendeeEmail: string
  timeZone?: string
}

export interface MeetingDetails {
  purpose: 'interview' | 'followup' | 'technical' | 'other'
  duration: number
  preferredDates: string[]
  preferredTimeRanges: Array<{ start: string; end: string }>
  attendees: string[]
  notes?: string
}

export class CalendarService {
  private auth: JWT

  constructor(config: ServiceAccountConfig) {
    this.auth = new google.auth.JWT({
      email: config.email,
      key: config.privateKey,
      scopes: ['https://www.googleapis.com/auth/calendar'],
    })
  }

  async checkSlotAvailability(
    startTime: Date,
    duration: number
  ): Promise<boolean> {
    const calendar = google.calendar({ version: 'v3', auth: this.auth })
    const endTime = new Date(startTime)
    endTime.setMinutes(endTime.getMinutes() + duration)

    try {
      const response = await calendar.freebusy.query({
        requestBody: {
          timeMin: startTime.toISOString(),
          timeMax: endTime.toISOString(),
          items: [{ id: 'primary' }],
        },
      })

      const busy = response.data.calendars?.primary?.busy || []
      return busy.length === 0
    } catch (error) {
      throw new Error('Failed to check availability')
    }
  }

  async suggestMeetingSlots(details: MeetingDetails) {
    const availableSlots: Array<{ start: Date; end: Date }> = []

    for (const date of details.preferredDates) {
      for (const range of details.preferredTimeRanges) {
        const slots = await this.getAvailableSlots(
          new Date(date),
          details.duration,
          range.start,
          range.end
        )
        availableSlots.push(...slots)
      }
    }

    return availableSlots
  }

  async scheduleMeeting(details: MeetingDetails) {
    const slots = await this.suggestMeetingSlots(details)
    if (slots.length === 0) {
      throw new Error('No available slots found')
    }

    // Use first available slot
    const slot = slots[0]
    if (!slot) {
      throw new Error('No available slots found')
    }
    const isAvailable = await this.checkSlotAvailability(
      slot.start,
      details.duration
    )
    if (!isAvailable) {
      throw new Error('Selected slot is no longer available')
    }

    const calendar = google.calendar({ version: 'v3', auth: this.auth })
    try {
      const event = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: {
          summary: `${details.purpose.toUpperCase()} Meeting`,
          description: details.notes,
          start: {
            dateTime: slot.start.toISOString(),
            timeZone: 'UTC',
          },
          end: {
            dateTime: slot.end.toISOString(),
            timeZone: 'UTC',
          },
          attendees: details.attendees.map((email) => ({ email })),
          conferenceData: {
            createRequest: {
              requestId: `${Date.now()}`,
              conferenceSolutionKey: { type: 'hangoutsMeet' },
            },
          },
        },
        conferenceDataVersion: 1,
      })

      return {
        id: event.data.id,
        meetLink: event.data.hangoutLink,
        startTime: event.data.start?.dateTime,
        endTime: event.data.end?.dateTime,
      }
    } catch (error) {
      throw new Error('Failed to schedule meeting')
    }
  }

  async getAvailableSlots(
    date: Date,
    duration: number,
    startHour: string,
    endHour: string
  ) {
    const calendar = google.calendar({ version: 'v3', auth: this.auth })
    const [startH, startM] = startHour.split(':').map(Number)
    const [endH, endM] = endHour.split(':').map(Number)

    if (!startH || !startM || !endH || !endM) {
      throw new Error('Invalid time format')
    }

    const startOfDay = new Date(date)
    startOfDay.setHours(startH, startM, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setHours(endH, endM, 0, 0)

    try {
      const response = await calendar.freebusy.query({
        requestBody: {
          timeMin: startOfDay.toISOString(),
          timeMax: endOfDay.toISOString(),
          items: [{ id: 'primary' }],
        },
      })

      const busy = response.data.calendars?.primary?.busy || []
      return this.findFreeSlots(
        startOfDay,
        endOfDay,
        busy.filter(
          (slot): slot is { start: string; end: string } =>
            typeof slot.start === 'string' && typeof slot.end === 'string'
        ),
        duration
      )
    } catch (error) {
      throw new Error('Failed to get available slots')
    }
  }

  private findFreeSlots(
    start: Date,
    end: Date,
    busy: Array<{ start: string; end: string }>,
    duration: number
  ) {
    const slots: Array<{ start: Date; end: Date }> = []
    let current = new Date(start)

    busy.forEach((busySlot) => {
      const busyStart = new Date(busySlot.start)
      const busyEnd = new Date(busySlot.end)

      while (current < busyStart) {
        const slotEnd = new Date(current)
        slotEnd.setMinutes(slotEnd.getMinutes() + duration)

        if (slotEnd <= busyStart) {
          slots.push({ start: new Date(current), end: slotEnd })
        }

        current.setMinutes(current.getMinutes() + duration)
      }

      current = new Date(busyEnd)
    })

    while (current < end) {
      const slotEnd = new Date(current)
      slotEnd.setMinutes(slotEnd.getMinutes() + duration)

      if (slotEnd <= end) {
        slots.push({ start: new Date(current), end: slotEnd })
      }

      current.setMinutes(current.getMinutes() + duration)
    }

    return slots
  }
}
