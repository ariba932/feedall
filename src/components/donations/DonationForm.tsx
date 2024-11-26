import { FC } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/Button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { Database } from '@/lib/supabase/database.types'

type FoodListing = Database['public']['Tables']['food_listings']['Row']

const donationSchema = z.object({
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
})

type DonationFormValues = z.infer<typeof donationSchema>

interface DonationFormProps {
  foodListing: FoodListing
  onSubmit: (data: DonationFormValues) => void
  isSubmitting?: boolean
}

export const DonationForm: FC<DonationFormProps> = ({
  foodListing,
  onSubmit,
  isSubmitting = false,
}) => {
  const form = useForm<DonationFormValues>({
    resolver: zodResolver(donationSchema),
    defaultValues: {
      notes: '',
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">Request Donation</h3>
            <p className="text-sm text-gray-500 mt-1">
              You are requesting a donation for &quot;{foodListing.title}&quot;
            </p>
          </div>

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes (Optional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Add any notes for the donor (e.g., pickup time preferences, special handling instructions)"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
