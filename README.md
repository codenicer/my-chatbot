# AI Chat Assistant Widget

A customizable AI chat widget for Next.js portfolio websites. Built with TypeScript, Tailwind CSS, and OpenAI/Gemini.

![Chat Widget Demo](demo.gif)

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

### 4. Environment Variables

Add to your `.env.local`:

```env
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_key
# Or for Gemini
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_key

NEXT_PUBLIC_REDIS_URL=your_redis_url
NEXT_PUBLIC_REDIS_TOKEN=your_redis_token
```

### 5. Add Tailwind Config

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

If you use this project, please consider giving it a ⭐️
