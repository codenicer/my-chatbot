import { createClient, RedisClientType } from 'redis'
import { ChatError } from '../types'

export class RateLimitService {
  private redis: RedisClientType
  private requestsPerHour: number

  constructor(redisUrl: string, requestsPerHour = 5) {
    this.redis = createClient({ url: redisUrl })
    this.requestsPerHour = requestsPerHour
  }

  async connect() {
    await this.redis.connect()
  }

  async checkRateLimit(ip: string): Promise<void> {
    const key = `rate_limit:${ip}`
    const count = await this.redis.incr(key)

    // Set expiry on first request
    if (count === 1) {
      await this.redis.expire(key, 3600) // 1 hour
    }

    if (count > this.requestsPerHour) {
      const error: ChatError = {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Rate limit exceeded. Please try again later.',
        timestamp: Date.now(),
      }
      throw error
    }
  }

  async getRateLimitInfo(ip: string) {
    const key = `rate_limit:${ip}`
    const [count, ttl] = await Promise.all([
      this.redis.get(key),
      this.redis.ttl(key),
    ])

    return {
      remaining: Math.max(0, this.requestsPerHour - parseInt(count || '0')),
      reset: ttl,
      total: this.requestsPerHour,
    }
  }

  async disconnect() {
    await this.redis.disconnect()
  }
}
