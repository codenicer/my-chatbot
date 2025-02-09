# AI Chat Assistant Widget

A customizable AI chat widget for Next.js portfolio websites. Built with TypeScript, Tailwind CSS, and OpenAI/Gemini.

![Chat Widget Demo](demo.gif)

## Published Packages

- [@my-chatbot/ui](https://www.npmjs.com/package/@my-chatbot/ui)
- [@my-chatbot/core](https://www.npmjs.com/package/@my-chatbot/core)

## Features

- 🎨 Fully customizable theming
- 💬 OpenAI-powered chat
- 📧 Resume sharing capability
- 📅 Meeting scheduling (coming soon)
- ⚡ Built with performance in mind
- 🎯 TypeScript & Tailwind CSS

## Quick Start

### 1. Installation

```bash
# For Next.js >= 15
npm install @my-chatbot/ui @my-chatbot/core @upstash/redis

# For Next.js < 15, use legacy peer deps
npm install @my-chatbot/ui @my-chatbot/core @upstash/redis --legacy-peer-deps
```

### 2. Required Dependencies

Add these to your project's dependencies:

```json
{
  "dependencies": {
    "@my-chatbot/core": "0.1.5",
    "@my-chatbot/ui": "1.0.1",
    "@upstash/redis": "^1.28.4",
    "next": "^15.1.6",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  }
}
```

### 3. Add to Layout And Tailwind Config

Sample tailwind config:

```ts
import type { Config } from 'tailwindcss'
import sharedConfig from '@my-chatbot/ui/tailwind.config'

const config: Config = {
  content: ['./node_modules/@my-chatbot/ui/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
      },
    },
  },
  presets: [sharedConfig],
} satisfies Config

export default config
```

In your `app/layout.tsx`:

```tsx
import '@my-chatbot/ui/dist/index.css' // Add this import
import { RootProvider, ChatWidget } from '@my-chatbot/ui'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <RootProvider
          personalContext={{
            assistant: {
              name: 'Your Assistant Name',
            },
            professional: {
              currentRole: 'Your Role',
              company: 'Your Company',
              skills: [
                { name: 'Skill 1', experience: 5 },
                { name: 'Skill 2', experience: 3 },
              ],
              experience: 5,
              currentRoutine: '9-5',
              jobSearchStatus: 'active',
            },
            information: {
              name: 'Your Name',
              lastName: 'Your Last Name',
              email: 'your@email.com',
              resumeUrl: 'https://your-resume-url.pdf',
              location: {
                city: 'Your City',
                country: 'Your Country',
              },
            },
            preferences: {
              minSalary: 95000,
              maxSalary: 250000,
              location: 'Your Location',
              remoteWork: true,
            },
          }}
          aiConfig={{
            provider: 'openai', // or 'gemini'
            apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY!,
            model: 'gpt-4-turbo-preview', // optional
          }}
          rateLimit={{
            identifier: 'chat:default',
            limit: 100,
            window: 3600,
            redis: new Redis({
              url: process.env.NEXT_PUBLIC_REDIS_URL!,
              token: process.env.NEXT_PUBLIC_REDIS_TOKEN!,
            }),
          }}
        >
          <ChatWidget position="bottom-right" />
        </RootProvider>
      </body>
    </html>
  )
}
```

### 4. Add api roouters

- `app/api/email/send-resume/route.ts`
  Add to your `app/api/email/send-resume/route.ts`:

```ts
import { createEmailHandler } from '@my-chatbot/core'
import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

const handler = createEmailHandler({
  nodemailer,
  configs: {
    host: process.env.SMTP_HOST!,
    port: Number(process.env.SMTP_PORT),
    user: process.env.SMTP_USER!,
    pass: process.env.SMTP_PASS!,
    from: process.env.SMTP_FROM!,
  },
})

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const result = await handler.POST({ body })
    return NextResponse.json(result.json, { status: result.status || 500 })
  } catch (error) {
    console.error('Email route error:', error)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}
```

- `app/api/client-ip/route.ts`

```ts
import { NextResponse } from 'next/server'
import { headers } from 'next/headers'

export async function GET() {
  const headersList = await headers()

  const forwarded = headersList.get('x-forwarded-for')
  const realIp = headersList.get('x-real-ip')

  const ip = realIp || forwarded?.split(',')[0] || '127.0.0.1'

  return new NextResponse(JSON.stringify({ ip }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  })
}
```

- `app/api/calendar/route.ts` (coming soon [Google Calendar Integration - Under Development])

```ts
import { google } from 'googleapis'
import { NextResponse } from 'next/server'
import { CalendarHandler } from '@my-chatbot/core'

const calendar = google.calendar('v3')

const auth = new google.auth.JWT({
  email: process.env.NEXT_PUBLIC_CALENDAR_EMAIL,
  key: process.env.NEXT_PUBLIC_CALENDAR_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  scopes: ['https://www.googleapis.com/auth/calendar'],
})

const calendarHandler = new CalendarHandler({ calendar, auth })

export async function POST(request: Request) {
  const body = await request.json()
  const result = await calendarHandler.createEvent(body)

  if (result.status === 200) {
    return NextResponse.json(result.data)
  }

  return NextResponse.json({ error: result.error }, { status: result.status })
}
```

### 5. Environment Variables

Add to your `.env.local`:

```env
# Email
EMAIL_USER=smtp_user
EMAIL_PASSWORD=smtp_pass

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=smtp_user
SMTP_PASS=smtp_pass
SMTP_FROM="Ruther's AI Assistant <smtp_user>"

# OpenAI
NEXT_PUBLIC_OPENAI_API_KEY=openai_api_key


# Google Calendar (coming soon - under development)
NEXT_PUBLIC_CALENDAR_EMAIL=calendar_email@example.com
NEXT_PUBLIC_CALENDAR_PRIVATE_KEY="calendar_private_key"


# Redis Configuration
NEXT_PUBLIC_REDIS_URL=https://growing-cricket-123123.upstash.io
NEXT_PUBLIC_REDIS_TOKEN=redis_token

```

### 6. Add Tailwind Config

Make sure your `tailwind.config.ts` includes the UI package:

```ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@my-chatbot/ui/**/*.{js,ts,jsx,tsx}', // Add this line
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

export default config
```

## Troubleshooting

If you encounter peer dependency issues (especially with Next.js < 15):

```bash
npm install --legacy-peer-deps
# or
yarn install --ignore-engines
# or
pnpm install --no-strict-peer-dependencies
```

## License

MIT © [Ruther Teñido](https://github.com/codenicer)

## Author

- [Ruther Teñido](https://github.com/codenicer)
- [Portfolio](https://codenicer.dev)
  [![NPM version](https://img.shields.io/npm/v/@my-chatbot/ui.svg)](https://www.npmjs.com/package/@my-chatbot/ui)
  [![NPM version](https://img.shields.io/npm/v/@my-chatbot/core.svg)](https://www.npmjs.com/package/@my-chatbot/core)

If you use this project, please consider giving it a ⭐️
