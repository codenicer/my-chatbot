import * as React from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { cn } from '../lib/utils'

interface MeetingFormOverlayProps {
  onSubmit: (details: {
    purpose: string
    date: string
    duration: number
    email: string
  }) => void
  onCancel: () => void
  isLoading?: boolean
}

export function MeetingFormOverlay({
  onSubmit,
  onCancel,
  isLoading,
}: MeetingFormOverlayProps) {
  const [formData, setFormData] = React.useState({
    purpose: '',
    date: '',
    duration: 30,
    email: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-[400px]">
        <h2 className="text-lg font-semibold mb-4">Schedule Meeting</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="purpose">Purpose</Label>
            <Input
              id="purpose"
              value={formData.purpose}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, purpose: e.target.value }))
              }
              placeholder="e.g. Initial Interview"
              required
            />
          </div>
          <div>
            <Label htmlFor="date">Date & Time</Label>
            <Input
              id="date"
              type="datetime-local"
              value={formData.date}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, date: e.target.value }))
              }
              required
            />
          </div>
          <div>
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Input
              id="duration"
              type="number"
              min="15"
              step="15"
              value={formData.duration}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  duration: parseInt(e.target.value),
                }))
              }
              required
            />
          </div>
          <div>
            <Label htmlFor="email">Your Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              required
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              Schedule Meeting
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
