'use client'

export class RateLimitService {
  private baseUrl: string
  private headers: HeadersInit

  constructor() {
    this.baseUrl = '/api/rate-limit'
    this.headers = {
      'Content-Type': 'application/json',
    }
  }

  async checkRateLimit(): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/check`, {
        method: 'POST',
        headers: this.headers,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Rate limit exceeded')
      }
    } catch (error) {
      console.error('Rate limit error:', error)
      throw error
    }
  }

  async getRateLimitInfo() {
    try {
      const response = await fetch(`${this.baseUrl}/info`, {
        headers: this.headers,
      })

      if (!response.ok) {
        throw new Error('Failed to get rate limit info')
      }

      const data = await response.json()
      return {
        remaining: data.remaining,
        reset: data.reset,
        total: data.total,
      }
    } catch (error) {
      console.error('Rate limit info error:', error)
      throw error
    }
  }
}
