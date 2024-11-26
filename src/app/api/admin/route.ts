import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // First check if user exists
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'kmobolaji@tevcng.com')
      .single()

    if (existingUser) {
      return NextResponse.json({ message: 'Admin user already exists' })
    }

    // Create the user
    const { data: { user }, error: signUpError } = await supabase.auth.signUp({
      email: 'kmobolaji@tevcng.com',
      password: 'Admin@123',
    })

    if (signUpError) {
      console.error('Signup error:', signUpError)
      throw signUpError
    }

    if (!user) {
      throw new Error('User creation failed')
    }

    // Set admin status
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        email: 'kmobolaji@tevcng.com',
        is_admin: true,
        is_active: true,
        updated_at: new Date().toISOString(),
      })

    if (profileError) {
      console.error('Profile error:', profileError)
      throw profileError
    }

    return NextResponse.json({
      message: 'Admin user created successfully',
      user: {
        email: 'kmobolaji@tevcng.com',
        password: 'Admin@123'
      }
    })
  } catch (error: any) {
    console.error('Admin creation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create admin user' },
      { status: 500 }
    )
  }
}
