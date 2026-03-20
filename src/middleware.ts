// File: src/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  const url = request.nextUrl

  // Explicitly redirect only admin root to /auth
  if (hostname === 'admin.thegoaiva.com' && url.pathname === '/') {
    url.pathname = '/auth'
    return NextResponse.redirect(url)
  }

   // 2. Partner Logic (New)
  // If user tries to access any partner dashboard page without a session
  if (url.pathname.startsWith('/partners/dashboard')) {
    // Note: Real session check usually happens via a cookie check in middleware 
    // or inside a Layout component for Supabase. 
    // For now, let's just allow the request and handle auth in the layout.
  }

  // Debug headers for layout.tsx logic
  const response = NextResponse.next()
  response.headers.set('x-pathname', url.pathname)
  response.headers.set('x-host', hostname)
  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}