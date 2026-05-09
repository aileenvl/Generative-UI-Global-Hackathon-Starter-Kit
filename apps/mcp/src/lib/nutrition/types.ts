import { z } from "zod";

export const DAYS = [
  "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo",
] as const;
export type Day = (typeof DAYS)[number];

export const STORES = ["OXXO", "7-Eleven", "Walmart Express", "Soriana"] as const;
export type Store = (typeof STORES)[number];

export const COFEPRIS_STATUSES = ["approved", "warning", "alert", "unknown"] as const;
export type CofeprisStatus = (typeof COFEPRIS_STATUSES)[number];

export const HEALTH_GOALS = [
  "control_diabetes",
  "perder_peso",
  "mejorar_nutricion",
  "mantener_peso",
] as const;
export type HealthGoal = (typeof HEALTH_GOALS)[number];

export const GLYCEMIC_INDEX = ["bajo", "medio", "alto"] as const;
export type GlycemicIndex = (typeof GLYCEMIC_INDEX)[number];

export const macrosSchema = z.object({
  protein: z.number(),
  carbs: z.number(),
  fat: z.number(),
  fiber: z.number(),
});
export type Macros = z.infer<typeof macrosSchema>;

export const mealSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  calories: z.number(),
  macros: macrosSchema,
  tags: z.array(z.string()).default([]),
  glycemicIndex: z.enum(GLYCEMIC_INDEX).optional(),
});
export type Meal = z.infer<typeof mealSchema>;

export const mealDaySchema = z.object({
  day: z.enum(DAYS),
  date: z.string().optional(),
  breakfast: mealSchema,
  lunch: mealSchema,
  dinner: mealSchema,
  snacks: z.array(mealSchema).default([]),
  totalCalories: z.number(),
});
export type MealDay = z.infer<typeof mealDaySchema>;

export const weeklyDietSchema = z.object({
  days: z.array(mealDaySchema),
  goal: z.enum(HEALTH_GOALS).optional(),
  avgCalories: z.number(),
  avgMacros: macrosSchema,
  location: z.string().optional(),
});
export type WeeklyDiet = z.infer<typeof weeklyDietSchema>;

export const productSchema = z.object({
  id: z.string(),
  name: z.string(),
  brand: z.string().optional(),
  category: z.string(),
  calories: z.number(),
  macros: macrosSchema,
  cofeprisStatus: z.enum(COFEPRIS_STATUSES).default("unknown"),
  cofeprisNote: z.string().optional(),
});
export type Product = z.infer<typeof productSchema>;

export const storePriceSchema = z.object({
  store: z.enum(STORES),
  price: z.number(),
  available: z.boolean().default(true),
  unit: z.string().optional(),
});
export type StorePrice = z.infer<typeof storePriceSchema>;

export const productComparisonSchema = z.object({
  product: productSchema,
  qty: z.number().default(1),
  prices: z.array(storePriceSchema),
});
export type ProductComparison = z.infer<typeof productComparisonSchema>;

export const ticketComparisonSchema = z.object({
  products: z.array(productComparisonSchema),
  stores: z.array(z.enum(STORES)),
  storeTotals: z.array(
    z.object({ store: z.enum(STORES), total: z.number() }),
  ),
  recommendedStore: z.enum(STORES).optional(),
  location: z.string().optional(),
});
export type TicketComparison = z.infer<typeof ticketComparisonSchema>;

export const cartItemSchema = z.object({
  product: productSchema,
  qty: z.number().default(1),
  price: z.number(),
  store: z.enum(STORES),
});
export type CartItem = z.infer<typeof cartItemSchema>;

export const shoppingCartSchema = z.object({
  items: z.array(cartItemSchema),
  store: z.enum(STORES),
  subtotal: z.number(),
  savingsVsMax: z.number().optional(),
  week: z.string().optional(),
});
export type ShoppingCart = z.infer<typeof shoppingCartSchema>;

export const nutritionSummarySchema = z.object({
  weeklyCalories: z.array(
    z.object({ day: z.string(), calories: z.number() }),
  ),
  avgMacros: macrosSchema,
  avgSodium: z.number().optional(),
  avgSugar: z.number().optional(),
  healthScore: z.number(),
  goal: z.enum(HEALTH_GOALS).optional(),
  targetCalories: z.number().optional(),
});
export type NutritionSummary = z.infer<typeof nutritionSummarySchema>;
