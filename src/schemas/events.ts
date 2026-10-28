import { z } from "zod";
import { imageRefSchema, isoDateSchema, uuidSchema, versionSchema } from "./common.js";
import { blogStatusSchema } from "./blogs.js";

export const eventEnvelopeSchema = z
  .object({
    id: uuidSchema,
    topic: z.string().min(1),
    eventType: z.string().min(1),
    producer: z.string().min(1),
    timestamp: isoDateSchema,
    idempotencyKey: z.string().min(1).optional(),
    version: z.number().int().positive().optional(),
    payload: z.record(z.string(), z.unknown()),
  })
  .strict();

export const cmsUpdatedPayloadSchema = z
  .object({
    scope: z.string().min(1),
    version: versionSchema,
    pageKey: z.string().optional(),
    key: z.string().optional(),
  })
  .strict();

export const blogUpdatedPayloadSchema = z
  .object({
    blogId: z.string().min(1),
    slug: z.string().min(1),
    status: blogStatusSchema,
    title: z.string().min(1).optional(),
    excerpt: z.string().optional(),
    coverUrl: imageRefSchema.optional(),
    publishedAt: isoDateSchema.optional(),
    updatedAt: isoDateSchema.optional(),
    categoryId: z.string().optional(),
  })
  .strict();

export const productImportedPayloadSchema = z
  .object({
    productId: uuidSchema,
    sku: z.string().min(1),
    name: z.string().min(1),
    slug: z.string().min(1),
    description: z.string().optional(),
    categoryId: uuidSchema.optional(),
    categorySlug: z.string().optional(),
    brandId: uuidSchema.optional(),
    brandName: z.string().optional(),
    price: z.union([z.number().nonnegative(), z.string().min(1)]),
    effectivePrice: z
      .union([z.number().nonnegative(), z.string().min(1)])
      .optional(),
    stock: z.number().int().nonnegative().optional(),
    images: z.array(imageRefSchema).optional(),
    imageUrl: imageRefSchema.optional(),
    status: z.enum(["active", "inactive"]),
    updatedAt: isoDateSchema,
  })
  .strict();

export const productUpdatedPayloadSchema = z
  .object({
    productId: uuidSchema,
    sku: z.string().min(1).optional(),
    name: z.string().min(1),
    slug: z.string().min(1),
    description: z.string().optional(),
    categoryId: uuidSchema.optional(),
    categorySlug: z.string().optional(),
    brandId: uuidSchema.optional(),
    brandName: z.string().optional(),
    price: z.union([z.number().nonnegative(), z.string().min(1)]),
    effectivePrice: z
      .union([z.number().nonnegative(), z.string().min(1)])
      .optional(),
    stock: z.number().int().nonnegative().optional(),
    images: z.array(imageRefSchema).optional(),
    imageUrl: imageRefSchema.optional(),
    status: z.enum(["active", "inactive"]),
    updatedAt: isoDateSchema,
  })
  .strict();

export const categoryUpdatedPayloadSchema = z
  .object({
    categoryId: uuidSchema,
    name: z.string().min(1),
    slug: z.string().min(1),
    isActive: z.boolean(),
    imageUrl: imageRefSchema.optional(),
    parentId: uuidSchema.optional(),
    updatedAt: isoDateSchema,
  })
  .strict();

export type EventEnvelope = z.infer<typeof eventEnvelopeSchema>;
export type CmsUpdatedPayload = z.infer<typeof cmsUpdatedPayloadSchema>;
export type BlogUpdatedPayload = z.infer<typeof blogUpdatedPayloadSchema>;
export type ProductImportedPayload = z.infer<typeof productImportedPayloadSchema>;
export type ProductUpdatedPayload = z.infer<typeof productUpdatedPayloadSchema>;
export type CategoryUpdatedPayload = z.infer<
  typeof categoryUpdatedPayloadSchema
>;
