import { z } from 'zod';

// Base contract schema
const contractBaseSchema = {
  terms: z.object({
    conditions: z.array(z.string()),
    expiryDate: z.string().datetime().optional(),
    additionalTerms: z.record(z.string()).optional(),
  }).strict(),
};

// Donation contract schema
export const donationContractSchema = z.object({
  donationId: z.string().uuid(),
  donorId: z.string().uuid(),
  recipientId: z.string().uuid(),
  amount: z.number().positive(),
  terms: contractBaseSchema.terms,
}).strict();

// Food pack contract schema
export const foodPackContractSchema = z.object({
  foodPackId: z.string().uuid(),
  providerId: z.string().uuid(),
  sponsorId: z.string().uuid(),
  quantity: z.number().int().positive(),
  terms: contractBaseSchema.terms,
}).strict();

// Feeding need contract schema
export const feedingNeedContractSchema = z.object({
  feedingNeedId: z.string().uuid(),
  ngoId: z.string().uuid(),
  donorId: z.string().uuid(),
  amount: z.number().positive(),
  terms: contractBaseSchema.terms,
}).strict();

// Delivery contract schema
export const deliveryContractSchema = z.object({
  deliveryId: z.string().uuid(),
  logisticsId: z.string().uuid(),
  clientId: z.string().uuid(),
  terms: contractBaseSchema.terms,
}).strict();

// Contract status update schema
export const contractStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'COMPLETED', 'CANCELLED']),
}).strict();

// Contract address param schema
export const contractAddressParamSchema = z.object({
  contractAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
}).strict();

// Export types
export type DonationContractInput = z.infer<typeof donationContractSchema>;
export type FoodPackContractInput = z.infer<typeof foodPackContractSchema>;
export type FeedingNeedContractInput = z.infer<typeof feedingNeedContractSchema>;
export type DeliveryContractInput = z.infer<typeof deliveryContractSchema>;
export type ContractStatusInput = z.infer<typeof contractStatusSchema>;
export type ContractAddressParam = z.infer<typeof contractAddressParamSchema>;
