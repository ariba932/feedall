import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { UserRole } from '@/types/user';

// Initialize service role client for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface RegisterRequestBody {
  email: string;
  password: string;
  phone: string;
  roles?: UserRole[]; // Make roles optional
}

export async function POST(request: Request) {
  try {
    const body: RegisterRequestBody = await request.json();
    const { email, password, phone, roles = [UserRole.DONOR] } = body; // Set DONOR as default role

    // Initialize Supabase client with server-side auth
    const supabase = createRouteHandlerClient({ cookies });

    // Create the user
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          phone,
        }
      }
    });
    console.log('authorization data', authData);

    if (signUpError) {
      return NextResponse.json(
        { error: signUpError.message },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'No user returned from sign up' },
        { status: 400 }
      );
    }

    // Wait a short time for the trigger to create the profile
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Update the profile with additional information using admin client
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({
        phone,
        email,
        profile_completed: true, // Set to true since we're skipping onboarding
        updated_at: new Date().toISOString()
      })
      .eq('id', authData.user.id);

    if (profileError) {
      console.log("Error for profile update", profileError);
      // If profile update fails, clean up the auth user
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json(
        { error: 'Failed to update user profile' },
        { status: 400 }
      );
    }

    // Assign roles using a stored procedure
    const { error: rolesError } = await supabaseAdmin.rpc('assign_user_roles', {
      p_user_id: authData.user.id,
      p_role_names: roles.map(role => role.toUpperCase())
    });

    if (rolesError) {
      console.log("Error for role assignment", rolesError);
      // If role assignment fails, clean up the user and profile
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json(
        { error: 'Failed to assign user roles' },
        { status: 400 }
      );
    }

    return NextResponse.json({ 
      user: authData.user,
      primaryRole: UserRole.DONOR,
      redirectTo: '/dashboard/donor' // Add redirect URL
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'An error occurred during registration' },
      { status: 500 }
    );
  }
}
