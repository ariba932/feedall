import * as z from 'zod';
import { UserRole, UserAddress, KYCDocument } from '@/types/user';

const addressSchema = z.object<z.ZodRawShape>({
  street: z.string().min(5, 'Street address must be at least 5 characters'),
  city: z.string().min(2, 'City must be at least 2 characters'),
  state: z.string().min(2, 'State must be at least 2 characters'),
  country: z.string().min(2, 'Country must be at least 2 characters'),
  postalCode: z.string().min(5, 'Postal code must be at least 5 characters'),
}) satisfies z.ZodType<UserAddress>;

const documentSchema = z.object<z.ZodRawShape>({
  type: z.enum(['GOVERNMENT_ID', 'BUSINESS_LICENSE']),
  documentNumber: z.string(),
  issuingAuthority: z.string(),
  issueDate: z.string(),
  documentImage: z.object({
    url: z.string().url(),
    alt: z.string(),
  }),
}) satisfies z.ZodType<KYCDocument>;

export const onboardingSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  address: addressSchema,
  role: z.nativeEnum(UserRole),
  companyName: z.string().optional(),
  taxId: z.string().optional(),
  businessType: z.string().optional(),
  registrationNumber: z.string().optional(),
  kycDocuments: z.array(documentSchema),
});

export type OnboardingFormData = z.infer<typeof onboardingSchema>;
