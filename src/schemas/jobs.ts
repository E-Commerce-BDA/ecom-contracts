import { z } from "zod";
import { mediaKeySchema } from "./media.js";
import { stableIdSchema } from "./common.js";

/**
 * SQS task payloads.
 *
 * A task is a command, not a fact: it names work that must happen and carries
 * the minimum needed to do it. Every payload is transport-neutral, so the same
 * schema validates a message from LocalStack and from AWS.
 */

export const resizeImageJobSchema = z
  .object({
    mediaId: z.string().min(1),
    sourceKey: mediaKeySchema,
    formats: z.array(z.enum(["webp", "avif", "jpeg", "png"])).min(1),
    widths: z.array(z.number().int().positive()).min(1),
  })
  .strict();

export type ResizeImageJob = z.infer<typeof resizeImageJobSchema>;

/** The three emails v1 sends. One template per job, never a raw body. */
export const emailTemplateSchema = z.enum([
  "order-confirmation",
  "cart-abandoned",
  "welcome",
]);

/**
 * A request to send one email.
 *
 * The address is deliberately absent. `order.created` and the other identity
 * events forbid an embedded email so PII never enters the Kafka log, and a
 * 14-day SQS retention would be a worse place to park it: the worker resolves
 * the address from the referenced aggregate when it sends.
 *
 * `idempotencyKey` is what makes at-least-once delivery safe: the same event
 * redelivered produces the same key, so `notify.email_logs` can drop the second
 * attempt instead of sending twice.
 */
export const sendEmailJobSchema = z
  .object({
    template: emailTemplateSchema,
    userId: stableIdSchema.optional(),
    orderId: stableIdSchema.optional(),
    cartId: stableIdSchema.optional(),
    locale: z.string().min(2).max(16).optional(),
    idempotencyKey: z.string().min(1).max(128),
  })
  .strict()
  .refine(
    (job) => Boolean(job.userId ?? job.orderId ?? job.cartId),
    "a job needs the aggregate it is about: userId, orderId or cartId",
  );

export type SendEmailJob = z.infer<typeof sendEmailJobSchema>;
export type EmailTemplate = z.infer<typeof emailTemplateSchema>;

export const importSourceSchema = z.enum(["csv", "json"]);

/** `replace` overwrites stock, `add` increments it. */
export const importStockModeSchema = z.enum(["replace", "add"]);

/** A CSV cell or a JSON scalar: rows arrive untyped and are validated by import-svc. */
export const importRowValueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
]);

/**
 * One row of an upload.
 *
 * Rows are split by the uploader so a single bad row cannot fail the whole file
 * and so retries are per row: `rowNumber` is what the job report counts.
 */
export const processImportRowJobSchema = z
  .object({
    jobId: z.string().min(1).max(64),
    rowNumber: z.number().int().positive(),
    source: importSourceSchema,
    stockMode: importStockModeSchema,
    row: z.record(z.string(), importRowValueSchema),
  })
  .strict();

export type ProcessImportRowJob = z.infer<typeof processImportRowJobSchema>;
export type ImportSource = z.infer<typeof importSourceSchema>;
export type ImportStockMode = z.infer<typeof importStockModeSchema>;
