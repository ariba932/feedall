import { FC } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CalendarIcon, MapPinIcon, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Database } from '@/lib/supabase/database.types'

type FoodListing = Database['public']['Tables']['food_listings']['Row']

interface FoodListingCardProps {
  listing: FoodListing & {
    meta?: {
      hoursUntilExpiry: number
      isExpired: boolean
      isExpiringSoon: boolean
      dietary_info: string[]
    }
  }
  onReserve?: () => void
  onEdit?: () => void
  onDelete?: () => void
  showActions?: boolean
}

export const FoodListingCard: FC<FoodListingCardProps> = ({
  listing,
  onReserve,
  onEdit,
  onDelete,
  showActions = true,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800'
      case 'reserved':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const dietaryInfo = listing.meta?.dietary_info || []

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{listing.title}</CardTitle>
            <CardDescription>{listing.description}</CardDescription>
          </div>
          <Badge className={getStatusColor(listing.status)}>{listing.status}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <MapPinIcon className="w-4 h-4" />
            <span>{listing.pickup_location}</span>
          </div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4" />
            <span>Expires {formatDistanceToNow(new Date(listing.expiry_date))} from now</span>
          </div>
          {listing.meta?.isExpiringSoon && !listing.meta.isExpired && (
            <div className="flex items-center gap-2 text-yellow-600">
              <Clock className="w-4 h-4" />
              <span>Expiring soon! ({listing.meta.hoursUntilExpiry} hours left)</span>
            </div>
          )}
          {dietaryInfo.length > 0 && (
            <div className="flex gap-2 flex-wrap mt-2">
              {dietaryInfo.map((info) => (
                <Badge key={info} variant="outline">
                  {info}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
      {showActions && (
        <CardFooter className="flex justify-end gap-2">
          {listing.status === 'available' && onReserve && (
            <Button onClick={onReserve} variant="default">
              Reserve
            </Button>
          )}
          {onEdit && (
            <Button onClick={onEdit} variant="outline">
              Edit
            </Button>
          )}
          {onDelete && (
            <Button onClick={onDelete} variant="destructive">
              Delete
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  )
}
