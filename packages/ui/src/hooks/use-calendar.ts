import { useCallback } from 'react'
import { useCalendarStore } from '../store/calendar-store'
import { CalendarService, MeetingDetails } from '@my-chatbot/core'

export function useCalendar(calendarService: CalendarService) {
  const {
    availableSlots,
    selectedSlot,
    meetingDetails,
    isLoading,
    setAvailableSlots,
    setSelectedSlot,
    setMeetingDetails,
    setLoading,
    setError,
  } = useCalendarStore()

  const findAvailableSlots = useCallback(
    async (details: MeetingDetails) => {
      try {
        setLoading(true)
        const slots = await calendarService.suggestMeetingSlots(details)
        setAvailableSlots(slots)
        setMeetingDetails(details)
      } catch (error) {
        setError(
          error instanceof Error ? error.message : 'Failed to find slots'
        )
      } finally {
        setLoading(false)
      }
    },
    [
      calendarService,
      setAvailableSlots,
      setMeetingDetails,
      setLoading,
      setError,
    ]
  )

  const scheduleMeeting = useCallback(
    async (details: MeetingDetails) => {
      try {
        setLoading(true)
        const result = await calendarService.scheduleMeeting(details)

        return result
      } catch (error) {
        setError(
          error instanceof Error ? error.message : 'Failed to schedule meeting'
        )
        throw error
      } finally {
        setLoading(false)
      }
    },
    [calendarService, setLoading, setError]
  )

  return {
    availableSlots,
    selectedSlot,
    meetingDetails,
    isLoading,
    findAvailableSlots,
    scheduleMeeting,
    setSelectedSlot,
  }
}
