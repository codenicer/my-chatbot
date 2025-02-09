import { RateLimitParams } from '../types'

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
