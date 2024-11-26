import { FC } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
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

type FoodListing = Database['public']['Tables']['food_listings']['Row']

const foodListingSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  quantity: z.string().min(1, 'Quantity is required'),
  pickup_location: z.string().min(5, 'Pickup location must be at least 5 characters'),
  expiry_date: z.string().refine((date) => new Date(date) > new Date(), {
    message: 'Expiry date must be in the future',
  }),
  category: z.string().min(1, 'Category is required'),
  dietary_info: z.array(z.string()).optional(),
})

interface FoodListingFormProps {
  initialData?: Partial<FoodListing>
  onSubmit: (data: z.infer<typeof foodListingSchema>) => void
  isLoading?: boolean
}

const CATEGORIES = [
  'Produce',
  'Dairy',
  'Bakery',
  'Meat',
  'Pantry',
  'Prepared Meals',
  'Other',
]

const DIETARY_INFO = [
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Dairy-Free',
  'Nut-Free',
  'Halal',
  'Kosher',
]

export const FoodListingForm: FC<FoodListingFormProps> = ({
  initialData,
  onSubmit,
  isLoading = false,
}) => {
  const form = useForm<z.infer<typeof foodListingSchema>>({
    resolver: zodResolver(foodListingSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      quantity: initialData?.quantity || '',
      pickup_location: initialData?.pickup_location || '',
      expiry_date: initialData?.expiry_date
        ? new Date(initialData.expiry_date).toISOString().split('T')[0]
        : '',
      category: initialData?.category || '',
      dietary_info: initialData?.dietary_info || [],
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Fresh vegetables from our garden" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Describe what you're donating and any special handling instructions"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantity</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g., 5 kg, 3 boxes" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="expiry_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Expiry Date</FormLabel>
                <FormControl>
                  <Input {...field} type="date" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="pickup_location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pickup Location</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter the pickup address" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dietary_info"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dietary Information</FormLabel>
              <div className="flex flex-wrap gap-2">
                {DIETARY_INFO.map((info) => (
                  <Button
                    key={info}
                    type="button"
                    variant={field.value?.includes(info) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      const newValue = field.value?.includes(info)
                        ? field.value.filter((i) => i !== info)
                        : [...(field.value || []), info]
                      field.onChange(newValue)
                    }}
                  >
                    {info}
                  </Button>
                ))}
              </div>
              <FormDescription>
                Select all that apply
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Saving...' : initialData ? 'Update Listing' : 'Create Listing'}
        </Button>
      </form>
    </Form>
  )
}
