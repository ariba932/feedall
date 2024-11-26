const { createClient } = require('@supabase/supabase-js')
const dotenv = require('dotenv')
const path = require('path')

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function setupAdmin() {
  try {
    const adminEmail = 'kmobolaji@tevcng.com'
    const adminPassword = 'Admin@123'

    // Create admin user
    const { data, error: createUserError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
    })

    if (createUserError) {
      if (createUserError.message.includes('User already registered')) {
        console.log('Admin user already exists')
      } else {
        throw createUserError
      }
    } else {
      console.log('Admin user created successfully')
    }

    // Get user ID (either from new user or existing user)
    const { data: existingUser } = await supabase.auth.admin.getUserByEmail(adminEmail)
    const userId = data?.user?.id || existingUser?.user?.id

    if (!userId) {
      throw new Error('Could not get user ID')
    }

    // Update or create admin profile
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        email: adminEmail,
        is_admin: true,
        is_active: true,
        onboarding_completed: true,
        full_name: 'Admin User',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

    if (profileError) {
      throw profileError
    }

    console.log('Admin profile updated successfully')
    console.log('Email:', adminEmail)
    console.log('Password:', adminPassword)
    console.log('Please change the password after first login')

  } catch (error) {
    console.error('Error setting up admin:', error)
  }
}

setupAdmin()
