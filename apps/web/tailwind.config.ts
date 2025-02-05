// tailwind config is required for editor support

import { type Config } from 'tailwindcss'
import sharedConfig from '@my-chatbot/ui/tailwind.config'

const config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  presets: [sharedConfig],
} satisfies Config

export default config
