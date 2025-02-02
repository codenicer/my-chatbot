import * as React from 'react'
import { cn } from '../../lib/utils'

export interface CardProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string
  title: string
}

export function Card({ href, title, className, children, ...props }: CardProps) {
  return (
    <a
      className={cn(
        'group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-neutral-700 hover:bg-neutral-800/30',
        className
      )}
      href={href}
      rel="noopener noreferrer"
      target="_blank"
      {...props}
    >
      <h2 className="mb-3 text-2xl font-semibold">
        {title}{' '}
        <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
          -&gt;
        </span>
      </h2>
      <p className="m-0 max-w-[30ch] text-sm opacity-50">{children}</p>
    </a>
  )
} 