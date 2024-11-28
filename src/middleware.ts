import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Get the pathname of the request
  const path = req.nextUrl.pathname;

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/register'];
  const isPublicRoute = publicRoutes.includes(path);

  // If user is not logged in and trying to access protected route
  if (!session && !isPublicRoute) {
    const redirectUrl = new URL('/login', req.url);
    return NextResponse.redirect(redirectUrl);
  }

  // If user is logged in and trying to access public route
  if (session && isPublicRoute) {
    // Get user's profile to check completion status
    const { data: profile } = await supabase
      .from('profiles')
      .select('profile_completed, roles:user_roles(role_id)')
      .eq('id', session.user.id)
      .single();

    if (profile) {
      // If profile is completed, redirect to their dashboard
      if (profile.profile_completed) {
        // Get the user's primary role (first role)
        const primaryRole = profile.roles?.[0]?.role_id?.toLowerCase() || 'donor';
        const redirectUrl = new URL(`/dashboard/${primaryRole}`, req.url);
        return NextResponse.redirect(redirectUrl);
      }
      // If profile is not completed, redirect to onboarding
      else {
        const redirectUrl = new URL('/onboarding', req.url);
        return NextResponse.redirect(redirectUrl);
      }
    }
  }

  // Special handling for root path
  if (session && path === '/') {
    // Get user's profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('profile_completed, roles:user_roles(role_id)')
      .eq('id', session.user.id)
      .single();

    if (profile) {
      if (profile.profile_completed) {
        // Get the user's primary role (first role)
        const primaryRole = profile.roles?.[0]?.role_id?.toLowerCase() || 'donor';
        const redirectUrl = new URL(`/dashboard/${primaryRole}`, req.url);
        return NextResponse.redirect(redirectUrl);
      } else {
        const redirectUrl = new URL('/onboarding', req.url);
        return NextResponse.redirect(redirectUrl);
      }
    }
  }

  // Protected dashboard routes check
  if (session && path.startsWith('/dashboard')) {
    // Get user's profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('profile_completed, roles:user_roles(role_id)')
      .eq('id', session.user.id)
      .single();

    if (profile) {
      // If profile is not completed, redirect to onboarding
      if (!profile.profile_completed) {
        const redirectUrl = new URL('/onboarding', req.url);
        return NextResponse.redirect(redirectUrl);
      }

      // Check if user has access to this dashboard
      const requestedRole = path.split('/')[2]; // Get role from /dashboard/{role}
      const userRoles = profile.roles?.map(r => r.role_id.toLowerCase()) || [];
      
      if (!userRoles.includes(requestedRole)) {
        // If user doesn't have access to this dashboard, redirect to their primary role dashboard
        const primaryRole = userRoles[0] || 'donor';
        const redirectUrl = new URL(`/dashboard/${primaryRole}`, req.url);
        return NextResponse.redirect(redirectUrl);
      }
    }
  }

  return res;
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
