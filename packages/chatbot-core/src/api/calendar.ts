import { calendar_v3 } from 'googleapis'

export interface CalendarHandlerDeps {
  calendar: calendar_v3.Calendar
  auth: any
}

export class CalendarHandler {
  private calendar: calendar_v3.Calendar
  private auth: any

  constructor({ calendar, auth }: CalendarHandlerDeps) {
    this.calendar = calendar
    this.auth = auth
  }

  async createEvent(body: {
    summary: string
    description: string
    start: { dateTime: string; timeZone: string }
    end: { dateTime: string; timeZone: string }
    attendees: { email: string }[]
  }) {
    try {
      const event = await this.calendar.events.insert({
        auth: this.auth,
        calendarId: 'primary',
        requestBody: {
          ...body,
          conferenceData: {
            createRequest: {
              requestId: Math.random().toString(36).substring(7),
              conferenceSolutionKey: { type: 'hangoutsMeet' },
            },
          },
        },
        conferenceDataVersion: 1,
      })

      return {
        data: event.data,
        status: 200,
      }
    } catch (error) {
      console.error('Calendar API error:', error)
      return {
        error: 'Failed to schedule meeting',
        status: 500,
      }
    }
  }
}
