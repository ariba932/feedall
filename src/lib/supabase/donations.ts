import { createClient } from './client'
import { Database } from './database.types'

export type Donation = Database['public']['Tables']['donations']['Row']
export type DonationInsert = Database['public']['Tables']['donations']['Insert']
export type DonationUpdate = Database['public']['Tables']['donations']['Update']

export async function getDonations(options?: {
  status?: 'pending' | 'accepted' | 'completed' | 'cancelled'
  userId?: string
  limit?: number
  offset?: number
}) {
  const supabase = createClient()
  let query = supabase.from('donations').select(`
    *,
    food_listing:listing_id (*),
    donor:donor_id (
      id,
      full_name,
      organization_name,
      avatar_url
    ),
    recipient:recipient_id (
      id,
      full_name,
      organization_name,
      avatar_url
    )
  `)

  if (options?.status) {
    query = query.eq('status', options.status)
  }

  if (options?.userId) {
    query = query.or(`donor_id.eq.${options.userId},recipient_id.eq.${options.userId}`)
  }

  query = query.order('created_at', { ascending: false })

  if (options?.limit) {
    query = query.limit(options.limit)
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
  }

  const { data, error } = await query

  if (error) throw error
  return data
}

export async function getDonation(id: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('donations')
    .select(`
      *,
      food_listing:listing_id (*),
      donor:donor_id (
        id,
        full_name,
        organization_name,
        avatar_url
      ),
      recipient:recipient_id (
        id,
        full_name,
        organization_name,
        avatar_url
      )
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createDonation(donation: DonationInsert) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('donations')
    .insert(donation)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateDonation(id: string, update: DonationUpdate) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('donations')
    .update(update)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteDonation(id: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('donations')
    .delete()
    .eq('id', id)

  if (error) throw error
}
