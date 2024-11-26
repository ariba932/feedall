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

async function createTables() {
  try {
    // Try to execute a simple query to check if table exists
    const { error: queryError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)

    if (queryError && queryError.code === '42P01') {
      // Table doesn't exist, create it using raw SQL
      const sql = `
        -- Create profiles table
        CREATE TABLE IF NOT EXISTS public.profiles (
          id UUID REFERENCES auth.users(id) PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          full_name TEXT,
          organization_name TEXT,
          phone_number TEXT,
          address TEXT,
          is_admin BOOLEAN DEFAULT false,
          is_donor BOOLEAN DEFAULT false,
          is_active BOOLEAN DEFAULT true,
          onboarding_completed BOOLEAN DEFAULT false,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- Enable RLS
        ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

        -- Create policies
        CREATE POLICY "Users can view own profile" 
          ON public.profiles FOR SELECT 
          USING (auth.uid() = id);

        CREATE POLICY "Users can update own profile" 
          ON public.profiles FOR UPDATE 
          USING (auth.uid() = id);

        CREATE POLICY "Admin users can view all profiles" 
          ON public.profiles FOR SELECT 
          USING (
            EXISTS (
              SELECT 1 FROM public.profiles
              WHERE id = auth.uid() AND is_admin = true
            )
          );

        CREATE POLICY "Admin users can update all profiles" 
          ON public.profiles FOR UPDATE 
          USING (
            EXISTS (
              SELECT 1 FROM public.profiles
              WHERE id = auth.uid() AND is_admin = true
            )
          );

        -- Create function to handle new user signups
        CREATE OR REPLACE FUNCTION public.handle_new_user()
        RETURNS TRIGGER AS $$
        BEGIN
          INSERT INTO public.profiles (id, email, created_at, updated_at)
          VALUES (new.id, new.email, now(), now());
          RETURN new;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;

        -- Create trigger for new user signups
        DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
        CREATE TRIGGER on_auth_user_created
          AFTER INSERT ON auth.users
          FOR EACH ROW
          EXECUTE FUNCTION public.handle_new_user();
      `

      // Split the SQL into separate statements
      const statements = sql
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0)

      // Execute each statement separately
      for (const statement of statements) {
        const { error } = await supabase.rpc('exec', { sql: statement + ';' })
        if (error) {
          console.error('Error executing SQL:', error)
          console.error('Statement:', statement)
          return
        }
      }

      console.log('Tables and policies created successfully!')
    } else {
      console.log('Tables already exist!')
    }
  } catch (error) {
    console.error('Error creating tables:', error)
  }
}

createTables()
