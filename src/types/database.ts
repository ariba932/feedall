export interface Profile {
  id: string
  email: string
  full_name?: string | null
  organization_name?: string | null
  phone_number?: string | null
  address?: string | null
  is_admin: boolean
  is_donor: boolean
  is_active: boolean
  onboarding_completed: boolean
  created_at: string
  updated_at: string
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at' | 'updated_at'>
        Update: Partial<Omit<Profile, 'id'>>
      }
    }
    Functions: {
      handle_new_user: {
        Args: Record<string, never>
        Returns: undefined
      }
    }
  }
}
