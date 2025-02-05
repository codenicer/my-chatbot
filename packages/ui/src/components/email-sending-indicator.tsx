import { cn } from '../lib/utils'

interface EmailSendingIndicatorProps {
  className?: string
  assistantName: string
}

export function EmailSendingIndicator({ className, assistantName }: EmailSendingIndicatorProps) {
  return (
    <div className={cn(
      "flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400",
      className
    )}>
      <div className="flex items-center gap-1">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
        </span>
      </div>
      <span>{assistantName} is preparing your email...</span>
    </div>
  )
} 