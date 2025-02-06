import { GoogleApis } from 'googleapis'
import { ApiResponse, createResponse } from './utils'

export interface CalendarConfig {
  serviceAccountEmail: string
  privateKey: string
  google: GoogleApis
}

export interface CalendarRequest {
  body: {
    details: {
      purpose: string
      datetime: string
      duration: number
      attendees: string[]
      description?: string
    }
  }
}

export function createCalendarHandler(config: CalendarConfig) {
  const auth = new config.google.auth.JWT({
    email: config.serviceAccountEmail,
    key: config.privateKey,
    scopes: ['https://www.googleapis.com/auth/calendar'],
  })

  const calendar = config.google.calendar({ version: 'v3', auth })

  async function POST(request: CalendarRequest): Promise<ApiResponse> {
    try {
      const { details } = request.body

      const startTime = new Date(details.datetime)
      const endTime = new Date(startTime.getTime() + details.duration * 60000)

      const event = {
        summary: details.purpose,
        description:
          details.description || `Meeting with ${details.attendees.join(', ')}`,
        start: { dateTime: startTime.toISOString() },
        end: { dateTime: endTime.toISOString() },
        attendees: details.attendees.map((email: string) => ({ email })),
        conferenceData: {
          createRequest: {
            requestId: `meeting-${Date.now()}`,
            conferenceSolutionKey: { type: 'hangoutsMeet' },
          },
        },
      }

      const response = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: event,
        conferenceDataVersion: 1,
      })

      return createResponse({
        data: response.data,
        status: 200,
      })
    } catch (error) {
      console.error('Calendar API error:', error)
      return createResponse({
        error: 'Failed to schedule meeting',
        status: 500,
      })
    }
  }

  return { POST }
}
