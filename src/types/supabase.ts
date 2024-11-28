export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          phone: string
          address: string
          city: string
          state: string
          postal_code: string
          country: string
          organization_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name: string
          phone: string
          address: string
          city: string
          state: string
          postal_code: string
          country: string
          organization_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          phone?: string
          address?: string
          city?: string
          state?: string
          postal_code?: string
          country?: string
          organization_name?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      business_profiles: {
        Row: {
          id: string
          user_id: string
          tax_id: string
          business_type: string
          registration_number: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          tax_id: string
          business_type: string
          registration_number: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          tax_id?: string
          business_type?: string
          registration_number?: string
          created_at?: string
          updated_at?: string
        }
      }
      kyc_documents: {
        Row: {
          id: string
          user_id: string
          document_type: string
          document_url: string
          status: 'PENDING_VERIFICATION' | 'VERIFIED' | 'REJECTED'
          verified_at: string | null
          verified_by: string | null
          rejection_reason: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          document_type: string
          document_url: string
          status?: 'PENDING_VERIFICATION' | 'VERIFIED' | 'REJECTED'
          verified_at?: string | null
          verified_by?: string | null
          rejection_reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          document_type?: string
          document_url?: string
          status?: 'PENDING_VERIFICATION' | 'VERIFIED' | 'REJECTED'
          verified_at?: string | null
          verified_by?: string | null
          rejection_reason?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      assign_role: {
        Args: {
          target_user_id: string
          role_name: string
        }
        Returns: undefined
      }
    }
    Enums: {
      document_status: 'PENDING_VERIFICATION' | 'VERIFIED' | 'REJECTED'
    }
  }
}
