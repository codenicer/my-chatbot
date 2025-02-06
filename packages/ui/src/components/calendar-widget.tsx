import * as React from 'react'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog'
import { useCalendarContext } from '../providers/calendar-provider'
import { MeetingDetails } from '@my-chatbot/core'
import { ScrollArea } from './ui/scroll-area'
import { MeetingDetailsForm } from './meeting-details-form'

export interface CalendarWidgetProps {
  position?: 'bottom-right' | 'bottom-left'
  defaultMeetingDetails?: Partial<MeetingDetails>
}

export function CalendarWidget({
  position = 'bottom-right',
  defaultMeetingDetails,
}: CalendarWidgetProps) {
  const {
    availableSlots,
    selectedSlot,
    isLoading,
    findAvailableSlots,
    scheduleMeeting,
    setSelectedSlot,


    
  } = useCalendarContext()

  const [meetingDetails, setMeetingDetails] = React.useState<MeetingDetails>({
    purpose: 'interview',
    duration: 30,
    datetime: '',
    attendees: [],
    ...defaultMeetingDetails,
  })

  const handleFindSlots = async () => {
    try {
      await findAvailableSlots(meetingDetails)
    } catch (error) {
      console.error('Failed to find slots:', error)
    }
  }

  const handleScheduleMeeting = async () => {
    if (!selectedSlot) return

    try {
      const result = await scheduleMeeting({
        ...meetingDetails,
        datetime: selectedSlot.start.toISOString(),
      })
      console.log('Meeting scheduled:', result)
    } catch (error) {
      console.error('Failed to schedule meeting:', error)
    }
  }

  return (
    <div className={`fixed ${position === 'bottom-right' ? 'right-4' : 'left-4'} bottom-4 z-50`}>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">Schedule Meeting</Button>
        </DialogTrigger>
        <DialogContent className="h-[600px] w-[400px]">
          <div className="flex flex-col gap-4 p-4">
            <MeetingDetailsForm
              details={meetingDetails}
              onUpdate={setMeetingDetails}
              onFindSlots={handleFindSlots}
              isLoading={isLoading}
            />
            {availableSlots.length > 0 && (
              <ScrollArea className="h-[400px]">
                {availableSlots.map((slot) => (
                  <Button
                    key={slot.start.toISOString()}
                    variant={selectedSlot === slot ? 'default' : 'outline'}
                    className="w-full mb-2"
                    onClick={() => setSelectedSlot(slot)}
                    disabled={isLoading}
                  >
                    {slot.start.toLocaleString()} - {slot.end.toLocaleString()}
                  </Button>
                ))}
              </ScrollArea>
            )}
            {selectedSlot && (
              <Button onClick={handleScheduleMeeting} disabled={isLoading}>
                Schedule Meeting
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 