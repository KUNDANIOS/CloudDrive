import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This is a basic middleware - you can customize it later
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

// Optional: Configure which routes this middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};