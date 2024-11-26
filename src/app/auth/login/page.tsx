'use client'

import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { createClient } from '@/lib/supabase/client'
import { useSearchParams } from 'next/navigation'

export default function LoginPage() {
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/dashboard'
  const supabase = createClient()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Sign in to your account
          </h2>
        </div>
        <div className="mt-8">
          <Auth
            supabaseClient={supabase}
            view="sign_in"
            appearance={{ theme: ThemeSupa }}
            theme="dark"
            showLinks={true}
            providers={['google']}
            redirectTo={`${window.location.origin}${redirectTo}`}
          />
        </div>
      </div>
    </div>
  )
}
