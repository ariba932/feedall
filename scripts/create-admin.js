const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://qdajklxswfzxtfviewcn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkYWprbHhzd2Z6eHRmdmlld2NuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMjM5NjY1OCwiZXhwIjoyMDQ3OTcyNjU4fQ.aBBPXhPMdHPwELHQgdNlLYRmvvTgzlDYcbXxNPZHGwE'
)

async function createAdmin() {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: 'kmobolaji@tevcng.com',
      password: 'Admin@123',
    })

    if (error) throw error

    // Set admin role in profiles table
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: data.user.id,
        email: 'kmobolaji@tevcng.com',
        is_admin: true,
        is_active: true,
        updated_at: new Date().toISOString(),
      })

    if (profileError) throw profileError

    console.log('Admin user created successfully!')
    console.log('Email: kmobolaji@tevcng.com')
    console.log('Password: Admin@123')
    console.log('Please change your password after first login')
  } catch (error) {
    console.error('Error:', error.message)
  }
}

createAdmin()
