import { FC } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/Button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Database } from '@/lib/supabase/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']

const profileSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  organization_name: z.string().optional(),
  phone_number: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .optional(),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  role: z.enum(['donor', 'recipient']),
  bio: z.string().optional(),
})

interface ProfileFormProps {
  initialData?: Partial<Profile>
  onSubmit: (data: z.infer<typeof profileSchema>) => void
  isLoading?: boolean
}

export const ProfileForm: FC<ProfileFormProps> = ({
  initialData,
  onSubmit,
  isLoading = false,
}) => {
  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: initialData?.full_name || '',
      organization_name: initialData?.organization_name || '',
      phone_number: initialData?.phone_number || '',
      address: initialData?.address || '',
      role: initialData?.role || 'recipient',
      bio: initialData?.bio || '',
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="full_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="John Doe" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="organization_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Organization Name (Optional)</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Your organization name" />
              </FormControl>
              <FormDescription>
                If you're representing an organization, enter its name here
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="phone_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number (Optional)</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="+1234567890" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="donor">Food Donor</SelectItem>
                    <SelectItem value="recipient">Food Recipient</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter your address" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Tell us a bit about yourself or your organization"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Profile'}
        </Button>
      </form>
    </Form>
  )
}
