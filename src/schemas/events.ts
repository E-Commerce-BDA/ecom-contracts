import { z } from "zod";
import { imageRefSchema, isoDateSchema, uuidSchema, versionSchema } from "./common.js";
import { blogStatusSchema } from "./blogs.js";

const eventIdentifierSchema = z.string().min(1);

/**
 * Wire envelope for 1.3.0. Producers may dual-write `type` with the legacy
 * `topic`/`eventType` fields; consumers normalize with `readEventEnvelope`.
 * `type` is the canonical event name and Kafka topic.
 */
export const eventEnvelopeSchema = z
  .object({
    id: uuidSchema,
    type: eventIdentifierSchema.optional(),
    topic: eventIdentifierSchema.optional(),
    eventType: eventIdentifierSchema.optional(),
    producer: z.string().min(1),
    timestamp: isoDateSchema,
    idempotencyKey: z.string().min(1).optional(),
    // Envelope versions are 1-based; CMS revision `versionSchema` is 0-based.
    version: z.number().int().positive().optional(),
    payload: z.record(z.string(), z.unknown()),
  })
  .strict()
  .superRefine((envelope, ctx) => {
    if (!envelope.type && !envelope.topic && !envelope.eventType) {
      ctx.addIssue({
        code: "custom",
        message: "event envelope requires type, topic, or eventType",
        path: ["type"],
      });
    }
    if (envelope.type) {
      if (envelope.topic && envelope.topic !== envelope.type) {
        ctx.addIssue({
          code: "custom",
          message: "event envelope type must equal topic",
          path: ["topic"],
        });
      }
      if (envelope.eventType && envelope.eventType !== envelope.type) {
        ctx.addIssue({
          code: "custom",
          message: "event envelope type must equal eventType",
          path: ["eventType"],
        });
      }
    }
  });

