'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { DonationForm } from '@/components/donations/DonationForm'
import { useToast } from '@/components/ui/use-toast'
import { Database } from '@/lib/supabase/database.types'

type FoodListing = Database['public']['Tables']['food_listings']['Row']

export default function RequestDonationPage({
  params,
}: {
  params: { id: string }
}) {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClientComponentClient<Database>()
  const [foodListing, setFoodListing] = useState<FoodListing | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const fetchFoodListing = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
          router.push('/auth/login')
          return
        }

        const { data, error } = await supabase
          .from('food_listings')
          .select('*')
          .eq('id', params.id)
          .single()

        if (error) throw error

        // Check if the user is the donor
        if (data.donor_id === session.user.id) {
          toast({
            title: 'Error',
            description: 'You cannot request your own donation',
            variant: 'destructive',
          })
          router.push('/food-listings')
          return
        }

        setFoodListing(data)
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to fetch food listing',
          variant: 'destructive',
        })
        router.push('/food-listings')
      } finally {
        setIsLoading(false)
      }
    }

    fetchFoodListing()
  }, [supabase, router, params.id, toast])

  const handleSubmit = async (data: { notes?: string }) => {
    try {
      setIsSubmitting(true)
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session || !foodListing) {
        router.push('/auth/login')
        return
      }

      // Create donation request
      const { error } = await supabase
        .from('donations')
        .insert({
          food_listing_id: foodListing.id,
          donor_id: foodListing.donor_id,
          recipient_id: session.user.id,
          status: 'pending',
          notes: data.notes,
        })

      if (error) throw error

      toast({
        title: 'Success',
        description: 'Donation request submitted successfully',
      })

      router.push('/donations')
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit donation request',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading || !foodListing) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        <DonationForm
          foodListing={foodListing}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  )
}
