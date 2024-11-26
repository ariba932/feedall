import { createServerClient } from '@/lib/supabase/server'
import { successResponse, errorResponse } from '@/lib/api-response'
import { getDonation, updateDonation, deleteDonation } from '@/lib/supabase/donations'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return errorResponse('Unauthorized', 401)
    }

    const donation = await getDonation(params.id)

    // Verify user is involved in the donation
    if (donation.donor_id !== session.user.id && donation.recipient_id !== session.user.id) {
      return errorResponse('Not authorized to view this donation', 403)
    }

    return successResponse(donation)
  } catch (error: any) {
    return errorResponse(error.message)
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return errorResponse('Unauthorized', 401)
    }

    const donation = await getDonation(params.id)

    // Verify user is involved in the donation
    if (donation.donor_id !== session.user.id && donation.recipient_id !== session.user.id) {
      return errorResponse('Not authorized to update this donation', 403)
    }

    const body = await request.json()
    const updatedDonation = await updateDonation(params.id, body)

    return successResponse(updatedDonation)
  } catch (error: any) {
    return errorResponse(error.message)
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return errorResponse('Unauthorized', 401)
    }

    const donation = await getDonation(params.id)

    // Only allow deletion if the donation is in pending status
    if (donation.status !== 'pending') {
      return errorResponse('Can only delete pending donations', 400)
    }

    // Only recipient can delete their donation request
    if (donation.recipient_id !== session.user.id) {
      return errorResponse('Only the recipient can delete the donation request', 403)
    }

    await deleteDonation(params.id)
    return successResponse({ message: 'Donation deleted successfully' })
  } catch (error: any) {
    return errorResponse(error.message)
  }
}
