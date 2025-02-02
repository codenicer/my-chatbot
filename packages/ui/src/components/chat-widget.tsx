import * as React from 'react'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog'
import { ChatMessageList } from './chat-message-list'
import { Input } from './ui/input'
import { Send } from 'lucide-react'

export interface ChatWidgetProps {
  position?: 'bottom-right' | 'bottom-left'
  onSendMessage?: (message: string) => void
}

export function ChatWidget({ position = 'bottom-right', onSendMessage }: ChatWidgetProps) {
  const [messages, setMessages] = React.useState<Array<{
    role: 'assistant' | 'user'
    content: string
    timestamp: number
  }>>([
    {
      role: 'assistant',
      content: 'Hello! How can I help you today?',
      timestamp: Date.now(),
    },
  ])
  const [input, setInput] = React.useState('')

  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
  }

  const handleSend = () => {
    if (!input.trim()) return

    const newMessage = {
      role: 'user' as const,
      content: input,
      timestamp: Date.now(),
    }

    setMessages((prev) => [...prev, newMessage])
    setInput('')
    onSendMessage?.(input)
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
            <ChatMessageList
              messages={messages}
              className="flex-1"
            />
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
                />
                <Button type="submit" size="icon">
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 