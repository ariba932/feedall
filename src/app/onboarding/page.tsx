import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import OnboardingForm from '@/components/onboarding/OnboardingForm'

export default async function OnboardingPage() {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth/signin')
  }

  // Check if user has already completed onboarding
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, is_donor')
    .eq('id', session.user.id)
    .single()

  // If profile is complete, redirect to appropriate dashboard
  if (profile?.full_name) {
    redirect(profile.is_donor ? '/dashboard/overview' : '/dashboard/overview')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Complete Your Profile
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Please provide the following information to complete your registration
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <OnboardingForm type="donor" />
      </div>
    </div>
  )
}
