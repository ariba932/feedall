import { z } from 'zod';
import { addressSchema, imageSchema, dateRangeSchema } from './common.schema';

// Donation status enum
export const DonationStatus = z.enum([
  'PENDING',
  'CONFIRMED',
  'IN_TRANSIT',
  'DELIVERED',
  'COMPLETED',
  'CANCELLED',
]);

// Donation type enum
export const DonationType = z.enum([
  'MONETARY',
  'FOOD_ITEMS',
  'FOOD_PACKS',
  'EQUIPMENT',
]);

// Food item schema
export const foodItemSchema = z.object({
  name: z.string().min(1),
  quantity: z.number().positive(),
  unit: z.string().min(1),
  expiryDate: z.string().datetime().optional(),
  nutritionalInfo: z.record(z.string(), z.string()).optional(),
  allergens: z.array(z.string()).optional(),
  storageRequirements: z.string().optional(),
}).strict();

// Base donation schema
const donationBaseSchema = {
  donorId: z.string().uuid(),
  type: DonationType,
  status: DonationStatus.default('PENDING'),
  amount: z.number().positive().optional(),
  foodItems: z.array(foodItemSchema).optional(),
  description: z.string().min(1),
  pickupAddress: addressSchema,
  deliveryAddress: addressSchema,
  scheduledDate: dateRangeSchema,
  images: z.array(imageSchema).optional(),
  notes: z.string().optional(),
};

// Create donation schema
export const createDonationSchema = z.object({
  ...donationBaseSchema,
}).refine(
  (data) => {
    if (data.type === 'MONETARY' && !data.amount) {
      return false;
    }
    if (data.type === 'FOOD_ITEMS' && (!data.foodItems || data.foodItems.length === 0)) {
      return false;
    }
    return true;
  },
  {
    message: "Monetary donations require an amount, food donations require food items",
    path: ["type"],
  }
).strict();

// Update donation schema
export const updateDonationSchema = z.object({
  status: DonationStatus.optional(),
  amount: z.number().positive().optional(),
  foodItems: z.array(foodItemSchema).optional(),
  description: z.string().min(1).optional(),
  pickupAddress: addressSchema.optional(),
  deliveryAddress: addressSchema.optional(),
  scheduledDate: dateRangeSchema.optional(),
  images: z.array(imageSchema).optional(),
  notes: z.string().optional(),
}).strict();

// Donation query schema
export const donationQuerySchema = z.object({
  status: DonationStatus.optional(),
  type: DonationType.optional(),
  donorId: z.string().uuid().optional(),
  minAmount: z.number().optional(),
  maxAmount: z.number().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
}).strict();

// Export types
export type CreateDonation = z.infer<typeof createDonationSchema>;
export type UpdateDonation = z.infer<typeof updateDonationSchema>;
export type DonationQuery = z.infer<typeof donationQuerySchema>;
export type FoodItem = z.infer<typeof foodItemSchema>;
