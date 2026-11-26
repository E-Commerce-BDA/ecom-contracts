import { z } from "zod";
import { imageRefSchema, versionSchema } from "./common.js";

/**
 * Global footer document (`footer.ts`, contracts 1.12.0).
 *
 * The footer is its own CMS document, not part of the theme and not part of
 * the navigation: it is global link structure with its own update cadence, so
 * a partial edit (one column) must never risk the navbar or the theme.
 *
 * There is exactly one footer document per store; `version` is the CMS
 * revision, bumped server-side on every write (same envelope as sections).
 *
 * Deliberate v1 omissions: no newsletter block (no submit endpoint exists),
 * payment icons are display-only platform keys. The renderer trusts these
 * strings enough to put them in `href`, so unsafe schemes are refused here,
 * at the contract boundary, not at paint time.
 */

const footerLabelSchema = z.string().trim().min(1).max(60);
const footerHeadingSchema = z.string().trim().min(1).max(40);

const footerHrefSchema = z
  .string()
  .trim()
  .min(1)
  .max(2048)
  .refine(
    (value) =>
      (value.startsWith("/") && !value.startsWith("//")) ||
      /^https?:\/\//i.test(value),
    "href must be an internal path or an http(s) URL",
  );

const footerUrlSchema = z
  .string()
  .trim()
  .min(1)
  .max(2048)
  .refine((value) => /^https?:\/\//i.test(value), "must be an http(s) URL");

export const footerLinkSchema = z
  .object({
    label: footerLabelSchema,
    href: footerHrefSchema,
  })
  .strict();

export const footerSocialLinkSchema = z
  .object({
    /** Platform key the renderer has an icon for: facebook, instagram, x,
     * youtube, tiktok, pinterest, linkedin, whatsapp. Unknown keys render
     * the label as text — a new network must never blank the footer. */
    platform: z.string().trim().min(1).max(30),
    label: footerLabelSchema,
    url: footerUrlSchema,
  })
  .strict();

export const footerColumnSchema = z
  .object({
    title: footerHeadingSchema,
    links: z.array(footerLinkSchema).min(1).max(12),
  })
  .strict();

export const footerContactSchema = z
  .object({
    email: z.string().trim().email().max(120).optional(),
    phone: z.string().trim().max(40).optional(),
    address: z.string().trim().max(240).optional(),
  })
  .strict();

export const footerSchema = z
  .object({
    columns: z.array(footerColumnSchema).max(6).optional(),
    social: z.array(footerSocialLinkSchema).max(8).optional(),
    legal: z.array(footerLinkSchema).max(8).optional(),
    contact: footerContactSchema.optional(),
    logo: imageRefSchema.optional(),
    wordmark: z.string().trim().max(40).optional(),
    tagline: z.string().trim().max(160).optional(),
    copyright: z.string().trim().max(120).optional(),
    /** Icon keys only (visa, mastercard, paypal, applepay, upi...);
     * free-form labels are rejected so the footer never renders arbitrary text. */
    paymentIcons: z
      .array(z.string().trim().regex(/^[a-z0-9-]{1,20}$/))
      .max(8)
      .optional(),
  })
  .strict();

export const footerResponseSchema = z
  .object({
    footer: footerSchema,
    version: versionSchema,
    configured: z.boolean().optional(),
  })
  .strict();

export const updateFooterSchema = footerSchema;

export const FOOTER_LIMITS = {
  columns: 6,
  linksPerColumn: 12,
  social: 8,
  legal: 8,
  paymentIcons: 8,
} as const;

export type FooterLink = z.infer<typeof footerLinkSchema>;
export type FooterSocialLink = z.infer<typeof footerSocialLinkSchema>;
export type FooterColumn = z.infer<typeof footerColumnSchema>;
export type FooterContact = z.infer<typeof footerContactSchema>;
export type Footer = z.infer<typeof footerSchema>;
export type FooterResponse = z.infer<typeof footerResponseSchema>;
