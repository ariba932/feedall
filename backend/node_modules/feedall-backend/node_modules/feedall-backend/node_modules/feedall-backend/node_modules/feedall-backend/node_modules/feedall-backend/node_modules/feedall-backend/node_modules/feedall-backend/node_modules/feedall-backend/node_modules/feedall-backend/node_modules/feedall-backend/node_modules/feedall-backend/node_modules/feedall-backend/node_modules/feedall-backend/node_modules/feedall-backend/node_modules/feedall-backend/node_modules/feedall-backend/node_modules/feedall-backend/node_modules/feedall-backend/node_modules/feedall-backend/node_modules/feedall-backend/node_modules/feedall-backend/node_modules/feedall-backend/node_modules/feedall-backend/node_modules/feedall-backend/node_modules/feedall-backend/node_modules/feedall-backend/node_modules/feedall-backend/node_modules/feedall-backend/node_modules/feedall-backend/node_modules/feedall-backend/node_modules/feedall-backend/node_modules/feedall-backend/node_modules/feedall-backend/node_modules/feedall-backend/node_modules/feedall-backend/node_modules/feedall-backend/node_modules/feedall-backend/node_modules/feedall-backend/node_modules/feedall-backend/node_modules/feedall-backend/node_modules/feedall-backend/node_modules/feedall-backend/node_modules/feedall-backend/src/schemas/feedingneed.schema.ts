import { z } from 'zod';
import { addressSchema, imageSchema, dateRangeSchema } from './common.schema';

// Feeding need status enum
export const FeedingNeedStatus = z.enum([
  'OPEN',
  'IN_PROGRESS',
  'FULFILLED',
  'CANCELLED',
]);

// Feeding need priority enum
export const FeedingNeedPriority = z.enum([
  'LOW',
  'MEDIUM',
  'HIGH',
  'URGENT',
]);

// Beneficiary schema
export const beneficiarySchema = z.object({
  ageGroup: z.enum(['CHILDREN', 'ADULTS', 'ELDERLY', 'MIXED']),
  count: z.number().positive(),
  specialNeeds: z.array(z.string()).optional(),
  dietaryRestrictions: z.array(z.string()).optional(),
}).strict();

// Base feeding need schema
const feedingNeedBaseSchema = {
  ngoId: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().min(1),
  status: FeedingNeedStatus.default('OPEN'),
  priority: FeedingNeedPriority,
  targetAmount: z.number().positive(),
  raisedAmount: z.number().nonnegative().default(0),
  beneficiaries: beneficiarySchema,
  location: addressSchema,
  timeline: dateRangeSchema,
  images: z.array(imageSchema).optional(),
  requiredFoodTypes: z.array(z.string()),
  dietaryRequirements: z.array(z.string()).optional(),
  frequencyOfNeed: z.enum(['ONCE', 'DAILY', 'WEEKLY', 'MONTHLY']),
  impactDescription: z.string(),
  additionalNotes: z.string().optional(),
};

// Create feeding need schema
export const createFeedingNeedSchema = z.object({
  ...feedingNeedBaseSchema,
}).strict();

// Update feeding need schema
export const updateFeedingNeedSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  status: FeedingNeedStatus.optional(),
  priority: FeedingNeedPriority.optional(),
  targetAmount: z.number().positive().optional(),
  raisedAmount: z.number().nonnegative().optional(),
  beneficiaries: beneficiarySchema.optional(),
  location: addressSchema.optional(),
  timeline: dateRangeSchema.optional(),
  images: z.array(imageSchema).optional(),
  requiredFoodTypes: z.array(z.string()).optional(),
  dietaryRequirements: z.array(z.string()).optional(),
  frequencyOfNeed: z.enum(['ONCE', 'DAILY', 'WEEKLY', 'MONTHLY']).optional(),
  impactDescription: z.string().optional(),
  additionalNotes: z.string().optional(),
}).strict();

// Feeding need query schema
export const feedingNeedQuerySchema = z.object({
  ngoId: z.string().uuid().optional(),
  status: FeedingNeedStatus.optional(),
  priority: FeedingNeedPriority.optional(),
  minTargetAmount: z.number().optional(),
  maxTargetAmount: z.number().optional(),
  location: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  frequencyOfNeed: z.enum(['ONCE', 'DAILY', 'WEEKLY', 'MONTHLY']).optional(),
  search: z.string().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
}).strict();

// Contribution schema
export const contributionSchema = z.object({
  donorId: z.string().uuid(),
  amount: z.number().positive(),
  message: z.string().optional(),
}).strict();

// Export types
export type CreateFeedingNeed = z.infer<typeof createFeedingNeedSchema>;
export type UpdateFeedingNeed = z.infer<typeof updateFeedingNeedSchema>;
export type FeedingNeedQuery = z.infer<typeof feedingNeedQuerySchema>;
export type Beneficiary = z.infer<typeof beneficiarySchema>;
export type Contribution = z.infer<typeof contributionSchema>;