/** Canonical 2.0.0-ready envelope. 1.3.0 producers should dual-write this shape. */
export const canonicalEventEnvelopeSchema = z
  .object({
    id: uuidSchema,
    type: eventIdentifierSchema,
    version: z.number().int().positive(),
    timestamp: isoDateSchema,
    producer: z.string().min(1),
    idempotencyKey: z.string().min(1),
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

/**
 * Order lifecycle values. `from`/`to` cover every state the order table can hold,
 * including `pending` (saga started) and `failed` (attempt closed).
 */
export const orderStatusSchema = z.enum([
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "failed",
  "refunded",
]);

/**
 * Money crossing a `DECIMAL` boundary arrives as a string from `pg` and as a
 * number from a JavaScript producer. Both are accepted; formatting is the
 * consumer's job.
 */
const moneySchema = z.union([
  z.number().nonnegative(),
  z.string().regex(/^\d+(?:\.\d{1,2})?$/, "must be a decimal amount"),
]);

/**
 * PII minimization: the payload carries the id only. notify-svc resolves the
 * address through `GET /internal/users/:id/email` (au-005).
 */
export const userRegisteredPayloadSchema = z
  .object({
    userId: uuidSchema,
    displayName: z.string().min(1).max(120).optional(),
    registeredAt: isoDateSchema,
  })
  .strict();

const cartStatusSchema = z.enum(["active", "converted", "abandoned"]);

const cartItemPayloadSchema = z
  .object({
    id: uuidSchema,
    productId: uuidSchema,
    variantId: uuidSchema.nullable(),
    qty: z.number().int().positive(),
    unitPrice: z.number().nonnegative(),
    productName: z.string().min(1).max(255),
    productSlug: z.string().max(280).nullable(),
    imageUrl: z.string().max(2048).nullable(),
    variantLabel: z.string().max(150).nullable(),
    addedAt: isoDateSchema,
  })
  .strict();

const cartTotalsPayloadSchema = z
  .object({
    subtotal: z.number().nonnegative(),
    itemCount: z.number().int().nonnegative(),
    lineCount: z.number().int().nonnegative(),
  })
  .strict();

/**
 * Mirrors `buildCartUpdatedEvent` + `toItemDto` in cart-svc, so nullable
 * Postgres columns arrive as `null` rather than as absent keys.
 */
export const cartUpdatedPayloadSchema = z
  .object({
    cartId: uuidSchema,
    userId: uuidSchema.nullable(),
    sessionId: z.string().max(64).nullable(),
    status: cartStatusSchema,
    items: z.array(cartItemPayloadSchema),
    totals: cartTotalsPayloadSchema,
    updatedAt: isoDateSchema,
  })
  .strict();

/** Target contract: produced by analytics-svc once the abandoned-cart detector lands. */
export const cartAbandonedPayloadSchema = z
  .object({
    cartId: uuidSchema,
    userId: uuidSchema.nullable(),
    sessionId: z.string().max(64).nullable(),
    itemsCount: z.number().int().nonnegative(),
    subtotal: z.number().nonnegative(),
    lastActivityAt: isoDateSchema,
    abandonedAt: isoDateSchema,
  })
  .strict();

export const orderCreatedPayloadSchema = z
  .object({
    orderId: uuidSchema,
    orderNumber: z.string().min(1).max(64),
    userId: uuidSchema,
    grandTotal: z.number().nonnegative(),
    itemsCount: z.number().int().positive(),
    // The checkout resume path falls back to '' when a legacy order has no hold.
    reservationId: uuidSchema.or(z.literal("")),
    createdAt: isoDateSchema,
  })
  .strict();

export const orderStatusUpdatedPayloadSchema = z
  .object({
    orderId: uuidSchema,
    orderNumber: z.string().min(1).max(64),
    from: orderStatusSchema,
    to: orderStatusSchema,
    note: z.string().max(500).nullable().optional(),
    actor: z.string().min(1).max(120).optional(),
    refundAmount: moneySchema.optional(),
    refundReference: z.string().min(1).max(120).optional(),
    timestamp: isoDateSchema,
  })
  .strict();

/** Target contract: produced by analytics-svc from the `/api/track` beacon. */
export const pageViewedPayloadSchema = z
  .object({
    sessionId: z.string().min(1).max(64),
    userId: uuidSchema.optional(),
    page: z.string().min(1).max(2048),
    referrer: z.string().max(2048).optional(),
    device: z.enum(["desktop", "mobile", "tablet"]).optional(),
    eventKind: z.enum(["pageview", "heartbeat"]),
    durationMs: z.number().int().nonnegative().optional(),
    exited: z.boolean().optional(),
    timestamp: isoDateSchema,
  })
  .strict();

export type EventEnvelope = z.infer<typeof eventEnvelopeSchema>;
export type CanonicalEventEnvelope = z.infer<
  typeof canonicalEventEnvelopeSchema
>;
export type CmsUpdatedPayload = z.infer<typeof cmsUpdatedPayloadSchema>;
export type BlogUpdatedPayload = z.infer<typeof blogUpdatedPayloadSchema>;
export type ProductImportedPayload = z.infer<typeof productImportedPayloadSchema>;
export type ProductUpdatedPayload = z.infer<typeof productUpdatedPayloadSchema>;
export type CategoryUpdatedPayload = z.infer<
  typeof categoryUpdatedPayloadSchema
>;
export type OrderStatus = z.infer<typeof orderStatusSchema>;
export type UserRegisteredPayload = z.infer<
  typeof userRegisteredPayloadSchema
>;
export type CartUpdatedPayload = z.infer<typeof cartUpdatedPayloadSchema>;
export type CartAbandonedPayload = z.infer<typeof cartAbandonedPayloadSchema>;
export type OrderCreatedPayload = z.infer<typeof orderCreatedPayloadSchema>;
export type OrderStatusUpdatedPayload = z.infer<
  typeof orderStatusUpdatedPayloadSchema
>;
export type PageViewedPayload = z.infer<typeof pageViewedPayloadSchema>;

/**
 * Normalize a 1.3.0 wire envelope to the canonical shape.
 *
 * - `type` wins; legacy `eventType` then `topic` are fallbacks.
 * - `version` defaults to 1 and `idempotencyKey` defaults to `id`.
 * - The schema rejects dual-write drift when `type` disagrees with a legacy
 *   field, while still accepting legacy CMS envelopes whose transport topic
 *   (`cms.events`) differs from the event name (`cms.updated`).
 */
export function readEventEnvelope(input: unknown): CanonicalEventEnvelope {
  const envelope = eventEnvelopeSchema.parse(input);
  const type = envelope.type ?? envelope.eventType ?? envelope.topic;

  if (!type) {
    // The schema rejects this, but keep the invariant explicit for TypeScript.
    throw new Error("event envelope requires type, topic, or eventType");
  }

  return {
    id: envelope.id,
    type,
    version: envelope.version ?? 1,
    timestamp: envelope.timestamp,
    producer: envelope.producer,
    idempotencyKey: envelope.idempotencyKey ?? envelope.id,
    payload: envelope.payload,
  };
}
