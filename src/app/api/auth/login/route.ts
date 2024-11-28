import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export interface LoginRequestBody {
  email: string;
  password: string;
}

export async function POST(request: Request) {
  try {
    const body: LoginRequestBody = await request.json();
    const { email, password } = body;

    const supabase = createRouteHandlerClient({ cookies });

    const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      return NextResponse.json(
        { error: signInError.message },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 400 }
      );
    }

    // Get user roles
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_role')
      .select('role_id')
      .eq('user_id', authData.user.id)
      .order('created_at', { ascending: true });

    if (rolesError) {
      return NextResponse.json(
        { error: 'Failed to fetch user roles' },
        { status: 400 }
      );
    }

    if (!userRoles.length) {
      return NextResponse.json(
        { error: 'No roles assigned to user' },
        { status: 400 }
      );
    }

    // Get the primary role (first assigned role)
    const primaryRole = userRoles[0].role_id;

    return NextResponse.json({
      user: authData.user,
      primaryRole
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    );
  }
}
