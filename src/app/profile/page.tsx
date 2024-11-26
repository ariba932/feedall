'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ProfileForm } from '@/components/profile/ProfileForm'
import { ProfileView } from '@/components/profile/ProfileView'
import { useToast } from '@/components/ui/use-toast'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/lib/supabase/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']

export default function ProfilePage() {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClientComponentClient<Database>()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
          router.push('/auth/login')
          return
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (error) throw error

        if (!data) {
          // If no profile exists, switch to edit mode
          setIsEditing(true)
        }

        setProfile(data)
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to fetch profile',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [supabase, router, toast])

  const handleSubmit = async (data: any) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/auth/login')
        return
      }

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: session.user.id,
          updated_at: new Date().toISOString(),
          ...data,
        })

      if (error) throw error

      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      })

      // Refresh profile data
      const { data: updatedProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      setProfile(updatedProfile)
      setIsEditing(false)
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update profile',
        variant: 'destructive',
      })
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Your Profile</h1>
        {isEditing ? (
          <ProfileForm
            initialData={profile || undefined}
            onSubmit={handleSubmit}
          />
        ) : (
          profile && (
            <ProfileView
              profile={profile}
              onEdit={() => setIsEditing(true)}
            />
          )
        )}
      </div>
    </div>
  )
}
