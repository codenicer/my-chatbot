import * as React from 'react'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog'
import { ChatMessageList } from './chat-message-list'
import { Input } from './ui/input'
import { Send } from 'lucide-react'
import { useChatter } from '../providers/chat-provider'

export interface ChatWidgetProps {
  position?: 'bottom-right' | 'bottom-left'
}

export function ChatWidget({ position = 'bottom-right' }: ChatWidgetProps) {
  const { messages, isLoading, sendMessage } = useChatter()
  const [input, setInput] = React.useState('')

  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
  }

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    try {
      await sendMessage(input)
      setInput('')
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className={`fixed ${positionClasses[position]} z-50`}>
      <Dialog>
        <DialogTrigger asChild>
          <Button size="lg" className="rounded-full">
            Chat
          </Button>
        </DialogTrigger>
        <DialogContent className="h-[600px] w-[400px] p-0 gap-0">
          <div className="flex flex-col h-full">
            <ChatMessageList messages={messages} className="flex-1" />
            <div className="p-4 border-t">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSend()
                }}
                className="flex gap-2"
              >
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message..."
                  className="flex-1"
                  disabled={isLoading}
                />
                <Button type="submit" size="icon" disabled={isLoading}>
                  <Send className="h-4 w-4" aria-hidden="true" />
                </Button>
              </form>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 