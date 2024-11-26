import { createClient } from './client'
import { Database } from './database.types'

export type FoodListing = Database['public']['Tables']['food_listings']['Row']
export type FoodListingInsert = Database['public']['Tables']['food_listings']['Insert']
export type FoodListingUpdate = Database['public']['Tables']['food_listings']['Update']

export type FoodListingFilter = {
  status?: 'available' | 'reserved' | 'completed'
  userId?: string
  search?: string
  category?: string
  dietary_info?: string[]
  expiryBefore?: Date
  expiryAfter?: Date
  limit?: number
  offset?: number
  sortBy?: 'created_at' | 'expiry_date' | 'title'
  sortOrder?: 'asc' | 'desc'
  location?: {
    latitude: number
    longitude: number
    radius: number // in kilometers
  }
}

export async function getFoodListings(filter: FoodListingFilter = {}) {
  const supabase = createClient()
  let query = supabase.from('food_listings').select(`
    *,
    profiles:user_id (
      id,
      full_name,
      organization_name,
      avatar_url
    )
  `)

  // Status filter
  if (filter.status) {
    query = query.eq('status', filter.status)
  }

  // User filter
  if (filter.userId) {
    query = query.eq('user_id', filter.userId)
  }

  // Text search across title and description
  if (filter.search) {
    query = query.or(
      `title.ilike.%${filter.search}%,description.ilike.%${filter.search}%`
    )
  }

  // Category filter
  if (filter.category) {
    query = query.eq('category', filter.category)
  }

  // Dietary info filter (array contains)
  if (filter.dietary_info && filter.dietary_info.length > 0) {
    query = query.contains('dietary_info', filter.dietary_info)
  }

  // Expiry date range
  if (filter.expiryBefore) {
    query = query.lte('expiry_date', filter.expiryBefore.toISOString())
  }
  if (filter.expiryAfter) {
    query = query.gte('expiry_date', filter.expiryAfter.toISOString())
  }

  // Location-based search (if coordinates provided)
  if (filter.location) {
    const { latitude, longitude, radius } = filter.location
    query = query
      .lt('earth_distance(ll_to_earth(${latitude}, ${longitude}), ll_to_earth(latitude, longitude))', radius * 1000)
  }

  // Sorting
  const sortBy = filter.sortBy || 'created_at'
  const sortOrder = filter.sortOrder || 'desc'
  query = query.order(sortBy, { ascending: sortOrder === 'asc' })

  // Pagination
  if (filter.limit) {
    query = query.limit(filter.limit)
  }
  if (filter.offset) {
    query = query.range(filter.offset, filter.offset + (filter.limit || 10) - 1)
  }

  const { data, error } = await query

  if (error) throw error
  return data
}

// Get food listing statistics
export async function getFoodListingStats() {
  const supabase = createClient()
  const stats = await Promise.all([
    // Total available listings
    supabase
      .from('food_listings')
      .select('id', { count: 'exact' })
      .eq('status', 'available'),
    
    // Listings by category
    supabase
      .from('food_listings')
      .select('category')
      .eq('status', 'available')
      .then(({ data }) => {
        const categories: Record<string, number> = {}
        data?.forEach(item => {
          if (item.category) {
            categories[item.category] = (categories[item.category] || 0) + 1
          }
        })
        return categories
      }),

    // Listings expiring soon (within 24 hours)
    supabase
      .from('food_listings')
      .select('id', { count: 'exact' })
      .eq('status', 'available')
      .lte('expiry_date', new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString())
  ])

  return {
    totalAvailable: stats[0].count,
    categoryCounts: stats[1],
    expiringSoon: stats[2].count
  }
}

export async function getFoodListing(id: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('food_listings')
    .select(`
      *,
      profiles:user_id (
        id,
        full_name,
        organization_name,
        avatar_url
      ),
      donations (
        id,
        status,
        recipient:recipient_id (
          id,
          full_name,
          organization_name
        )
      )
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createFoodListing(listing: FoodListingInsert) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('food_listings')
    .insert(listing)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateFoodListing(id: string, update: FoodListingUpdate) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('food_listings')
    .update(update)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteFoodListing(id: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('food_listings')
    .delete()
    .eq('id', id)

  if (error) throw error
}
