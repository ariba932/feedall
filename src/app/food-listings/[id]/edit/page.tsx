'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FoodListingForm } from '@/components/food-listings/FoodListingForm'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { Database } from '@/lib/supabase/database.types'

type FoodListing = Database['public']['Tables']['food_listings']['Row']

export default function EditFoodListingPage({
  params,
}: {
  params: { id: string }
}) {
  const router = useRouter()
  const { toast } = useToast()
  const [listing, setListing] = useState<FoodListing | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const response = await fetch(`/api/food-listings/${params.id}`)
        const data = await response.json()

        if (response.ok) {
          setListing(data.data)
        } else {
          throw new Error(data.error)
        }
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to fetch listing',
          variant: 'destructive',
        })
        router.push('/food-listings')
      } finally {
        setIsLoading(false)
      }
    }

    fetchListing()
  }, [params.id, router, toast])

  const handleSubmit = async (data: any) => {
    try {
      const response = await fetch(`/api/food-listings/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const responseData = await response.json()

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Food listing updated successfully',
        })
        router.push('/food-listings')
      } else {
        throw new Error(responseData.error)
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update listing',
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

  if (!listing) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">Listing not found</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <Button
        variant="ghost"
        className="mb-4"
        onClick={() => router.push('/food-listings')}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Listings
      </Button>

      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Edit Food Listing</h1>
        <FoodListingForm initialData={listing} onSubmit={handleSubmit} />
      </div>
    </div>
  )
}
