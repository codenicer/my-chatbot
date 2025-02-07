# AI Chat Assistant Widget

A customizable AI chat widget for Next.js portfolio websites. Built with TypeScript, Tailwind CSS, and OpenAI.

![Chat Widget Demo](demo.gif)

## Features

- 🎨 Fully customizable theming
- 💬 OpenAI-powered chat
- 📧 Resume sharing capability
- 📅 Meeting scheduling (coming soon)
- ⚡ Built with performance in mind
- 🎯 TypeScript & Tailwind CSS

## Setup Guide

### 1. Installation

```bash
npm install @my-chatbot/ui @my-chatbot/core
```

### 2. Environment Variables

Create a `.env.local` file in your project root:

```env
# Required
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key
NEXT_PUBLIC_REDIS_URL=your_redis_url
NEXT_PUBLIC_REDIS_TOKEN=your_redis_token

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=[your-email]@gmail.com
SMTP_PASS="your-email-password"
SMTP_FROM="[your-name] <your-email@gmail.com>"

# Optional (Calendar Integration)
NEXT_PUBLIC_CALENDAR_EMAIL=your_google_service_account_email
NEXT_PUBLIC_CALENDAR_PRIVATE_KEY=your_google_private_key
```

### 3. API Setup

1. First, set up CORS middleware for all API routes. Create `middleware.ts` in your app root:

```typescript:middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Add CORS headers
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS'
  )
  response.headers.set(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization'
  )

  return response
}

export const config = {
  matcher: '/api/:path*',
}
```

2. Create required API routes:

```typescript:app/api/email/send-resume/route.ts
import { EmailHandler } from '@my-chatbot/core'
import { NextResponse } from 'next/server'

const emailHandler = new EmailHandler({
  smtp: {
    host: process.env.SMTP_HOST!,
    port: parseInt(process.env.SMTP_PORT!),
    auth: {
      user: process.env.SMTP_USER!,
      pass: process.env.SMTP_PASS!,
    },
  },
  from: process.env.SMTP_FROM!,
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const result = await emailHandler.sendResume(body)
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    )
  }
}
```

```typescript:app/api/rate-limit/route.ts
import { RateLimitHandler } from '@my-chatbot/core'
import { NextResponse } from 'next/server'

const rateLimitHandler = new RateLimitHandler({
  redis: {
    url: process.env.NEXT_PUBLIC_REDIS_URL!,
    token: process.env.NEXT_PUBLIC_REDIS_TOKEN!,
  },
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const result = await rateLimitHandler.checkLimit(body)
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { error: 'Rate limit check failed' },
      { status: 500 }
    )
  }
}
```

### 4. Component Setup

Add the chat widget to your app:

```typescript:app/layout.tsx
import { RootProvider, ChatWidget } from '@my-chatbot/ui'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html>
      <body>
        {children}
        <RootProvider
          personalContext={{
            assistant: {
              name: "Taiga",
            },
            information: {
              name: "Your Name",
              email: "your@email.com",
              // See types for full configuration
            },
          }}
          aiConfig={{
            // Choose your AI provider
            provider: 'openai', // or 'gemini'
            apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY!,
            model: 'gpt-4-turbo-preview', // optional
          }}
          rateLimit={{
            limit: 10,
            window: 3600,
            redis: {
              url: process.env.NEXT_PUBLIC_REDIS_URL!,
              token: process.env.NEXT_PUBLIC_REDIS_TOKEN!
            }
          }}
        >
          <ChatWidget theme={theme} position="bottom-right" />
        </RootProvider>
      </body>
    </html>
  )
}
```

## Usage

```typescript
import { RootProvider, ChatWidget } from '@my-chatbot/ui'

// Your theme
const theme = {
  primary: {
    background: '#0A0F1C',
    text: '#FFFFFF',
  },
  secondary: {
    background: '#B08968',
    text: '#0A0F1C',
  },
  accent: {
    background: '#0EA5E9',
    text: '#FFFFFF',
  },
  neutral: {
    background: '#1E293B',
    text: '#94A3B8',
    border: '#334155',
  }
}

// Add to your app
function App() {
  return (
    <RootProvider
      personalContext={{
        assistant: {
          name: "Taiga", // Your AI assistant name
        },
        information: {
          name: "Your Name",
          email: "your@email.com",
          // ... other details
        },
      }}
      aiConfig={{
        provider: 'openai',
        apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
        model: 'gpt-4-turbo-preview', // optional
        temperature: 0.7 // optional
      }}
      rateLimit={{
        limit: 10,
        window: 3600,
        redis: {
          url: process.env.NEXT_PUBLIC_REDIS_URL,
          token: process.env.NEXT_PUBLIC_REDIS_TOKEN
        }
      }}
    >
      <ChatWidget
        theme={theme}
        position="bottom-right"
      />
    </RootProvider>
  )
}

// Using Gemini
<RootProvider
  personalContext={{
    assistant: {
      name: "Taiga", // Your AI assistant name
    },
    information: {
      name: "Your Name",
      email: "your@email.com",
      // ... other details
    },
  }}
  aiConfig={{
    provider: 'gemini',
    apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
    model: 'gemini-pro', // optional
    temperature: 0.7 // optional
  }}
  rateLimit={{
    limit: 10,
    window: 3600,
    redis: {
      url: process.env.NEXT_PUBLIC_REDIS_URL,
      token: process.env.NEXT_PUBLIC_REDIS_TOKEN
    }
  }}
>
  <ChatWidget />
</RootProvider>
```

## License

MIT © [Ruther Teñido](https://github.com/codenicer)

## Author

- [Ruther Teñido](https://github.com/codenicer)
- [Portfolio](https://codenicer.dev)

If you use this project, please consider giving it a ⭐️
