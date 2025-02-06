import { ApiResponse, createResponse } from './utils'
import { Redis } from '@upstash/redis'

export interface RateLimitConfig {
  redis: Redis
  requestsPerHour?: number
  windowInSeconds?: number
}

export interface RateLimitRequest {
  headers: {
    get(name: string): string | null
  }
}

export function createRateLimitHandler(config: RateLimitConfig) {
  const REQUESTS_PER_HOUR = config.requestsPerHour || 5
  const WINDOW = config.windowInSeconds || 60 * 60 // 1 hour in seconds

  async function POST(request: RateLimitRequest): Promise<ApiResponse> {
    console.log('HERE!!')
    try {
      const ip = request.headers.get('x-forwarded-for') || 'unknown'
      const key = `rate_limit:${ip}`
      const count = await config.redis.incr(key)

      if (count === 1) {
        await config.redis.expire(key, WINDOW)
      }

      if (count > REQUESTS_PER_HOUR) {
        return createResponse({ error: 'Rate limit exceeded' }, 429)
      }

      return createResponse({ success: true })
    } catch (error) {
      console.error('Rate limit API error:', error)
      return createResponse({ error: 'Rate limit service error' }, 500)
    }
  }

  async function GET(request: RateLimitRequest): Promise<ApiResponse> {
    try {
      const ip = request.headers.get('x-forwarded-for') || 'unknown'
      const key = `rate_limit:${ip}`
      const [count, ttl] = await Promise.all([
        config.redis.get(key),
        config.redis.ttl(key),
      ])

      return createResponse({
        remaining: Math.max(
          0,
          REQUESTS_PER_HOUR - parseInt(String(count) || '0')
        ),
        reset: ttl,
        total: REQUESTS_PER_HOUR,
      })
    } catch (error) {
      console.error('Rate limit info API error:', error)
      return createResponse({ error: 'Failed to get rate limit info' }, 500)
    }
  }

  return { GET, POST }
}

export interface RateLimitParams {
  identifier: string // Usually IP address or user ID
  limit: number // Max requests per window
  window: number // Time window in seconds
  redis: Redis // Redis client instance
}

export async function checkRateLimit({
  identifier,
  limit = 20, // 20 messages default
  window = 3600, // 1 hour in seconds
  redis,
}: RateLimitParams) {
  const key = `rate-limit:${identifier}`

  const [count] = await redis.pipeline().incr(key).expire(key, window).exec()

  const remaining = limit - (count as number)
  const reset = Math.floor(Date.now() / 1000) + window

  console.log('remaining', remaining)
  if (remaining < 0) {
    throw new Error('Rate limit exceeded')
  }

  return {
    limit,
    remaining: Math.max(0, remaining),
    reset,
  }
}
