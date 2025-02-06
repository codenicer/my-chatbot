import * as React from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import { MeetingDetails } from '@my-chatbot/core'

interface MeetingDetailsFormProps {
  details: MeetingDetails
  onUpdate: (details: MeetingDetails) => void
  onFindSlots: () => void
  isLoading?: boolean
}

export function MeetingDetailsForm({
  details,
  onUpdate,
  onFindSlots,
  isLoading,
}: MeetingDetailsFormProps) {
  const handleChange = (field: keyof MeetingDetails, value: any) => {
    onUpdate({
      ...details,
      [field]: value,
    })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="purpose">Meeting Purpose</Label>
        <Select
          value={details.purpose}
          onValueChange={(value: string) => handleChange('purpose', value)}
          disabled={isLoading}
        >
          <SelectTrigger id="purpose">
            <SelectValue placeholder="Select purpose" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="interview">Interview</SelectItem>
            <SelectItem value="followup">Follow-up</SelectItem>
            <SelectItem value="technical">Technical Discussion</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="duration">Duration (minutes)</Label>
        <Input
          id="duration"
          type="number"
          value={details.duration}
          onChange={(e) => handleChange('duration', parseInt(e.target.value))}
          min={15}
          step={15}
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="attendees">Attendees (comma-separated)</Label>
        <Input
          id="attendees"
          value={details.email}
          onChange={(e) => handleChange('email', e.target.value)}
          placeholder="email@example.com"
          disabled={isLoading}
        />
      </div>

      <Button onClick={onFindSlots} className="w-full" disabled={isLoading}>
        Find Available Slots
      </Button>
    </div>
  )
}
