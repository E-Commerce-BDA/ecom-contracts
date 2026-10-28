import { z } from "zod";

/**
 * Shared primitive schemas for CMS payloads.
 *
 * These are transport/storage contracts, not storefront resolvers. Optional
 * means "inherit" or "absent"; null is never a valid override.
 */

export const hexColorSchema = z
  .string()
  .regex(
    /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/,
    "must be a hex color (#RGB, #RRGGBB, or #RRGGBBAA)",
  );

export const sectionKeySchema = z
  .string()
  .min(1)
  .max(80)
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "must be lowercase kebab-case (a-z, 0-9, single hyphens)",
  );

export const pageKeySchema = sectionKeySchema;

export const stableIdSchema = z
  .string()
  .min(1)
  .max(64)
  .regex(/^[A-Za-z0-9_-]+$/, "must contain only letters, digits, _ or -");

export const uuidSchema = z
  .string()
  .regex(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    "must be a UUID",
  );

export const versionSchema = z.number().int().nonnegative();

export function isInternalPath(value: string): boolean {
  return (
    value.startsWith("/") &&
    !value.startsWith("//") &&
    !value.includes("\\") &&
    !/[\u0000-\u001f]/.test(value)
  );
}

export const internalPathSchema = z
  .string()
  .min(1)
  .max(2048)
  .refine(isInternalPath, "must be an internal path starting with /");

export const imageRefSchema = z
  .string()
  .min(1)
  .max(2048)
  .refine(
    (value) => !/^\s*(?:javascript|data):/i.test(value),
    "must be a media key or URL, not a javascript/data URI",
  );

export const isoDateSchema = z
  .string()
  .refine((value) => !Number.isNaN(Date.parse(value)), "must be an ISO date");
