import { z } from "zod";
import { hexColorSchema, uuidSchema } from "./common.js";
import { themeProductCardSchema } from "./theme.js";

export const badgeBorderStyleSchema = z.enum(["solid", "dashed", "dotted"]);

export const badgeSchema = z
  .object({
    id: uuidSchema,
    key: z.string().min(1).max(64),
    label: z.string().min(1).max(64),
    bg: hexColorSchema,
    textColor: hexColorSchema,
    borderColor: hexColorSchema.nullable().optional(),
    borderStyle: badgeBorderStyleSchema.default("solid"),
    isActive: z.boolean().default(true),
    createdAt: z.string().datetime().optional(),
    updatedAt: z.string().datetime().optional(),
  })
  .strict();

export const createBadgeSchema = z
  .object({
    key: z.string().min(1).max(64),
    label: z.string().min(1).max(64),
    bg: hexColorSchema,
    textColor: hexColorSchema,
    borderColor: hexColorSchema.nullable().optional(),
    borderStyle: badgeBorderStyleSchema.default("solid").optional(),
    isActive: z.boolean().default(true).optional(),
  })
  .strict();

export const updateBadgeSchema = createBadgeSchema.partial();

export const productBadgeAssignmentSchema = z
  .object({
    productId: uuidSchema,
    badgeId: uuidSchema,
    sortOrder: z.number().int().default(0),
    startsAt: z.string().datetime().nullable().optional(),
    endsAt: z.string().datetime().nullable().optional(),
  })
  .strict();

export const productBadgeItemSchema = z
  .object({
    id: uuidSchema,
    key: z.string().min(1).max(64),
    label: z.string().min(1).max(64),
    bg: hexColorSchema,
    textColor: hexColorSchema,
    borderColor: hexColorSchema.nullable().optional(),
    borderStyle: badgeBorderStyleSchema.optional(),
  })
  .strict();

export const optionDisplayTypeSchema = z.enum(["text", "pill", "swatch"]);

export const productCardOptionValueSchema = z
  .object({
    id: uuidSchema.optional(),
    value: z.string().min(1).max(150),
    position: z.number().int().optional(),
    swatchHex: hexColorSchema.nullable().optional(),
    swatchImageUrl: z.string().url().max(2048).nullable().optional(),
    inStock: z.boolean().optional(),
  })
  .strict();

export const productCardOptionSchema = z
  .object({
    id: uuidSchema.optional(),
    name: z.string().min(1).max(100),
    displayType: optionDisplayTypeSchema,
    showOnCard: z.boolean().default(false),
    values: z.array(productCardOptionValueSchema),
  })
  .strict();

export const productCardSettingsSchema = themeProductCardSchema;

export type BadgeBorderStyle = z.infer<typeof badgeBorderStyleSchema>;
export type Badge = z.infer<typeof badgeSchema>;
export type CreateBadgeInput = z.infer<typeof createBadgeSchema>;
export type UpdateBadgeInput = z.infer<typeof updateBadgeSchema>;
export type ProductBadgeAssignment = z.infer<typeof productBadgeAssignmentSchema>;
export type ProductBadgeItem = z.infer<typeof productBadgeItemSchema>;
export type OptionDisplayType = z.infer<typeof optionDisplayTypeSchema>;
export type ProductCardOptionValue = z.infer<typeof productCardOptionValueSchema>;
export type ProductCardOption = z.infer<typeof productCardOptionSchema>;
export type ProductCardSettings = z.infer<typeof productCardSettingsSchema>;
