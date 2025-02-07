'use client'

import * as React from 'react'
import { Button } from './ui/button'
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
} from './ui/dialog'
import { ChatMessageList } from './chat-message-list'
import { Send, MessageCircle, Loader2 } from 'lucide-react'
import { useChatter } from '../providers/chat-provider'
import { cn } from '../lib/utils'
import { TypingIndicator } from './typing-indicator'
import { Label } from './ui/label'
import { Input } from './ui/input'
import { defaultTheme } from '@my-chatbot/core'
import { ChatTheme } from '@my-chatbot/core'
export interface ChatWidgetProps {
  position?: 'bottom-right' | 'bottom-left'
}

export function ChatWidget({
  position = 'bottom-right',
  assistantImageUrl,
  userImageUrl,
  theme = defaultTheme,
}: ChatWidgetProps & {
  assistantImageUrl?: string
  userImageUrl?: string
  theme?: ChatTheme
}) {
  const {
    messages,
    isLoading,
    isSendingEmail,
    sendMessage,
    context,
    showMeetingForm,
    setShowMeetingForm,
    handleMeetingSubmit,
  } = useChatter()
  const [input, setInput] = React.useState('')
  const [isOpen, setIsOpen] = React.useState(false)
  const messagesEndRef = React.useRef<HTMLDivElement>(null)

  // Auto scroll to bottom when new messages arrive
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const message = input.trim()
    setInput('') // Clear input immediately

    try {
      await sendMessage(message)
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
    <div
      className="fixed z-50"
      style={{
        [position.startsWith('bottom') ? 'bottom' : 'top']: '1rem',
        [position.endsWith('right') ? 'right' : 'left']: '1rem',
      }}
    >
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            size="lg"
            className="rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
            style={{
              backgroundColor: theme.accent.background,
              color: theme.accent.text,
            }}
          >
            <MessageCircle className="w-5 h-5 mr-2 animate-pulse" />
            Chat
          </Button>
        </DialogTrigger>
        <DialogContent
          className="h-[80vh] max-h-[800px] w-[400px] rounded-lg shadow-xl flex flex-col animate-in fade-in-0 zoom-in-95 duration-200"
          style={{
            position: 'fixed',
            bottom: position.startsWith('bottom') ? '5rem' : 'auto',
            right: position.endsWith('right') ? '1rem' : 'auto',
            left: position.endsWith('left') ? '1rem' : 'auto',
            transform: 'none',
            backgroundColor: theme.primary.background,
            color: theme.primary.text,
            borderColor: theme.neutral.border,
          }}
        >
          {/* Header with proper padding */}
          <div
            className="p-4 border-b transition-colors duration-200"
            style={{
              backgroundColor: theme.neutral.background,
              borderColor: theme.neutral.border,
            }}
          >
            <DialogTitle
              className="text-lg font-semibold mb-2"
              style={{ color: theme.primary.text }}
            >
              Chat with {context?.assistant.name}
            </DialogTitle>
            <DialogDescription
              className="text-sm leading-relaxed"
              style={{ color: theme.neutral.text }}
            >
              Hello! I'm {context?.assistant.name}, {context?.information.name}
              's AI assistant. Feel free to ask me anything, I can also send his
              resume to you or setup a meeting with him for you.
            </DialogDescription>
          </div>

          {/* Messages Container with proper padding */}
          <div className="flex-1 overflow-hidden relative">
            <div className="absolute inset-0 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
              <div className="space-y-6">
                <ChatMessageList
                  messages={messages.map((msg, i) => ({
                    ...msg,
                    className: `animate-in slide-in-from-bottom-${Math.min(i * 2, 5)} duration-300`,
                  }))}
                  assistantImageUrl={assistantImageUrl}
                  assistantName={context?.assistant.name}
                  userImageUrl={userImageUrl}
                  userName="You"
                />
                {isLoading && !isSendingEmail && (
                  <TypingIndicator
                    className="mt-4 animate-in fade-in-0 duration-200"
                    message={`${context?.assistant.name} is typing...`}
                  />
                )}
                {isSendingEmail && (
                  <TypingIndicator
                    className="mt-4 animate-in fade-in-0 duration-200"
                    message={`${context?.assistant.name} is sending email...`}
                  />
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Meeting Form Overlay */}
            {showMeetingForm && (
              <div className="absolute inset-0 bg-white dark:bg-gray-800 p-6">
                <div className="space-y-6 relative">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Schedule a Meeting with {context?.information.name}
                    </h2>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setShowMeetingForm(false)}
                      className="text-gray-600 hover:text-gray-800"
                    >
                      Back to Chat
                    </Button>
                  </div>

                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Please fill in the details below to set up your meeting.
                  </p>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      // Disabled for now
                    }}
                    className="space-y-5"
                  >
                    <div className="space-y-2">
                      <Label
                        htmlFor="purpose"
                        className="text-gray-700 dark:text-gray-300"
                      >
                        What's this meeting about?
                      </Label>
                      <Input
                        id="purpose"
                        placeholder="e.g. Initial Interview, Technical Discussion"
                        className="w-full"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="date"
                        className="text-gray-700 dark:text-gray-300"
                      >
                        When would you like to meet?
                      </Label>
                      <Input
                        id="date"
                        type="datetime-local"
                        className="w-full"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="duration"
                        className="text-gray-700 dark:text-gray-300"
                      >
                        How long do you need (minutes)?
                      </Label>
                      <Input
                        id="duration"
                        type="number"
                        min="1"
                        placeholder="Enter duration in minutes"
                        className="w-full"
                        defaultValue="30"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="email"
                        className="text-gray-700 dark:text-gray-300"
                      >
                        Your email address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@company.com"
                        className="w-full"
                        required
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        We'll send the meeting details to this email
                      </p>
                    </div>

                    <Button
                      type="submit"
                      disabled={true}
                      className="w-full bg-yellow-600 text-white cursor-not-allowed"
                    >
                      🚧 Calendar Integration Under Development
                    </Button>
                  </form>
                </div>
              </div>
            )}
          </div>

          {/* Input Container with proper padding */}
          <div
            className="p-4 border-t transition-colors duration-200"
            style={{
              backgroundColor: theme.neutral.background,
              borderColor: theme.neutral.border,
            }}
          >
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSend()
              }}
              className="flex gap-2"
            >
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isLoading ? 'Please wait...' : 'Type a message...'}
                className={cn(
                  'flex-1 min-h-[40px] max-h-[120px] p-2 rounded-md resize-none',
                  'transition-all duration-200',
                  'focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent',
                  'hover:border-accent-500',
                  'bg-white dark:bg-gray-800 text-gray-900 dark:text-white',
                  'border border-gray-300 dark:border-gray-600',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500',
                  'scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600'
                )}
                disabled={isLoading || showMeetingForm}
                rows={1}
                style={{
                  backgroundColor: theme.neutral.background,
                  color: theme.neutral.text,
                  borderColor: theme.neutral.border,
                }}
              />
              <Button
                type="submit"
                size="icon"
                className={cn(
                  'text-white self-end transition-all duration-200',
                  'hover:scale-105 active:scale-95',
                  isLoading || showMeetingForm
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'hover:-translate-y-0.5'
                )}
                style={{
                  backgroundColor: theme.accent.background,
                  color: theme.accent.text,
                }}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                )}
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
