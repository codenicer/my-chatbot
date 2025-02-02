import * as React from 'react'
import { cn } from '../lib/utils'

export interface ChatMessageProps {
  content: string
  role: 'user' | 'assistant'
  timestamp?: number
  className?: string
}

export function ChatMessage({ content, role, timestamp, className }: ChatMessageProps) {
  const isUser = role === 'user'
  
  return (
    <div
      className={cn(
        'flex w-full',
        isUser ? 'justify-end' : 'justify-start',
        className
      )}
    >
      <div
        className={cn(
          'rounded-lg px-4 py-2 max-w-[80%]',
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-muted-foreground'
        )}
      >
        <p className="text-sm whitespace-pre-wrap break-words">{content}</p>
        {timestamp && (
          <time className="text-xs opacity-50 mt-1 block">
            {new Date(timestamp).toLocaleTimeString()}
          </time>
        )}
      </div>
    </div>
  )
} 