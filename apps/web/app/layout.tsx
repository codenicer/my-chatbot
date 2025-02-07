import './globals.css'
import '@my-chatbot/ui/src/styles.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { EnvLogger } from './env-logger'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Create Turborepo',
  description: 'Generated by create turbo',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-white dark:bg-gray-900`}>
        {/* <EnvLogger /> */}
        {children}
      </body>
    </html>
  )
}
