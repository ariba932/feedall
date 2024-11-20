import { z } from 'zod';
import { UserRole } from '@prisma/client';
import { addressSchema, contactSchema, imageSchema } from './common.schema';

// KYC document types
export const KYCDocumentType = z.enum([
  'GOVERNMENT_ID',
  'BUSINESS_LICENSE',
  'TAX_CERTIFICATE',
  'PROOF_OF_ADDRESS',
  'NGO_REGISTRATION',
  'OTHER'
]);

// KYC document schema
export const kycDocumentSchema = z.object({
  type: KYCDocumentType,
  documentNumber: z.string(),
  issuingAuthority: z.string(),
  issueDate: z.string().datetime(),
  expiryDate: z.string().datetime().optional(),
  documentImage: imageSchema,
  verificationStatus: z.enum(['PENDING', 'VERIFIED', 'REJECTED']).default('PENDING'),
  verificationNotes: z.string().optional(),
}).strict();

// Base onboarding schema for all users
const baseOnboardingSchema = {
  email: z.string().email(),
  password: z.string().min(8).regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
  ),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format'),
  address: addressSchema,
};

// Donor onboarding schema
export const donorOnboardingSchema = z.object({
  ...baseOnboardingSchema,
  role: z.literal(UserRole.DONOR),
  // Optional fields specific to donors
  companyName: z.string().optional(),
  taxId: z.string().optional(),
  preferredPickupTimes: z.array(z.string()).optional(),
}).strict();

// Non-donor onboarding schema (requires KYC)
export const nonDonorOnboardingSchema = z.object({
  ...baseOnboardingSchema,
  role: z.enum([UserRole.SERVICE_PROVIDER, UserRole.NGO, UserRole.LOGISTICS, UserRole.VOLUNTEER]),
  companyName: z.string(),
  taxId: z.string(),
  businessType: z.string(),
  // Required KYC documents based on role
  kycDocuments: z.array(kycDocumentSchema).min(1),
  // Additional verification fields
  registrationNumber: z.string(),
  operatingLicense: kycDocumentSchema,
}).strict();

// KYC verification update schema
export const kycVerificationSchema = z.object({
  userId: z.string(),
  documentId: z.string(),
  verificationStatus: z.enum(['VERIFIED', 'REJECTED']),
  verificationNotes: z.string().optional(),
}).strict();
