import { z } from "zod";
import {
  hexColorSchema,
  internalPathSchema,
  stableIdSchema,
} from "./common.js";

export const ctaSchema = z
  .object({
    id: stableIdSchema,
    text: z.string().trim().min(1).max(50),
    link: internalPathSchema,
    bg: hexColorSchema.optional(),
    textColor: hexColorSchema.optional(),
    borderColor: hexColorSchema.optional(),
    borderWidth: z.number().int().min(0).max(4).optional(),
    borderRadius: z.number().int().min(0).max(24).optional(),
  })
  .strict();

export const ctasSchema = z.array(ctaSchema).max(3);

export type Cta = z.infer<typeof ctaSchema>;
export type Ctas = z.infer<typeof ctasSchema>;
