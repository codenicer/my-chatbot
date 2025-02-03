import { create } from 'zustand'
import { MeetingDetails } from '@my-chatbot/core'

interface CalendarState {
  availableSlots: Array<{ start: Date; end: Date }>
  selectedSlot: { start: Date; end: Date } | null
  meetingDetails: MeetingDetails | null
  isLoading: boolean
  error: string | null
  setAvailableSlots: (slots: Array<{ start: Date; end: Date }>) => void
  setSelectedSlot: (slot: { start: Date; end: Date } | null) => void
  setMeetingDetails: (details: MeetingDetails | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}

export const useCalendarStore = create<CalendarState>((set) => ({
  availableSlots: [],
  selectedSlot: null,
  meetingDetails: null,
  isLoading: false,
  error: null,
  setAvailableSlots: (slots) => set({ availableSlots: slots }),
  setSelectedSlot: (slot) => set({ selectedSlot: slot }),
  setMeetingDetails: (details) => set({ meetingDetails: details }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  reset: () =>
    set({
      availableSlots: [],
      selectedSlot: null,
      meetingDetails: null,
      error: null,
    }),
}))
