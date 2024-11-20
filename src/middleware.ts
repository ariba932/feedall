import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the pathname of the request (e.g. /, /dashboard, /about...)
  const path = request.nextUrl.pathname;

  // If the path is exactly /dashboard, redirect to /dashboard/overview
  if (path === '/dashboard') {
    return NextResponse.redirect(new URL('/dashboard/overview', request.url));
  }

  // Continue with the request
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
