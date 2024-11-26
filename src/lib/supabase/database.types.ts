import { ReactNode } from "react"

export type Profile = {
  address: ReactNode
  bio: string
  phone_number: string
  id: string
  created_at: string
  email: string
  full_name: string
  avatar_url?: string
  organization_name?: string
  role: 'donor' | 'recipient'
  status: 'pending' | 'approved' | 'rejected'
}

export type FoodListing = {
  id: string
  created_at: string
  user_id: string
  title: string
  description: string
  quantity: number
  expiry_date: string
  pickup_location: string
  status: 'available' | 'reserved' | 'completed'
  image_url?: string
}

export type Donation = {
  id: string
  created_at: string
  listing_id: string
  donor_id: string
  recipient_id: string
  status: 'pending' | 'accepted' | 'completed' | 'cancelled'
  pickup_time?: string
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'id' | 'created_at'>
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>
      }
      food_listings: {
        Row: FoodListing
        Insert: Omit<FoodListing, 'id' | 'created_at'>
        Update: Partial<Omit<FoodListing, 'id' | 'created_at'>>
      }
      donations: {
        Row: Donation
        Insert: Omit<Donation, 'id' | 'created_at'>
        Update: Partial<Omit<Donation, 'id' | 'created_at'>>
      }
    }
  }
}
