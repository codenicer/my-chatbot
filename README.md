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

## Installation

```bash
npm install @my-chatbot/ui @my-chatbot/core
```

## Environment Variables

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


# Optional (Calendar Integration - Coming Soon)
NEXT_PUBLIC_CALENDAR_EMAIL=your_google_service_account_email
NEXT_PUBLIC_CALENDAR_PRIVATE_KEY=your_google_private_key
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
      apiKey={process.env.NEXT_PUBLIC_OPENAI_API_KEY}
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
```

## Configuration

### Personal Context

The `personalContext` object allows you to customize the AI assistant's knowledge about you:

```typescript
interface PersonalContext {
  assistant: {
    name: string
    avatarUrl?: string
  }
  information: {
    name: string
    email: string
    resumeUrl: string
    // ... other fields
  }
  // ... see types for full configuration
}
```

### Rate Limiting

Rate limiting is handled through Upstash Redis. Configure limits with:

```typescript
interface RateLimitConfig {
  limit: number // Max requests per window
  window: number // Time window in seconds
  redis: {
    url: string
    token: string
  }
}
```

## License

MIT © [Ruther Teñido](https://github.com/codenicer)

## Author

- [Ruther Teñido](https://github.com/codenicer)
- [Portfolio](https://codenicer.dev)

If you use this project, please consider giving it a ⭐️
