import { NextResponse } from 'next/server'
import { headers } from 'next/headers'

export async function GET() {
  const headersList = await headers()

  const forwarded = headersList.get('x-forwarded-for')
  const realIp = headersList.get('x-real-ip')

  const ip = realIp || forwarded?.split(',')[0] || '127.0.0.1'

  return new NextResponse(JSON.stringify({ ip }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  })
}
