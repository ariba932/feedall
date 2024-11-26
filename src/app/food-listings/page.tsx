'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FoodListingCard } from '@/components/food-listings/FoodListingCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { Database } from '@/lib/supabase/database.types'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

type FoodListing = Database['public']['Tables']['food_listings']['Row'] & {
  meta?: {
    hoursUntilExpiry: number
    isExpired: boolean
    isExpiringSoon: boolean
  }
}

const CATEGORIES = [
  'All',
  'Produce',
  'Dairy',
  'Bakery',
  'Meat',
  'Pantry',
  'Prepared Meals',
  'Other',
]

export default function FoodListingsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClientComponentClient<Database>()
  const [listings, setListings] = useState<FoodListing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState({
    search: '',
    category: 'All',
    status: 'available' as const,
  })

  const fetchListings = async () => {
    try {
      setIsLoading(true)
      const searchParams = new URLSearchParams()
      
      if (filters.search) searchParams.set('search', filters.search)
      if (filters.category !== 'All') searchParams.set('category', filters.category)
      if (filters.status) searchParams.set('status', filters.status)
      
      const response = await fetch(`/api/food-listings?${searchParams.toString()}`)
      const data = await response.json()
      
      if (response.ok) {
        setListings(data.data.listings)
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch listings',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleReserve = async (listingId: string) => {
    try {
      const response = await fetch(`/api/food-listings/${listingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'reserved' }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Food listing reserved successfully',
        })
        fetchListings()
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to reserve listing',
        variant: 'destructive',
      })
    }
  }

  const handleDelete = async (listingId: string) => {
    try {
      const response = await fetch(`/api/food-listings/${listingId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Food listing deleted successfully',
        })
        fetchListings()
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete listing',
        variant: 'destructive',
      })
    }
  }

  useEffect(() => {
    fetchListings()
  }, [filters])

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Food Listings</h1>
        <Button onClick={() => router.push('/food-listings/new')}>
          Create New Listing
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Input
          placeholder="Search listings..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
        <Select
          value={filters.category}
          onValueChange={(value) => setFilters({ ...filters, category: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filters.status}
          onValueChange={(value: 'available' | 'reserved' | 'completed') =>
            setFilters({ ...filters, status: value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="reserved">Reserved</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading...</div>
      ) : listings.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No food listings found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <FoodListingCard
              key={listing.id}
              listing={listing}
              onReserve={() => handleReserve(listing.id)}
              onEdit={() => router.push(`/food-listings/${listing.id}/edit`)}
              onDelete={() => handleDelete(listing.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
