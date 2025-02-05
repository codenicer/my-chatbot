'use client'

import * as React from 'react'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from './ui/dialog'
import { ChatMessageList } from './chat-message-list'
import { Input } from './ui/input'
import { Send, MessageCircle } from 'lucide-react'
import { useChatter } from '../providers/chat-provider'

export interface ChatWidgetProps {
  position?: 'bottom-right' | 'bottom-left'
}

export function ChatWidget({ position = 'bottom-right' }: ChatWidgetProps) {
  const { messages, isLoading, sendMessage } = useChatter()
  const [input, setInput] = React.useState('')
  const [isOpen, setIsOpen] = React.useState(false)

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
    <div className="fixed z-50" style={{
      [position.startsWith('bottom') ? 'bottom' : 'top']: '1rem',
      [position.endsWith('right') ? 'right' : 'left']: '1rem',
    }}>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button size="lg" className="rounded-full shadow-lg hover:shadow-xl transition-shadow">
            <MessageCircle className="w-5 h-5 mr-2" />
            Chat
          </Button>
        </DialogTrigger>
        <DialogContent 
          className="h-[600px] w-[400px] p-0 gap-0 bg-white dark:bg-gray-800 rounded-lg shadow-xl"
          style={{ 
            position: 'fixed',
            bottom: position.startsWith('bottom') ? '5rem' : 'auto',
            right: position.endsWith('right') ? '1rem' : 'auto',
            left: position.endsWith('left') ? '1rem' : 'auto',
            transform: 'none' // Override the default transform
          }}
        >
          <div className="flex flex-col h-full">
            <div className="p-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-t-lg">
              <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                Chat with AI Assistant
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-500 dark:text-gray-400">
                Ask me anything about your professional profile and career.
              </DialogDescription>
            </div>
            <ChatMessageList messages={messages} className="flex-1 overflow-y-auto px-4" />
            <div className="p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-b-lg">
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