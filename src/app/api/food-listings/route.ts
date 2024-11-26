import { createServerClient } from '@/lib/supabase/server'
import { successResponse, errorResponse } from '@/lib/api-response'
import { getFoodListings, createFoodListing, getFoodListingStats } from '@/lib/supabase/food-listings'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Extract filter parameters
    const filter = {
      status: searchParams.get('status') as 'available' | 'reserved' | 'completed' | null,
      userId: searchParams.get('userId'),
      search: searchParams.get('search'),
      category: searchParams.get('category'),
      dietary_info: searchParams.getAll('dietary_info'),
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined,
      sortBy: searchParams.get('sortBy') as 'created_at' | 'expiry_date' | 'title' | undefined,
      sortOrder: searchParams.get('sortOrder') as 'asc' | 'desc' | undefined,
    }

    // Handle date filters
    const expiryBefore = searchParams.get('expiryBefore')
    const expiryAfter = searchParams.get('expiryAfter')
    if (expiryBefore) filter.expiryBefore = new Date(expiryBefore)
    if (expiryAfter) filter.expiryAfter = new Date(expiryAfter)

    // Handle location-based search
    const lat = searchParams.get('latitude')
    const lng = searchParams.get('longitude')
    const radius = searchParams.get('radius')
    if (lat && lng && radius) {
      filter.location = {
        latitude: parseFloat(lat),
        longitude: parseFloat(lng),
        radius: parseFloat(radius)
      }
    }

    // Get statistics if requested
    const includeStats = searchParams.get('includeStats') === 'true'
    const [listings, stats] = await Promise.all([
      getFoodListings(filter),
      includeStats ? getFoodListingStats() : null
    ])

    return successResponse({
      listings,
      ...(includeStats && { stats }),
      pagination: {
        offset: filter.offset || 0,
        limit: filter.limit || 10,
        total: listings.length // Note: This should be updated to get actual total count
      }
    })
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

    // Validate required fields
    const requiredFields = ['title', 'description', 'quantity', 'expiry_date', 'pickup_location']
    const missingFields = requiredFields.filter(field => !body[field])
    if (missingFields.length > 0) {
      return errorResponse(`Missing required fields: ${missingFields.join(', ')}`)
    }

    // Validate expiry date
    const expiryDate = new Date(body.expiry_date)
    if (expiryDate < new Date()) {
      return errorResponse('Expiry date must be in the future')
    }

    // Create the listing
    const listing = await createFoodListing({
      user_id: session.user.id,
      ...body,
      dietary_info: Array.isArray(body.dietary_info) ? body.dietary_info : []
    })

    return successResponse(listing, 201)
  } catch (error: any) {
    return errorResponse(error.message)
  }
}
