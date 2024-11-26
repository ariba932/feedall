import { createClient } from './client'
import { Database } from './database.types'

export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export async function getProfile(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) throw error
  return data
}

export async function updateProfile(userId: string, update: ProfileUpdate) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('profiles')
    .update(update)
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function createProfile(profile: ProfileInsert) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('profiles')
    .insert(profile)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteProfile(userId: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', userId)

  if (error) throw error
}
