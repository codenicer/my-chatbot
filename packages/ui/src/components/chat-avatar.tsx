import * as React from 'react'
import { cn } from '../lib/utils'
import { User, Bot } from 'lucide-react'

interface ChatAvatarProps {
  role: 'user' | 'assistant'
  className?: string
  imageUrl?: string
  name?: string
}

export function ChatAvatar({ role, className, imageUrl, name }: ChatAvatarProps) {
  return (
    <div 
      className={cn(
        "relative flex h-8 w-8 shrink-0 overflow-hidden rounded-full",
        role === 'assistant' ? "bg-blue-100 dark:bg-blue-900" : "bg-gray-100 dark:bg-gray-800",
        className
      )}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={`${name || role} avatar`}
          className="aspect-square h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          {role === 'assistant' ? (
            <Bot className="h-5 w-5 text-blue-500 dark:text-blue-400" />
          ) : (
            <User className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          )}
        </div>
      )}
    </div>
  )
} 