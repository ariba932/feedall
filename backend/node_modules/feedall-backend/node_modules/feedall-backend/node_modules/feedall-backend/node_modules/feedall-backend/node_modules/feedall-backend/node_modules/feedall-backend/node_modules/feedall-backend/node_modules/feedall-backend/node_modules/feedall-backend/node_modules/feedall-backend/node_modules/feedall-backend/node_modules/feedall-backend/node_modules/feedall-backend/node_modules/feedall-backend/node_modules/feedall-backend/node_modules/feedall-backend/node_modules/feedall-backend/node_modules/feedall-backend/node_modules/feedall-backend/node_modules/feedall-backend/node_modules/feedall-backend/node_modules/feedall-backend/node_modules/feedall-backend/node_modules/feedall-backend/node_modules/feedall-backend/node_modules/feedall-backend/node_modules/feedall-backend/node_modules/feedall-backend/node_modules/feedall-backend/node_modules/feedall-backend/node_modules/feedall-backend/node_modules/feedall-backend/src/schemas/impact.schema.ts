import { z } from 'zod';
import { imageSchema } from './common.schema';

// Impact category enum
export const ImpactCategory = z.enum([
  'MEALS_SERVED',
  'PEOPLE_REACHED',
  'FOOD_SAVED',
  'CARBON_REDUCED',
  'COMMUNITY_ENGAGEMENT',
]);

// Impact metric schema
export const impactMetricSchema = z.object({
  category: ImpactCategory,
  value: z.number().positive(),
  unit: z.string(),
  description: z.string(),
}).strict();

// Impact evidence schema
export const impactEvidenceSchema = z.object({
  images: z.array(imageSchema),
  description: z.string(),
  testimonials: z.array(z.object({
    name: z.string(),
    role: z.string(),
    content: z.string(),
    rating: z.number().min(1).max(5).optional(),
  })),
  metrics: z.array(impactMetricSchema),
  timestamp: z.string().datetime(),
}).strict();

// Base impact record schema
const impactRecordBaseSchema = {
  entityId: z.string().uuid(), // ID of the related entity (donation, food pack, etc.)
  entityType: z.string(), // Type of the related entity
  category: ImpactCategory,
  metrics: z.array(impactMetricSchema),
  evidence: impactEvidenceSchema,
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
    address: z.string(),
  }),
  date: z.string().datetime(),
  description: z.string(),
  beneficiaries: z.object({
    total: z.number().positive(),
    demographics: z.record(z.string(), z.number()).optional(),
  }),
  sdgGoals: z.array(z.number().min(1).max(17)), // UN Sustainable Development Goals
  notes: z.string().optional(),
};

// Create impact record schema
export const createImpactRecordSchema = z.object({
  ...impactRecordBaseSchema,
}).strict();

// Update impact record schema
export const updateImpactRecordSchema = z.object({
  metrics: z.array(impactMetricSchema).optional(),
  evidence: impactEvidenceSchema.optional(),
  description: z.string().optional(),
  beneficiaries: z.object({
    total: z.number().positive(),
    demographics: z.record(z.string(), z.number()).optional(),
  }).optional(),
  sdgGoals: z.array(z.number().min(1).max(17)).optional(),
  notes: z.string().optional(),
}).strict();

// Impact query schema
export const impactQuerySchema = z.object({
  entityId: z.string().uuid().optional(),
  entityType: z.string().optional(),
  category: ImpactCategory.optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  location: z.string().optional(),
  minBeneficiaries: z.number().optional(),
  maxBeneficiaries: z.number().optional(),
  sdgGoal: z.number().min(1).max(17).optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
}).strict();

// Impact summary schema
export const impactSummarySchema = z.object({
  timeframe: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY', 'ALL_TIME']),
  categories: z.array(ImpactCategory).optional(),
  entityType: z.string().optional(),
  location: z.string().optional(),
}).strict();

// Export types
export type CreateImpactRecord = z.infer<typeof createImpactRecordSchema>;
export type UpdateImpactRecord = z.infer<typeof updateImpactRecordSchema>;
export type ImpactQuery = z.infer<typeof impactQuerySchema>;
export type ImpactSummary = z.infer<typeof impactSummarySchema>;
export type ImpactMetric = z.infer<typeof impactMetricSchema>;
export type ImpactEvidence = z.infer<typeof impactEvidenceSchema>;
