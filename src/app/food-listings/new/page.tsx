'use client'

import { useRouter } from 'next/navigation'
import { FoodListingForm } from '@/components/food-listings/FoodListingForm'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function NewFoodListingPage() {
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (data: any) => {
    try {
      const response = await fetch('/api/food-listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const responseData = await response.json()

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Food listing created successfully',
        })
        router.push('/food-listings')
      } else {
        throw new Error(responseData.error)
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create listing',
        variant: 'destructive',
      })
    }
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
        <h1 className="text-3xl font-bold mb-8">Create New Food Listing</h1>
        <FoodListingForm onSubmit={handleSubmit} />
      </div>
    </div>
  )
}
