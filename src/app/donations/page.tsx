'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { DonationCard } from '@/components/donations/DonationCard'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/use-toast'
import { Database } from '@/lib/supabase/database.types'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

type Donation = Database['public']['Tables']['donations']['Row']
type Profile = Database['public']['Tables']['profiles']['Row']

export default function DonationsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClientComponentClient<Database>()
  const [donations, setDonations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userProfile, setUserProfile] = useState<Profile | null>(null)

  useEffect(() => {
    const fetchUserProfileAndDonations = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
          router.push('/auth/login')
          return
        }

        // Fetch user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        setUserProfile(profile)

        // Fetch donations based on user role
        const query = supabase
          .from('donations')
          .select(\`
            *,
            food_listing:food_listings(*),
            donor_profile:profiles!donations_donor_id_fkey(full_name, organization_name),
            recipient_profile:profiles!donations_recipient_id_fkey(full_name, organization_name)
          \`)
          .order('created_at', { ascending: false })

        if (profile?.role === 'donor') {
          query.eq('donor_id', session.user.id)
        } else {
          query.eq('recipient_id', session.user.id)
        }

        const { data: donationsData, error } = await query

        if (error) throw error

        setDonations(donationsData)
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to fetch donations',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserProfileAndDonations()
  }, [supabase, router, toast])

  const handleDonationAction = async (donationId: string, action: string) => {
    try {
      const { error } = await supabase
        .from('donations')
        .update({ status: action })
        .eq('id', donationId)

      if (error) throw error

      // Refresh donations
      const { data: updatedDonation } = await supabase
        .from('donations')
        .select(\`
          *,
          food_listing:food_listings(*),
          donor_profile:profiles!donations_donor_id_fkey(full_name, organization_name),
          recipient_profile:profiles!donations_recipient_id_fkey(full_name, organization_name)
        \`)
        .eq('id', donationId)
        .single()

      setDonations(donations.map(d => 
        d.id === donationId ? updatedDonation : d
      ))

      toast({
        title: 'Success',
        description: \`Donation ${action} successfully\`,
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || \`Failed to ${action} donation\`,
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

  const filterDonations = (status: string) => {
    return donations.filter(donation => 
      status === 'active' 
        ? ['pending', 'accepted'].includes(donation.status)
        : ['completed', 'declined', 'cancelled'].includes(donation.status)
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">
          {userProfile?.role === 'donor' ? 'Donation Requests' : 'My Requests'}
        </h1>
        {userProfile?.role === 'recipient' && (
          <Button onClick={() => router.push('/food-listings')}>
            Browse Food Listings
          </Button>
        )}
      </div>

      <Tabs defaultValue="active" className="space-y-6">
        <TabsList>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {filterDonations('active').length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No active donations found
            </div>
          ) : (
            filterDonations('active').map((donation) => (
              <DonationCard
                key={donation.id}
                donation={donation}
                userRole={userProfile?.role}
                onAccept={() => handleDonationAction(donation.id, 'accepted')}
                onDecline={() => handleDonationAction(donation.id, 'declined')}
                onCancel={() => handleDonationAction(donation.id, 'cancelled')}
                onComplete={() => handleDonationAction(donation.id, 'completed')}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {filterDonations('past').length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No past donations found
            </div>
          ) : (
            filterDonations('past').map((donation) => (
              <DonationCard
                key={donation.id}
                donation={donation}
                userRole={userProfile?.role}
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
