import { z } from "zod";
import { versionSchema } from "./common.js";
import { productBadgeItemSchema } from "./catalog.js";
import { footerSchema } from "./footer.js";
import { navSettingsSchema } from "./navigation.js";
import { resolvedThemeSchema, themePaletteSchema } from "./theme.js";

/**
 * One versioned payload for the shopper shell (contracts 2.2.0).
 *
 * `theme` is the concrete CSS-var map the renderer paints from; `palette` is
 * the sparse admin-authored source carried alongside it so previews can show
 * both the edit and its resolved output in one read. Rejected: admin writing
 * raw CSS vars (unvalidated strings are an injection surface) and renaming
 * the existing theme/nav/footer documents (a breaking 2.1.0 reader change).
 *
 * `configVersion` is the contract shape version (a string, so prereleases are
 * expressible); `revision` is the CMS document revision (a number). The
 * numeric `version` alias exists for one release only so a 2.1.0 reader can
 * still read the envelope while it repins.
 */

export const configVersionSchema = z
  .string()
  .regex(
    /^\d+\.\d+\.\d+(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/,
    "must be a semver-like version",
  );

const previewTokenUrlSchema = z
  .string()
  .trim()
  .min(1)
  .max(2048)
  .refine(
    (value) =>
      (value.startsWith("/") && !value.startsWith("//")) ||
      /^https?:\/\//i.test(value),
    "tokenUrl must be an internal path or an http(s) URL",
  );

/** Metadata an admin preview needs to obtain a scoped, expiring token. */
export const storefrontConfigPreviewSchema = z
  .object({
    tokenUrl: previewTokenUrlSchema,
    queryParam: z
      .string()
      .trim()
      .min(1)
      .max(64)
      .regex(/^[A-Za-z][A-Za-z0-9_-]*$/, "must be a query parameter name"),
    headerName: z
      .string()
      .trim()
      .min(1)
      .max(128)
      .regex(/^[A-Za-z][A-Za-z0-9-]*$/, "must be an HTTP header name"),
  })
  .strict();

export const storefrontConfigResponseSchema = z
  .object({
    configVersion: configVersionSchema,
    revision: versionSchema,
    theme: resolvedThemeSchema,
    palette: themePaletteSchema.optional(),
    navigation: navSettingsSchema,
    footer: footerSchema,
    // Resolved catalog badges for card rendering: no admin-only audit fields
    // travel to the shopper shell.
    badges: z.array(productBadgeItemSchema).max(48),
    preview: storefrontConfigPreviewSchema.optional(),
    /** @deprecated Use configVersion; this alias is removed in 2.3.0. */
    version: versionSchema.optional(),
  })
  .strict();

export type ConfigVersion = z.infer<typeof configVersionSchema>;
export type StorefrontConfigPreview = z.infer<
  typeof storefrontConfigPreviewSchema
>;
export type StorefrontConfigResponse = z.infer<
  typeof storefrontConfigResponseSchema
>;
