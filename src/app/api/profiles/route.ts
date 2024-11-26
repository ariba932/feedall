import { createServerClient } from '@/lib/supabase/server'
import { successResponse, errorResponse } from '@/lib/api-response'
import { cookies } from 'next/headers'
import { createProfile, updateProfile } from '@/lib/supabase/profiles'

export async function GET() {
  try {
    const supabase = createServerClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return errorResponse('Unauthorized', 401)
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()

    return successResponse(profile)
  } catch (error: any) {
    return errorResponse(error.message)
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createServerClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return errorResponse('Unauthorized', 401)
    }

    const body = await request.json()
    const profile = await createProfile({
      id: session.user.id,
      email: session.user.email!,
      ...body
    })

    return successResponse(profile, 201)
  } catch (error: any) {
    return errorResponse(error.message)
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = createServerClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return errorResponse('Unauthorized', 401)
    }

    const body = await request.json()
    const profile = await updateProfile(session.user.id, body)

    return successResponse(profile)
  } catch (error: any) {
    return errorResponse(error.message)
  }
}
