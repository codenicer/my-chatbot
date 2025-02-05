'use client'

import * as React from 'react'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from './ui/dialog'
import { ChatMessageList } from './chat-message-list'
import { Input } from './ui/input'
import { Send, MessageCircle, Loader2 } from 'lucide-react'
import { useChatter } from '../providers/chat-provider'
import { cn } from '../lib/utils'
import { TypingIndicator } from './typing-indicator'
import { EmailSendingIndicator } from './email-sending-indicator'

export interface ChatWidgetProps {
  position?: 'bottom-right' | 'bottom-left'
}

export function ChatWidget({ position = 'bottom-right' }: ChatWidgetProps) {
  const { messages, isLoading, sendMessage, context } = useChatter()
  const [input, setInput] = React.useState('')
  const [isOpen, setIsOpen] = React.useState(false)


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
          className="h-[600px] w-[400px] p-0 gap-0 bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden"
          style={{ 
            position: 'fixed',
            bottom: position.startsWith('bottom') ? '5rem' : 'auto',
            right: position.endsWith('right') ? '1rem' : 'auto',
            left: position.endsWith('left') ? '1rem' : 'auto',
            transform: 'none'
          }}
        >
          <div className="flex flex-col h-full">
            <div className="shrink-0 p-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                Chat with {context?.assistant.name}
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-500 dark:text-gray-400">
                Hello! I'm {context?.assistant.name}, {context?.information.name}'s AI assistant. Feel free to ask me about their professional experience and qualifications.
              </DialogDescription>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              <ChatMessageList 
                messages={messages} 
                isLoading={isLoading}
                assistantName={context?.assistant.name}
              />
              {isLoading && (
                <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                  {messages[messages.length - 1]?.content?.includes('Preparing to send resume') ? (
                    <EmailSendingIndicator assistantName={context?.assistant.name || 'Assistant'} />
                  ) : (
                    <TypingIndicator assistantName={context?.assistant.name || 'Assistant'} />
                  )}
                </div>
              )}
            </div>

            <div className="shrink-0 p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
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
                  placeholder={isLoading ? "Please wait..." : "Type a message..."}
                  className="flex-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  disabled={isLoading}
                />
                <Button 
                  type="submit" 
                  size="icon" 
                  disabled={isLoading}
                  className={cn(
                    "text-white",
                    isLoading 
                      ? "bg-gray-400 cursor-not-allowed" 
                      : "bg-blue-500 hover:bg-blue-600"
                  )}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" aria-hidden="true" />
                  )}
                </Button>
              </form>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 