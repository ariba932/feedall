import { createServerClient } from '@/lib/supabase/server'
import { successResponse, errorResponse } from '@/lib/api-response'
import { getDonations, createDonation } from '@/lib/supabase/donations'

export async function GET(request: Request) {
  try {
    const supabase = createServerClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return errorResponse('Unauthorized', 401)
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') as 'pending' | 'accepted' | 'completed' | 'cancelled' | null
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined

    const donations = await getDonations({
      status,
      userId: session.user.id,
      limit,
      offset
    })

    return successResponse(donations)
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
    
    // Verify the user is a recipient
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, status')
      .eq('id', session.user.id)
      .single()

    if (!profile || profile.role !== 'recipient' || profile.status !== 'approved') {
      return errorResponse('Only approved recipients can create donation requests', 403)
    }

    const donation = await createDonation({
      recipient_id: session.user.id,
      ...body
    })

    return successResponse(donation, 201)
  } catch (error: any) {
    return errorResponse(error.message)
  }
}
