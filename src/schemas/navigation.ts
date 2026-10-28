import { z } from "zod";
import {
  hexColorSchema,
  imageRefSchema,
  internalPathSchema,
  isoDateSchema,
  versionSchema,
} from "./common.js";

export const logoPositionSchema = z.enum(["left", "center"]);
export const stickyModeSchema = z.enum(["always", "hide-on-scroll", "static"]);
export const barShadowSchema = z.enum(["border", "float", "none"]);
export const linkHighlightSchema = z.enum(["none", "sale", "bold", "accent"]);
export const cartDestinationSchema = z.enum(["drawer", "page"]);
export const drawerSideSchema = z.enum(["left", "right"]);
export const accountItemSchema = z.enum([
  "orders",
  "addresses",
  "wishlist",
  "signout",
]);
export const searchOverlayVariantSchema = z.enum([
  "classic",
  "palette",
  "sheet",
  "editorial",
]);

export const linkBadgeSchema = z
  .object({
    text: z.string().min(1).max(24),
  })
  .strict();

export const linkScheduleSchema = z
  .object({
    startsAt: isoDateSchema.optional(),
    endsAt: isoDateSchema.optional(),
  })
  .strict();

export const navLinkSchema = z.discriminatedUnion("kind", [
  z
    .object({
      kind: z.literal("category"),
      label: z.string().min(1).max(64),
      href: internalPathSchema,
      categoryId: z.string().min(1),
      icon: z.string().optional(),
      badge: linkBadgeSchema.optional(),
      highlight: linkHighlightSchema.optional(),
      schedule: linkScheduleSchema.optional(),
    })
    .strict(),
  z
    .object({
      kind: z.literal("custom"),
      label: z.string().min(1).max(64),
      href: z.string().min(1).max(2048),
      icon: z.string().optional(),
      badge: linkBadgeSchema.optional(),
      highlight: linkHighlightSchema.optional(),
      schedule: linkScheduleSchema.optional(),
    })
    .strict(),
]);

export const navRegionsSchema = z
  .object({
    announcement: z.boolean().optional(),
    logo: z.boolean().optional(),
    links: z.boolean().optional(),
    search: z.boolean().optional(),
    account: z.boolean().optional(),
    wishlist: z.boolean().optional(),
    cart: z.boolean().optional(),
    badge: z.boolean().optional(),
  })
  .strict();

export const navLogoSchema = z
  .object({
    imageUrl: imageRefSchema.or(z.literal("")).optional(),
    height: z.number().int().min(20).max(40).optional(),
    position: logoPositionSchema.optional(),
    wordmark: z.string().max(32).optional(),
  })
  .strict();

export const navBarSchema = z
  .object({
    height: z.number().int().min(56).max(80).optional(),
    sticky: stickyModeSchema.optional(),
    shadow: barShadowSchema.optional(),
  })
  .strict();

export const navColorsSchema = z
  .object({
    bg: hexColorSchema.optional(),
    text: hexColorSchema.optional(),
    hover: hexColorSchema.optional(),
    badgeBg: hexColorSchema.optional(),
    badgeText: hexColorSchema.optional(),
    announceBg: hexColorSchema.optional(),
    announceText: hexColorSchema.optional(),
  })
  .strict();

export const navLinksSchema = z
  .object({
    items: z.array(navLinkSchema).max(20).optional(),
    maxItems: z.number().int().min(3).max(8).optional(),
  })
  .strict();

export const navSearchSchema = z
  .object({
    enabled: z.boolean().optional(),
    overlayVariant: searchOverlayVariantSchema.optional(),
    placeholder: z.string().max(120).optional(),
    sheetAnimation: z.record(z.string(), z.unknown()).optional(),
    editorial: z.record(z.string(), z.unknown()).optional(),
    palette: z.record(z.string(), z.unknown()).optional(),
  })
  .strict();

export const navAccountSchema = z
  .object({
    enabled: z.boolean().optional(),
    items: z.array(accountItemSchema).optional(),
  })
  .strict();

export const navCartSchema = z
  .object({
    enabled: z.boolean().optional(),
    destination: cartDestinationSchema.optional(),
    dedicatedPage: z.boolean().optional(),
    badgeCap: z.number().int().min(1).max(99).optional(),
  })
  .strict();

export const navAnnouncementSchema = z
  .object({
    items: z
      .array(
        z.object({
          text: z.string().min(1).max(200),
          cta: z
            .object({
              label: z.string().min(1).max(50),
              href: z.string().min(1).max(2048),
            })
            .optional(),
          countdownTo: isoDateSchema.optional(),
        }),
      )
      .max(10)
      .optional(),
    showArrows: z.boolean().optional(),
    autoplayMs: z.number().int().min(1000).max(30000).nullable().optional(),
    dismissible: z.boolean().optional(),
    collapseAnimation: z.boolean().optional(),
  })
  .strict();

export const navMobileSchema = z
  .object({
    breakpoint: z.number().int().min(640).max(1024).optional(),
    drawerSide: drawerSideSchema.optional(),
  })
  .strict();

export const navPageOverridesSchema = z
  .object({
    regions: navRegionsSchema.optional(),
    logo: navLogoSchema.optional(),
    bar: navBarSchema.optional(),
    colors: navColorsSchema.optional(),
    links: navLinksSchema.optional(),
    search: navSearchSchema.optional(),
    account: navAccountSchema.optional(),
    cart: navCartSchema.optional(),
    announcement: navAnnouncementSchema.optional(),
    mobile: navMobileSchema.optional(),
  })
  .strict();

export const navSettingsSchema = z
  .object({
    shared: navPageOverridesSchema.optional(),
  })
  .strict();

export const navResponseSchema = z
  .object({
    navbar: navSettingsSchema,
    version: versionSchema,
  })
  .strict();

export type NavLink = z.infer<typeof navLinkSchema>;
export type NavRegionsField = z.infer<typeof navRegionsSchema>;
export type NavLogoField = z.infer<typeof navLogoSchema>;
export type NavBarField = z.infer<typeof navBarSchema>;
export type NavColorsField = z.infer<typeof navColorsSchema>;
export type NavLinksField = z.infer<typeof navLinksSchema>;
export type NavSearchField = z.infer<typeof navSearchSchema>;
export type NavAccountField = z.infer<typeof navAccountSchema>;
export type NavCartField = z.infer<typeof navCartSchema>;
export type NavAnnouncementField = z.infer<typeof navAnnouncementSchema>;
export type NavMobileField = z.infer<typeof navMobileSchema>;
export type NavPageOverrides = z.infer<typeof navPageOverridesSchema>;
export type NavSettings = z.infer<typeof navSettingsSchema>;
export type NavResponse = z.infer<typeof navResponseSchema>;
