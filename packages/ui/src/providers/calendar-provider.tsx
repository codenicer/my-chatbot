import * as React from 'react'
import { CalendarService, MeetingDetails } from '@my-chatbot/core'
import { useCalendar } from '../hooks/use-calendar'

interface CalendarContextValue {
  availableSlots: Array<{ start: Date; end: Date }>
  selectedSlot: { start: Date; end: Date } | null
  meetingDetails: MeetingDetails | null
  isLoading: boolean
  findAvailableSlots: (details: MeetingDetails) => Promise<void>
  scheduleMeeting: (details: MeetingDetails) => Promise<{
    id: string
    meetLink: string | undefined
    startTime: string | undefined
    endTime: string | undefined
  }>
  setSelectedSlot: (slot: { start: Date; end: Date } | null) => void
}

export const CalendarContext = React.createContext<CalendarContextValue | null>(null)

interface CalendarProviderProps {
  children: React.ReactNode
  calendarService: CalendarService
}

export function CalendarProvider({ children, calendarService }: CalendarProviderProps) {
  const calendar = useCalendar(calendarService)

  const value = React.useMemo(
    () => ({
      ...calendar,
      scheduleMeeting: async (details: MeetingDetails) => {
        const result = await calendar.scheduleMeeting(details)

        if (!result?.id || !result?.meetLink || !result?.startTime || !result?.endTime) {
          throw new Error('Failed to schedule meeting')
        }

        return {
          id: result.id,
          meetLink: result.meetLink,
          startTime: result.startTime,
          endTime: result.endTime
        }
      },
    }),
    [calendar]
  )

  return <CalendarContext.Provider value={value}>{children}</CalendarContext.Provider>
}

export function useCalendarContext() {
  const context = React.useContext(CalendarContext)
  if (!context) {
    throw new Error('useCalendarContext must be used within a CalendarProvider')
  }
  return context
} 