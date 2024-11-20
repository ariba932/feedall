import { z } from 'zod';
import { imageSchema } from './common.schema';
import { foodItemSchema } from './donation.schema';

// Food pack status enum
export const FoodPackStatus = z.enum([
  'DRAFT',
  'ACTIVE',
  'OUT_OF_STOCK',
  'DISCONTINUED',
]);

// Food pack category enum
export const FoodPackCategory = z.enum([
  'BASIC',
  'FAMILY',
  'EMERGENCY',
  'SPECIAL_DIET',
  'CHILDREN',
]);

// Nutritional info schema
export const nutritionalInfoSchema = z.object({
  calories: z.number().positive(),
  protein: z.number().nonnegative(),
  carbohydrates: z.number().nonnegative(),
  fat: z.number().nonnegative(),
  fiber: z.number().nonnegative(),
  vitamins: z.record(z.string(), z.number()).optional(),
  minerals: z.record(z.string(), z.number()).optional(),
}).strict();

// Base food pack schema
const foodPackBaseSchema = {
  providerId: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().min(1),
  category: FoodPackCategory,
  items: z.array(foodItemSchema),
  servingSize: z.number().positive(),
  servingsPerPack: z.number().positive(),
  nutritionalInfo: nutritionalInfoSchema,
  price: z.number().positive(),
  status: FoodPackStatus.default('DRAFT'),
  images: z.array(imageSchema),
  allergenInfo: z.array(z.string()),
  storageInstructions: z.string(),
  shelfLife: z.number().positive(), // in days
  preparationTime: z.number().nonnegative(), // in minutes
  isHalal: z.boolean().default(false),
  isVegetarian: z.boolean().default(false),
  isVegan: z.boolean().default(false),
};

// Create food pack schema
export const createFoodPackSchema = z.object({
  ...foodPackBaseSchema,
}).strict();

// Update food pack schema
export const updateFoodPackSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  category: FoodPackCategory.optional(),
  items: z.array(foodItemSchema).optional(),
  servingSize: z.number().positive().optional(),
  servingsPerPack: z.number().positive().optional(),
  nutritionalInfo: nutritionalInfoSchema.optional(),
  price: z.number().positive().optional(),
  status: FoodPackStatus.optional(),
  images: z.array(imageSchema).optional(),
  allergenInfo: z.array(z.string()).optional(),
  storageInstructions: z.string().optional(),
  shelfLife: z.number().positive().optional(),
  preparationTime: z.number().nonnegative().optional(),
  isHalal: z.boolean().optional(),
  isVegetarian: z.boolean().optional(),
  isVegan: z.boolean().optional(),
}).strict();

// Food pack query schema
export const foodPackQuerySchema = z.object({
  providerId: z.string().uuid().optional(),
  category: FoodPackCategory.optional(),
  status: FoodPackStatus.optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  isHalal: z.boolean().optional(),
  isVegetarian: z.boolean().optional(),
  isVegan: z.boolean().optional(),
  search: z.string().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
}).strict();

// Export types
export type CreateFoodPack = z.infer<typeof createFoodPackSchema>;
export type UpdateFoodPack = z.infer<typeof updateFoodPackSchema>;
export type FoodPackQuery = z.infer<typeof foodPackQuerySchema>;
export type NutritionalInfo = z.infer<typeof nutritionalInfoSchema>;
