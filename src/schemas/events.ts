import { z } from "zod";
import { isoDateSchema, uuidSchema, versionSchema } from "./common.js";
import { blogStatusSchema } from "./blogs.js";

export const eventEnvelopeSchema = z
  .object({
    id: uuidSchema,
    topic: z.string().min(1),
    eventType: z.string().min(1),
    producer: z.string().min(1),
    timestamp: isoDateSchema,
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
  })
  .strict();

export type EventEnvelope = z.infer<typeof eventEnvelopeSchema>;
export type CmsUpdatedPayload = z.infer<typeof cmsUpdatedPayloadSchema>;
export type BlogUpdatedPayload = z.infer<typeof blogUpdatedPayloadSchema>;
