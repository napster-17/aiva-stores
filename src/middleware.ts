// File: src/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const url = request.nextUrl

  // 1. Partner Dashboard Protection
  // We handle the actual session check inside layout.tsx or individual pages
  // But we pass the pathname in headers so the Root Layout knows where the user is.
  
  const response = NextResponse.next()
  response.headers.set('x-pathname', url.pathname)
  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}