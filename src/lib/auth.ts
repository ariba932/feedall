import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { UserRole } from '@/types/user';

interface RegisterUserData {
  email: string;
  password: string;
  roles: UserRole[];
}

const SUPABASE_SERVICE_ROLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

export async function registerUser(data: RegisterUserData) {
  // Create auth user with the component client
  const supabase = createClientComponentClient();
  
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        roles: data.roles,
      },
    },
  });

  if (authError) throw authError;
  if (!authData.user) throw new Error('No user returned from sign up');

  try {
    // Create admin client for database operations
    const supabaseAdmin = createClientComponentClient({
      supabaseUrl: SUPABASE_URL,
      supabaseKey: SUPABASE_SERVICE_ROLE_KEY,
    });

    // Create initial profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: authData.user.id,
        email: data.email,
        roles: data.roles,
        profile_completed: false
      });

    if (profileError) throw profileError;

    return { user: authData.user };
  } catch (error) {
    // If profile creation fails, we should delete the auth user
    await supabase.auth.signOut();
    throw error;
  }
}
