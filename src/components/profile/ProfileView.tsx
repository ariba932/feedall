import { FC } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/Button'
import { Database } from '@/lib/supabase/database.types'
import { UserCircle, Building2, Phone, MapPin, Mail } from 'lucide-react'

type Profile = Database['public']['Tables']['profiles']['Row']

interface ProfileViewProps {
  profile: Profile
  onEdit?: () => void
}

export const ProfileView: FC<ProfileViewProps> = ({ profile, onEdit }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Profile Information</CardTitle>
        {onEdit && (
          <Button variant="outline" onClick={onEdit}>
            Edit Profile
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <UserCircle className="w-5 h-5 text-gray-500" />
          <div>
            <div className="font-medium">{profile.full_name}</div>
            <div className="text-sm text-gray-500">
              {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
            </div>
          </div>
        </div>

        {profile.organization_name && (
          <div className="flex items-center gap-3">
            <Building2 className="w-5 h-5 text-gray-500" />
            <div>
              <div className="font-medium">{profile.organization_name}</div>
              <div className="text-sm text-gray-500">Organization</div>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3">
          <Mail className="w-5 h-5 text-gray-500" />
          <div>
            <div className="font-medium">{profile.email}</div>
            <div className="text-sm text-gray-500">Email</div>
          </div>
        </div>

        {profile.phone_number && (
          <div className="flex items-center gap-3">
            <Phone className="w-5 h-5 text-gray-500" />
            <div>
              <div className="font-medium">{profile.phone_number}</div>
              <div className="text-sm text-gray-500">Phone</div>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3">
          <MapPin className="w-5 h-5 text-gray-500" />
          <div>
            <div className="font-medium">{profile.address}</div>
            <div className="text-sm text-gray-500">Address</div>
          </div>
        </div>

        {profile.bio && (
          <div className="pt-4 border-t">
            <div className="font-medium mb-2">About</div>
            <div className="text-gray-600">{profile.bio}</div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
