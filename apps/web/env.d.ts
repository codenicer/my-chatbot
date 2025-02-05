declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_OPENAI_API_KEY: string
    GOOGLE_SERVICE_ACCOUNT_EMAIL: string
    GOOGLE_PRIVATE_KEY: string
    EMAIL_USER: string
    EMAIL_PASSWORD: string
    SMTP_HOST: string
    SMTP_PORT: string
    SMTP_USER: string
    SMTP_PASS: string
    SMTP_FROM: string
    NODE_ENV: 'development' | 'production' | 'test'
    NEXT_PUBLIC_REDIS_URL: string
    NEXT_PUBLIC_REDIS_TOKEN: string
  }
}
