import { Redis } from '@upstash/redis'
import { createRateLimitHandler } from '@my-chatbot/core'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const redis = new Redis({
  url: process.env.REDIS_URL!,
  token: process.env.REDIS_TOKEN!,
})

const handler = createRateLimitHandler({ redis })

export async function GET(request: NextRequest) {
  const result = await handler.GET(request)
  return NextResponse.json(result.json, { status: result.status })
}

export async function POST(request: NextRequest) {
  const result = await handler.POST(request)
  return NextResponse.json(result.json, { status: result.status })
}
