import { FC } from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/Button'
import { Clock, Calendar } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Database } from '@/lib/supabase/database.types'

type Donation = Database['public']['Tables']['donations']['Row']
type FoodListing = Database['public']['Tables']['food_listings']['Row']

interface DonationCardProps {
  donation: Donation & {
    food_listing?: FoodListing
    donor_profile?: { full_name: string; organization_name?: string }
    recipient_profile?: { full_name: string; organization_name?: string }
    notes?: string
  }
  userRole?: 'donor' | 'recipient'
  onAccept?: () => void
  onDecline?: () => void
  onCancel?: () => void
  onComplete?: () => void
}

export const DonationCard: FC<DonationCardProps> = ({
  donation,
  userRole,
  onAccept,
  onDecline,
  onCancel,
  onComplete,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'accepted':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'declined':
        return 'bg-red-100 text-red-800'
      case 'cancelled':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const renderActionButtons = () => {
    if (!userRole) return null

    switch (donation.status) {
      case 'pending':
        return userRole === 'donor' ? (
          <div className="flex gap-2">
            <Button onClick={onAccept} variant="primary">
              Accept
            </Button>
            <Button onClick={onDecline} variant="secondary">
              Decline
            </Button>
          </div>
        ) : (
          <Button onClick={onCancel} variant="outline">
            Cancel Request
          </Button>
        )
      case 'accepted':
        return userRole === 'donor' ? (
          <Button onClick={onComplete} variant="primary">
            Mark as Completed
          </Button>
        ) : null
      default:
        return null
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{donation.food_listing?.title}</CardTitle>
            <div className="text-sm text-gray-500 mt-1">
              {userRole === 'donor'
                ? `Requested by: ${donation.recipient_profile?.full_name}`
                : `Donor: ${donation.donor_profile?.full_name}`}
              {(userRole === 'donor'
                ? donation.recipient_profile?.organization_name
                : donation.donor_profile?.organization_name) && (
                <span className="block text-xs">
                  {userRole === 'donor'
                    ? `Organization: ${donation.recipient_profile?.organization_name}`
                    : `Organization: ${donation.donor_profile?.organization_name}`}
                </span>
              )}
            </div>
          </div>
          <Badge className={getStatusColor(donation.status)}>
            {donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {donation.food_listing && (
            <>
              <div className="text-sm">
                {donation.food_listing.description}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                <span>
                  Expires {formatDistanceToNow(new Date(donation.food_listing.expiry_date))} from now
                </span>
              </div>
            </>
          )}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="w-4 h-4" />
            <span>
              Requested {formatDistanceToNow(new Date(donation.created_at))} ago
            </span>
          </div>
          {donation.notes && (
            <div className="mt-4 p-3 bg-gray-50 rounded-md">
              <div className="text-sm font-medium mb-1">Notes</div>
              <div className="text-sm text-gray-600">{donation.notes}</div>
            </div>
          )}
        </div>
      </CardContent>
      {renderActionButtons() && (
        <CardFooter className="flex justify-end">{renderActionButtons()}</CardFooter>
      )}
    </Card>
  )
}
