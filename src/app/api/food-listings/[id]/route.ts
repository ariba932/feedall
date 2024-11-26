import { createServerClient } from '@/lib/supabase/server'
import { successResponse, errorResponse } from '@/lib/api-response'
import { getFoodListing, updateFoodListing, deleteFoodListing } from '@/lib/supabase/food-listings'
import { getDonations } from '@/lib/supabase/donations'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const includeDonations = searchParams.get('includeDonations') === 'true'

    // Get the listing with related data
    const listing = await getFoodListing(params.id)
    if (!listing) {
      return errorResponse('Food listing not found', 404)
    }

    // Get donation requests if requested
    let donations = null
    if (includeDonations) {
      donations = await getDonations({
        listingId: params.id
      })
    }

    // Calculate time until expiry
    const expiryDate = new Date(listing.expiry_date)
    const now = new Date()
    const timeUntilExpiry = expiryDate.getTime() - now.getTime()
    const hoursUntilExpiry = Math.floor(timeUntilExpiry / (1000 * 60 * 60))

    return successResponse({
      ...listing,
      meta: {
        hoursUntilExpiry,
        isExpired: timeUntilExpiry < 0,
        isExpiringSoon: hoursUntilExpiry <= 24 && hoursUntilExpiry > 0
      },
      ...(includeDonations && { donations })
    })
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

    // Get current listing
    const currentListing = await getFoodListing(params.id)
    if (!currentListing) {
      return errorResponse('Food listing not found', 404)
    }

    // Verify ownership
    if (currentListing.user_id !== session.user.id) {
      return errorResponse('Not authorized to update this listing', 403)
    }

    const body = await request.json()

    // Validate expiry date if provided
    if (body.expiry_date) {
      const expiryDate = new Date(body.expiry_date)
      if (expiryDate < new Date()) {
        return errorResponse('Expiry date must be in the future')
      }
    }

    // Handle status changes
    if (body.status && body.status !== currentListing.status) {
      // Check if status change is valid
      const validTransitions = {
        available: ['reserved', 'completed'],
        reserved: ['available', 'completed'],
        completed: []
      }

      if (!validTransitions[currentListing.status].includes(body.status)) {
        return errorResponse(`Invalid status transition from ${currentListing.status} to ${body.status}`)
      }

      // Additional logic for status changes
      if (body.status === 'completed') {
        // You might want to update related donations or send notifications
      }
    }

    // Update the listing
    const listing = await updateFoodListing(params.id, {
      ...body,
      dietary_info: Array.isArray(body.dietary_info) ? body.dietary_info : currentListing.dietary_info
    })

    return successResponse(listing)
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

    // Get current listing
    const listing = await getFoodListing(params.id)
    if (!listing) {
      return errorResponse('Food listing not found', 404)
    }

    // Verify ownership
    if (listing.user_id !== session.user.id) {
      return errorResponse('Not authorized to delete this listing', 403)
    }

    // Check if listing has active donations
    const donations = await getDonations({ listingId: params.id })
    const hasActiveDonations = donations.some(d => 
      ['pending', 'accepted'].includes(d.status)
    )

    if (hasActiveDonations) {
      return errorResponse('Cannot delete listing with active donation requests', 400)
    }

    await deleteFoodListing(params.id)
    return successResponse({ message: 'Listing deleted successfully' })
  } catch (error: any) {
    return errorResponse(error.message)
  }
}
