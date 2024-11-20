import { z } from 'zod';
import { addressSchema, contactSchema, imageSchema } from './common.schema';

// User role enum
export const UserRole = z.enum(['ADMIN', 'DONOR', 'NGO', 'PROVIDER', 'LOGISTICS', 'VOLUNTEER']);

// Base user schema
const userBaseSchema = {
  email: z.string().email(),
  name: z.string().min(2),
  role: UserRole,
  contact: contactSchema,
  address: addressSchema,
  profileImage: imageSchema.optional(),
  isVerified: z.boolean().default(false),
  isActive: z.boolean().default(true),
};

// Registration schema
export const userRegistrationSchema = z.object({
  ...userBaseSchema,
  password: z.string().min(8).regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character'
  ),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
}).strict();

// Login schema
export const userLoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
}).strict();

// Update profile schema
export const userUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  contact: contactSchema.optional(),
  address: addressSchema.optional(),
  profileImage: imageSchema.optional(),
}).strict();

// Change password schema
export const changePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(8).regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character'
  ),
  confirmNewPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "Passwords don't match",
  path: ["confirmNewPassword"],
}).strict();

// Reset password schema
export const resetPasswordSchema = z.object({
  token: z.string(),
  newPassword: z.string().min(8).regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character'
  ),
  confirmNewPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "Passwords don't match",
  path: ["confirmNewPassword"],
}).strict();

// Forgot password schema
export const forgotPasswordSchema = z.object({
  email: z.string().email(),
}).strict();

// Export types
export type UserRegistration = z.infer<typeof userRegistrationSchema>;
export type UserLogin = z.infer<typeof userLoginSchema>;
export type UserUpdate = z.infer<typeof userUpdateSchema>;
export type ChangePassword = z.infer<typeof changePasswordSchema>;
export type ResetPassword = z.infer<typeof resetPasswordSchema>;
export type ForgotPassword = z.infer<typeof forgotPasswordSchema>;
