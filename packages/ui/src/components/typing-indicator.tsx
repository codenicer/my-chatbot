import { cn } from '../lib/utils'

interface TypingIndicatorProps {
  className?: string
  message?: string
}

export function TypingIndicator({ className, message = "Typing..." }: TypingIndicatorProps) {
  return (
    <div className={cn(
      "flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400",
      className
    )}>
      <div className="flex items-center gap-1">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gray-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-gray-500"></span>
        </span>
      </div>
      <span>{message}</span>
    </div>
  )
} 