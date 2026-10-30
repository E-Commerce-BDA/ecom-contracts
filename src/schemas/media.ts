import { z } from "zod";
import { imageRefSchema } from "./common.js";

export const mediaUsageSchema = z.enum([
  "section",
  "blog",
  "page",
  "brand",
  "category",
  "other",
]);

export const mediaMimeTypeSchema = z.enum([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/avif",
]);

/**
 * Delivery policy for a stored asset. `public` is servable through the
 * unauthenticated file route; `private` is reachable only from the admin file
 * route. Absent on the wire means `public`, so 1.4.0 payloads stay valid.
 */
export const mediaVisibilitySchema = z.enum(["public", "private"]);

export const mediaKeySchema = z
  .string()
  .regex(
    /^media\/\d{4}\/\d{2}\/[0-9a-fA-F-]+\.(?:png|jpe?g|webp|avif)$/,
    "must be in format media/{yyyy}/{mm}/{uuid}.{ext}",
  );

export const mediaSchema = z
  .object({
    id: z.string().min(1),
    key: mediaKeySchema,
    url: imageRefSchema,
    alt: z.string().max(160).optional(),
    width: z.number().int().positive().optional(),
    height: z.number().int().positive().optional(),
    mimeType: mediaMimeTypeSchema,
    sizeBytes: z
      .number()
      .int()
      .positive()
      .max(10 * 1024 * 1024, "max file size is 10 MB"),
    usage: mediaUsageSchema,
    visibility: mediaVisibilitySchema.optional(),
    uploadedBy: z.string().optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
  })
  .strict();

export const mediaListResponseSchema = z
  .object({
    data: z.array(mediaSchema),
    page: z.number().int().positive(),
    perPage: z.number().int().positive(),
    total: z.number().int().nonnegative(),
  })
  .strict();

export type MediaUsage = z.infer<typeof mediaUsageSchema>;
export type MediaMimeType = z.infer<typeof mediaMimeTypeSchema>;
export type MediaVisibility = z.infer<typeof mediaVisibilitySchema>;
export type Media = z.infer<typeof mediaSchema>;
export type MediaListResponse = z.infer<typeof mediaListResponseSchema>;
