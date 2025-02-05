import { ApiResponse, createResponse } from './utils'
import type { calendar_v3 } from 'googleapis'

export interface CalendarConfig {
  calendar: calendar_v3.Calendar
}

export interface CalendarRequest {
  json(): Promise<{
    action: 'create' | 'check' | 'suggest'
    startTime: string
    endTime?: string
    duration?: number
    summary?: string
    description?: string
    attendees?: string[]
    preferredDates?: string[]
    preferredTimeRanges?: Array<{ start: string; end: string }>
  }>
}

export function createCalendarHandler(config: CalendarConfig) {
  async function findFreeSlots(
    start: Date,
    end: Date,
    busy: Array<{ start: string; end: string }>,
    duration: number
  ) {
    const slots: Array<{ start: string; end: string }> = []
    let current = new Date(start)

    busy.forEach((busySlot) => {
      const busyStart = new Date(busySlot.start)
      const busyEnd = new Date(busySlot.end)

      while (current < busyStart) {
        const slotEnd = new Date(current.getTime() + duration * 60000)
        if (slotEnd <= busyStart) {
          slots.push({
            start: current.toISOString(),
            end: slotEnd.toISOString(),
          })
        }
        current = new Date(current.getTime() + duration * 60000)
      }
      current = new Date(busyEnd)
    })

    while (current < end) {
      const slotEnd = new Date(current.getTime() + duration * 60000)
      if (slotEnd <= end) {
        slots.push({
          start: current.toISOString(),
          end: slotEnd.toISOString(),
        })
      }
      current = new Date(current.getTime() + duration * 60000)
    }

    return slots
  }

  async function POST(request: CalendarRequest): Promise<ApiResponse> {
    try {
      const data = await request.json()

      switch (data.action) {
        case 'check': {
          const endTime = new Date(
            new Date(data.startTime).getTime() + (data.duration || 30) * 60000
          )

          const response = await config.calendar.freebusy.query({
            requestBody: {
              timeMin: data.startTime,
              timeMax: endTime.toISOString(),
              items: [{ id: 'primary' }],
            },
          })

          const busy = response.data.calendars?.primary?.busy || []
          return createResponse({ available: busy.length === 0 })
        }

        case 'suggest': {
          if (
            !data.preferredDates ||
            !data.preferredTimeRanges ||
            !data.duration
          ) {
            return createResponse(
              { error: 'Missing required fields for slot suggestion' },
              400
            )
          }

          const availableSlots: Array<{ start: string; end: string }> = []

          for (const date of data.preferredDates) {
            for (const range of data.preferredTimeRanges) {
              const [startH, startM] = range.start.split(':').map(Number)
              const [endH, endM] = range.end.split(':').map(Number)

              const startTime = new Date(date)
              startTime.setHours(startH, startM, 0, 0)
              const endTime = new Date(date)
              endTime.setHours(endH, endM, 0, 0)

              const response = await config.calendar.freebusy.query({
                requestBody: {
                  timeMin: startTime.toISOString(),
                  timeMax: endTime.toISOString(),
                  items: [{ id: 'primary' }],
                },
              })

              const busy = response.data.calendars?.primary?.busy || []
              const slots = await findFreeSlots(
                startTime,
                endTime,
                busy.map((b) => ({ start: b.start!, end: b.end! })),
                data.duration
              )
              availableSlots.push(...slots)
            }
          }

          return createResponse({ slots: availableSlots })
        }

        case 'create': {
          if (!data.endTime || !data.summary) {
            return createResponse(
              { error: 'Missing required fields for event creation' },
              400
            )
          }

          const event = await config.calendar.events.insert({
            calendarId: 'primary',
            requestBody: {
              summary: data.summary,
              description: data.description,
              start: { dateTime: data.startTime, timeZone: 'UTC' },
              end: { dateTime: data.endTime, timeZone: 'UTC' },
              attendees: data.attendees?.map((email) => ({ email })),
              conferenceData: {
                createRequest: {
                  requestId: Date.now().toString(),
                  conferenceSolutionKey: { type: 'hangoutsMeet' },
                },
              },
            },
            conferenceDataVersion: 1,
          })

          return createResponse({
            id: event.data.id,
            meetLink: event.data.hangoutLink,
            startTime: event.data.start?.dateTime,
            endTime: event.data.end?.dateTime,
          })
        }

        default:
          return createResponse({ error: 'Invalid action' }, 400)
      }
    } catch (error) {
      console.error('Calendar API error:', error)
      return createResponse({ error: 'Calendar operation failed' }, 500)
    }
  }

  return { POST }
}
