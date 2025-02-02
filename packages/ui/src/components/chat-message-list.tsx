import * as React from 'react'
import { ScrollArea } from './ui/scroll-area'
import { ChatMessage, type ChatMessageProps } from './chat-message'

export interface ChatMessageListProps {
  messages: ChatMessageProps[]
  className?: string
}

export function ChatMessageList({ messages, className }: ChatMessageListProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  return (
    <ScrollArea className={className}>
      <div ref={scrollRef} className="flex flex-col gap-4 p-4">
        {messages.map((message, index) => (
          <ChatMessage key={index} {...message} />
        ))}
      </div>
    </ScrollArea>
  )
} 