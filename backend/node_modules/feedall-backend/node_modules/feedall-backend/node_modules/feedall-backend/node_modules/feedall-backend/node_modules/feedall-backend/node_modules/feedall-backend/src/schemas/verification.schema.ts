import { z } from 'zod';
import { imageSchema } from './common.schema';

// Verification status enum
export const VerificationStatus = z.enum([
  'PENDING',
  'IN_PROGRESS',
  'COMPLETED',
  'REJECTED',
]);

// Verification type enum
export const VerificationType = z.enum([
  'DONATION_DELIVERY',
  'FOOD_QUALITY',
  'NGO_ACTIVITY',
  'IMPACT_REPORT',
]);

// Evidence schema
export const evidenceSchema = z.object({
  images: z.array(imageSchema),
  description: z.string(),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
  timestamp: z.string().datetime(),
  metadata: z.record(z.string(), z.string()).optional(),
}).strict();

// Base verification schema
const verificationBaseSchema = {
  volunteerId: z.string().uuid(),
  type: VerificationType,
  status: VerificationStatus.default('PENDING'),
  entityId: z.string().uuid(), // ID of the entity being verified (donation, food pack, etc.)
  entityType: z.string(), // Type of entity being verified
  dueDate: z.string().datetime(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  description: z.string(),
  requirements: z.array(z.string()),
  evidence: z.array(evidenceSchema).optional(),
  notes: z.string().optional(),
};

// Create verification schema
export const createVerificationSchema = z.object({
  ...verificationBaseSchema,
}).strict();

// Update verification schema
export const updateVerificationSchema = z.object({
  status: VerificationStatus.optional(),
  evidence: z.array(evidenceSchema).optional(),
  notes: z.string().optional(),
}).strict();

// Verification query schema
export const verificationQuerySchema = z.object({
  volunteerId: z.string().uuid().optional(),
  type: VerificationType.optional(),
  status: VerificationStatus.optional(),
  entityId: z.string().uuid().optional(),
  entityType: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
}).strict();

// Export types
export type CreateVerification = z.infer<typeof createVerificationSchema>;
export type UpdateVerification = z.infer<typeof updateVerificationSchema>;
export type VerificationQuery = z.infer<typeof verificationQuerySchema>;
export type Evidence = z.infer<typeof evidenceSchema>;
