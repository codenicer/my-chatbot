import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Only apply to calendar API routes
  if (!request.nextUrl.pathname.startsWith('/api/calendar')) {
    return NextResponse.next()
  }

  const authHeader = request.headers.get('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'Missing or invalid authorization header' },
      { status: 401 }
    )
  }

  const token = authHeader.split(' ')[1]
  if (token !== process.env.CALENDAR_API_KEY) {
    return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/api/calendar/:path*',
}
