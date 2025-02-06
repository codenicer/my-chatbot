import * as React from 'react'
import { cn } from '../lib/utils'
import { ChatAvatar } from './chat-avatar'

export interface ChatMessageListProps {
  messages: Array<{
    id: string
    role: 'assistant' | 'user'
    content: string
  }>
  className?: string
  assistantImageUrl?: string
  assistantName?: string
  userImageUrl?: string
  userName?: string
}

export function ChatMessageList({ 
  messages, 
  className,
  assistantImageUrl,
  assistantName = "Assistant",
  userImageUrl,
  userName = "User"
}: ChatMessageListProps) {
  const messagesEndRef = React.useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  React.useEffect(() => {
    scrollToBottom()
  }, [messages])

  return (
    <div className={cn("flex flex-col space-y-4", className)}>
      {messages.map((message) => (
        <div
          key={message.id}
          className={cn(
            "flex w-full items-start gap-3",
            message.role === "assistant" ? "justify-start" : "flex-row-reverse"
          )}
        >
          <ChatAvatar 
            role={message.role}
            imageUrl={message.role === 'assistant' ? assistantImageUrl : userImageUrl}
            name={message.role === 'assistant' ? assistantName : userName}
          />
          <div
            className={cn(
              "max-w-[80%] rounded-lg px-4 py-2",
              message.role === "assistant" 
                ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-tl-none"
                : "bg-blue-500 dark:bg-blue-600 text-white rounded-tr-none"
            )}
          >
            <p className="whitespace-pre-wrap break-words text-sm">
              {message.content}
            </p>
          </div>
        </div>
      ))}
     
      <div ref={messagesEndRef} />
    </div>
  )
} 