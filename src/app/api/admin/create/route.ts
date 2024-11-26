import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  
  try {
    // Create admin user with the specified email
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: 'kmobolaji@tevcng.com',
      password: 'Admin@123', // You should change this password after first login
      email_confirm: true
    });

    if (authError) throw authError;

    // Create admin profile
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: authUser.user.id,
        email: 'kmobolaji@tevcng.com',
        is_admin: true,
        is_active: true,
        updated_at: new Date().toISOString(),
      });

    if (profileError) throw profileError;

    return NextResponse.json({ message: 'Admin profile created successfully' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
