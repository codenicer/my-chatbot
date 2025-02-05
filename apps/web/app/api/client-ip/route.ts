import { NextResponse } from 'next/server'
import { getClientIp } from '@my-chatbot/core'

export async function GET(request: Request) {
  const clientIp = getClientIp(request.headers)
  return NextResponse.json({ ip: clientIp })
}
