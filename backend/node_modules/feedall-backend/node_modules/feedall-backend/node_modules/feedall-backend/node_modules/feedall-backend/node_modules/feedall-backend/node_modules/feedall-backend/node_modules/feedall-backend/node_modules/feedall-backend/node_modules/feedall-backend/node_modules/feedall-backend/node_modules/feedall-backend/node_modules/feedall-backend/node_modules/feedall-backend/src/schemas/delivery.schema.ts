import { z } from 'zod';
import { addressSchema, imageSchema } from './common.schema';

// Delivery status enum
export const DeliveryStatus = z.enum([
  'PENDING',
  'ASSIGNED',
  'PICKED_UP',
  'IN_TRANSIT',
  'DELIVERED',
  'CANCELLED',
]);

// Vehicle type enum
export const VehicleType = z.enum([
  'MOTORCYCLE',
  'CAR',
  'VAN',
  'TRUCK',
  'REFRIGERATED_TRUCK',
]);

// Delivery proof schema
export const deliveryProofSchema = z.object({
  images: z.array(imageSchema),
  signature: z.string(),
  notes: z.string().optional(),
  temperature: z.number().optional(), // For temperature-sensitive deliveries
  timestamp: z.string().datetime(),
}).strict();

// Base delivery schema
const deliveryBaseSchema = {
  logisticsId: z.string().uuid(),
  donationId: z.string().uuid().optional(),
  foodPackId: z.string().uuid().optional(),
  feedingNeedId: z.string().uuid().optional(),
  status: DeliveryStatus.default('PENDING'),
  pickupAddress: addressSchema,
  deliveryAddress: addressSchema,
  scheduledPickupTime: z.string().datetime(),
  scheduledDeliveryTime: z.string().datetime(),
  actualPickupTime: z.string().datetime().optional(),
  actualDeliveryTime: z.string().datetime().optional(),
  vehicleType: VehicleType,
  temperature: z.number().optional(), // For temperature-controlled deliveries
  weight: z.number().positive(),
  specialInstructions: z.string().optional(),
  recipientName: z.string(),
  recipientPhone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format'),
  deliveryProof: deliveryProofSchema.optional(),
};

// Create delivery schema
export const createDeliverySchema = z.object({
  ...deliveryBaseSchema,
}).refine(
  (data) => {
    // Ensure at least one of donationId, foodPackId, or feedingNeedId is provided
    return !!(data.donationId || data.foodPackId || data.feedingNeedId);
  },
  {
    message: "At least one of donationId, foodPackId, or feedingNeedId must be provided",
    path: ["donationId"],
  }
).refine(
  (data) => {
    // Ensure scheduled delivery time is after pickup time
    return new Date(data.scheduledDeliveryTime) > new Date(data.scheduledPickupTime);
  },
  {
    message: "Scheduled delivery time must be after pickup time",
    path: ["scheduledDeliveryTime"],
  }
).strict();

// Update delivery schema
export const updateDeliverySchema = z.object({
  status: DeliveryStatus.optional(),
  scheduledPickupTime: z.string().datetime().optional(),
  scheduledDeliveryTime: z.string().datetime().optional(),
  actualPickupTime: z.string().datetime().optional(),
  actualDeliveryTime: z.string().datetime().optional(),
  vehicleType: VehicleType.optional(),
  temperature: z.number().optional(),
  specialInstructions: z.string().optional(),
  recipientName: z.string().optional(),
  recipientPhone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format').optional(),
  deliveryProof: deliveryProofSchema.optional(),
}).strict();

// Delivery query schema
export const deliveryQuerySchema = z.object({
  logisticsId: z.string().uuid().optional(),
  donationId: z.string().uuid().optional(),
  foodPackId: z.string().uuid().optional(),
  feedingNeedId: z.string().uuid().optional(),
  status: DeliveryStatus.optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  vehicleType: VehicleType.optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
}).strict();

// Export types
export type CreateDelivery = z.infer<typeof createDeliverySchema>;
export type UpdateDelivery = z.infer<typeof updateDeliverySchema>;
export type DeliveryQuery = z.infer<typeof deliveryQuerySchema>;
export type DeliveryProof = z.infer<typeof deliveryProofSchema>;
