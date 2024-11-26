import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res })

  // Refresh session if expired - required for Server Components
  const { data: { session } } = await supabase.auth.getSession()

  const path = request.nextUrl.pathname

  // Handle root dashboard path
  if (path === '/dashboard') {
    return NextResponse.redirect(new URL('/dashboard/overview', request.url))
  }

  // Check auth state for protected routes
  if (path.startsWith('/dashboard') || path.startsWith('/admin') || path.startsWith('/onboarding')) {
    if (!session) {
      const redirectUrl = new URL('/auth/signin', request.url)
      redirectUrl.searchParams.set('redirect', path)
      return NextResponse.redirect(redirectUrl)
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin, onboarding_completed')
      .eq('id', session.user.id)
      .single()

    // Redirect to onboarding if not completed (except if already on onboarding page)
    if (!profile?.onboarding_completed && !path.startsWith('/onboarding')) {
      return NextResponse.redirect(new URL('/onboarding', request.url))
    }

    // Additional check for admin routes
    if (path.startsWith('/admin')) {
      if (!profile?.is_admin) {
        return NextResponse.redirect(new URL('/dashboard/overview', request.url))
      }
    }
  }

  return res
}

export const config = {
  matcher: [
    '/dashboard',
    '/dashboard/:path*',
    '/admin/:path*',
    '/onboarding',
    '/auth/signin',
  ],
}
