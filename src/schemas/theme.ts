import { z } from "zod";
import { hexColorSchema, imageRefSchema, versionSchema } from "./common.js";

const colorOrEmptySchema = hexColorSchema.or(z.literal(""));

/**
 * Scrim layers sit over photography, so authors need translucent colours as
 * well as hex. The character class is deliberately narrow: a colour is never
 * an invitation to smuggle `url()`, a semicolon or braces into inline style.
 * Empty string keeps the same "no override" sentinel as every other colour.
 */
export const cssColorSchema = z
  .string()
  .max(64)
  .regex(
    /^(?:#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})|(?:rgba?|hsla?)\([0-9.,%\s/]+\)|transparent|currentColor)$/,
    "must be a hex, rgb/rgba/hsl/hsla colour, transparent, or currentColor",
  );

export const cssColorOrEmptySchema = cssColorSchema.or(z.literal(""));

export const themeButtonSchema = z
  .object({
    defaultVariant: z
      .enum(["primary", "light", "ghost-ink", "sale", "success", "error"])
      .optional(),
    defaultSize: z.enum(["sm", "md", "lg"]).optional(),
    bg: colorOrEmptySchema.optional(),
    textColor: colorOrEmptySchema.optional(),
    borderColor: colorOrEmptySchema.optional(),
    borderRadius: z.number().int().min(0).max(24).optional(),
    animation: z.record(z.string(), z.unknown()).optional(),
  })
  .strict();

export const themeInputSchema = z
  .object({
    bg: colorOrEmptySchema.optional(),
    textColor: colorOrEmptySchema.optional(),
    borderColor: colorOrEmptySchema.optional(),
    focusBorderColor: colorOrEmptySchema.optional(),
    borderRadius: z.number().int().min(0).max(24).optional(),
  })
  .strict();

export const themeCheckboxSchema = z
  .object({
    size: z.number().int().min(16).max(28).optional(),
    boxBg: colorOrEmptySchema.optional(),
    tickColor: colorOrEmptySchema.optional(),
    borderColor: colorOrEmptySchema.optional(),
    borderRadius: z.number().int().min(0).max(12).optional(),
  })
  .strict();

export const themeToggleSchema = z
  .object({
    width: z.number().int().min(32).max(64).optional(),
    height: z.number().int().min(20).max(32).optional(),
    onColor: colorOrEmptySchema.optional(),
    offColor: colorOrEmptySchema.optional(),
    knobColor: colorOrEmptySchema.optional(),
  })
  .strict();

/** @deprecated Prefer catalog.badges and product.badges single source of truth */
export const customBadgeSchema = z
  .object({
    id: z.string().min(1).max(32),
    label: z.string().max(64).optional(),
    bg: colorOrEmptySchema,
    textColor: colorOrEmptySchema,
    borderColor: colorOrEmptySchema.optional(),
    borderStyle: z.enum(["solid", "dashed", "dotted"]).optional(),
  })
  .strict();

/** @deprecated Prefer catalog.badges and product.badges single source of truth */
export const themeBadgesSchema = z
  .object({
    custom: z.array(customBadgeSchema).max(20).optional(),
  })
  .strict();

export const themeIconSchema = z
  .object({
    size: z.number().int().min(16).max(32).optional(),
    strokeWidth: z.number().min(1).max(3).optional(),
    filled: z.boolean().optional(),
    color: colorOrEmptySchema.optional(),
  })
  .strict();

export const themeTextareaSchema = z
  .object({
    bg: colorOrEmptySchema.optional(),
    textColor: colorOrEmptySchema.optional(),
    borderColor: colorOrEmptySchema.optional(),
    focusBorderColor: colorOrEmptySchema.optional(),
    borderRadius: z.number().int().min(0).max(24).optional(),
    rows: z.number().int().min(2).max(12).optional(),
  })
  .strict();

export const themeSelectSchema = z
  .object({
    variant: z.enum(["native", "custom"]).optional(),
    bg: colorOrEmptySchema.optional(),
    textColor: colorOrEmptySchema.optional(),
    borderColor: colorOrEmptySchema.optional(),
    focusBorderColor: colorOrEmptySchema.optional(),
    borderRadius: z.number().int().min(0).max(24).optional(),
    selectedBg: colorOrEmptySchema.optional(),
    selectedText: colorOrEmptySchema.optional(),
    hoverBg: colorOrEmptySchema.optional(),
    hoverText: colorOrEmptySchema.optional(),
    optionPaddingY: z.number().int().min(4).max(16).optional(),
    arrowPadding: z.number().int().min(4).max(24).optional(),
    arrowIconUrl: imageRefSchema.or(z.literal("")).optional(),
    dropdownAnimation: z.record(z.string(), z.unknown()).optional(),
  })
  .strict();

export const themeTooltipSchema = z
  .object({
    bg: colorOrEmptySchema.optional(),
    textColor: colorOrEmptySchema.optional(),
    borderColor: colorOrEmptySchema.optional(),
    borderWidth: z.number().int().min(0).max(4).optional(),
    radius: z.number().int().min(0).max(16).optional(),
    fontSize: z.number().int().min(10).max(18).optional(),
    fontWeight: z.number().int().min(400).max(700).optional(),
    animation: z.enum(["slide", "fade", "none"]).optional(),
    durationMs: z.number().int().min(100).max(600).optional(),
    offset: z.number().int().min(2).max(20).optional(),
  })
  .strict();

export const themeDialogSchema = z
  .object({
    overlayColor: colorOrEmptySchema.optional(),
    overlayAlpha: z.number().int().min(0).max(100).optional(),
    panelBg: colorOrEmptySchema.optional(),
    borderColor: colorOrEmptySchema.optional(),
    borderRadius: z.number().int().min(0).max(24).optional(),
    maxWidth: z.number().int().min(320).max(720).optional(),
    titleColor: colorOrEmptySchema.optional(),
    titleSize: z.number().int().min(14).max(24).optional(),
    bodySize: z.number().int().min(12).max(16).optional(),
    bodyWeight: z.number().int().min(400).max(700).optional(),
    bodyColor: colorOrEmptySchema.optional(),
  })
  .strict();

export const themeProductCardSchema = z
  .object({
    cardType: z.enum(["standard", "minimal", "compact", "overlay", "horizontal"]).optional(),
    mediaRatio: z.enum(["1:1", "3:4", "4:5", "4:3", "16:9"]).optional(),
    borderRadius: z.number().int().min(0).max(24).optional(),
    imageBorderRadius: z.number().int().min(0).max(24).optional(),
    cardPad: z.number().int().min(0).max(24).optional(),
    cardBg: colorOrEmptySchema.optional(),
    borderColor: colorOrEmptySchema.optional(),
    hoverCardBg: colorOrEmptySchema.optional(),
    hoverBorderColor: colorOrEmptySchema.optional(),
    mediaBg: colorOrEmptySchema.optional(),
    textColor: colorOrEmptySchema.optional(),
    mutedTextColor: colorOrEmptySchema.optional(),
    priceColor: colorOrEmptySchema.optional(),
    comparePriceColor: colorOrEmptySchema.optional(),
    // 2.2.0: the resolver already emits --pc-cta-* from these three keys.
    ctaBg: colorOrEmptySchema.optional(),
    ctaTextColor: colorOrEmptySchema.optional(),
    ctaBorderColor: colorOrEmptySchema.optional(),
    imageBlendMode: z.enum(["normal", "multiply", "darken", "overlay", "screen"]).optional(),
    imageFit: z.enum(["cover", "contain"]).optional(),
    badgePosition: z.enum(["left", "right"]).optional(),
    showBadge: z.boolean().optional(),
    showRatings: z.boolean().optional(),
    showDept: z.boolean().optional(),
    showSwatches: z.boolean().optional(),
    showPills: z.boolean().optional(),
    hoverMode: z.enum(["none", "image", "actions", "zoom"]).optional(),
    ctaVariant: z.enum(["overlay", "below", "inline", "footer", "none"]).optional(),
    ctaStyle: z.enum(["icon", "label", "icon-label"]).optional(),
    ctaSet: z.array(z.enum(["quick-view", "wishlist", "add-to-cart", "share"])).max(3).optional(),
    ctaPosition: z.enum(["left", "center", "right"]).optional(),
    showActionsOnTouch: z.boolean().optional(),
    nameSize: z.number().int().min(12).max(22).optional(),
    priceSize: z.number().int().min(12).max(22).optional(),
    textAlign: z.enum(["left", "center", "right"]).optional(),
    eyebrow: z.enum(["category", "brand", "none"]).optional(),
    imageNav: z.enum(["hover", "always", "touch", "none"]).optional(),
    imageIndicator: z.enum(["dots", "bars", "count", "none"]).optional(),
    imageIndicatorPosition: z.enum(["bottom", "top"]).optional(),
    imageLoop: z.boolean().optional(),
    imageLimit: z.number().int().min(1).max(10).optional(),
    selectionMode: z.enum(["preview", "commit-only", "visual"]).optional(),
    selectionEffects: z.array(z.enum(["image", "price", "stock"])).optional(),
    colsDesktop: z.number().int().min(3).max(5).optional(),
    colsTablet: z.number().int().min(2).max(3).optional(),
    colsPhone: z.number().int().min(1).max(2).optional(),
  })
  .strict();

export const themePhotoSettingsSchema = z
  .object({
    format: z.enum(["horizontal", "vertical"]).optional(),
    ratio: z.enum(["1:1", "4:3", "4:5", "3:4", "16:9", "custom"]).optional(),
    customRatio: z.number().min(0.5).max(2.5).optional(),
    layout: z.enum(["grid", "carousel"]).optional(),
    gutter: z.number().int().min(0).max(48).optional(),
    widthPercent: z.number().int().min(25).max(100).optional(),
    blendMode: z.enum(["multiply", "normal"]).optional(),
    showPhotos: z.boolean().optional(),
  })
  .strict();

/* ------------------------------------------------------------------ *
 * 2.2.0 — layered palette and component groups
 *
 * Every key is optional: absence means "inherit the CSS fallback" and the
 * empty string is the existing "no override" colour sentinel. Nested objects
 * stay `.strict()` so a mistyped key fails at the CMS boundary instead of
 * silently disappearing. Numeric bounds mirror the resolver's clamps; the
 * contract refuses an out-of-range value rather than rewriting it.
 * ------------------------------------------------------------------ */

export const themePaletteBrandSchema = z
  .object({
    brand: colorOrEmptySchema.optional(),
    brandHover: colorOrEmptySchema.optional(),
    onBrand: colorOrEmptySchema.optional(),
    brandWash: colorOrEmptySchema.optional(),
  })
  .strict();

export const themePaletteInkSchema = z
  .object({
    ink: colorOrEmptySchema.optional(),
    muted: colorOrEmptySchema.optional(),
    border: colorOrEmptySchema.optional(),
  })
  .strict();

export const themePaletteSurfacesSchema = z
  .object({
    surface: colorOrEmptySchema.optional(),
    surfaceSunken: colorOrEmptySchema.optional(),
    surfaceRaised: colorOrEmptySchema.optional(),
    imagePlaceholder: colorOrEmptySchema.optional(),
  })
  .strict();

export const themePaletteSaleSchema = z
  .object({
    saleFill: colorOrEmptySchema.optional(),
    saleText: colorOrEmptySchema.optional(),
    saleWash: colorOrEmptySchema.optional(),
    onSale: colorOrEmptySchema.optional(),
  })
  .strict();

/**
 * Status is one semantic unit (`success: {fg, fill, bg, border}`), not four
 * flat `successFg`-style keys: an editor edits a status face at a time, and
 * deleting a key resets only that face — never writes `null`.
 */
export const themePaletteStatusSchema = z
  .object({
    fg: colorOrEmptySchema.optional(),
    fill: colorOrEmptySchema.optional(),
    bg: colorOrEmptySchema.optional(),
    border: colorOrEmptySchema.optional(),
  })
  .strict();

export const themePaletteNavbarSchema = z
  .object({
    bg: colorOrEmptySchema.optional(),
    text: colorOrEmptySchema.optional(),
    hover: colorOrEmptySchema.optional(),
    badgeBg: colorOrEmptySchema.optional(),
    badgeText: colorOrEmptySchema.optional(),
    announceBg: colorOrEmptySchema.optional(),
    announceText: colorOrEmptySchema.optional(),
  })
  .strict();

export const themePaletteFooterSchema = z
  .object({
    bg: colorOrEmptySchema.optional(),
    text: colorOrEmptySchema.optional(),
    link: colorOrEmptySchema.optional(),
    hover: colorOrEmptySchema.optional(),
  })
  .strict();

export const themePaletteScrimSchema = z
  .object({
    soft: cssColorOrEmptySchema.optional(),
    panel: cssColorOrEmptySchema.optional(),
    strong: cssColorOrEmptySchema.optional(),
  })
  .strict();

export const themePaletteStateSchema = z
  .object({
    focusOutline: colorOrEmptySchema.optional(),
    focusHalo: colorOrEmptySchema.optional(),
    disabledBg: colorOrEmptySchema.optional(),
    disabledText: colorOrEmptySchema.optional(),
    disabledBorder: colorOrEmptySchema.optional(),
  })
  .strict();

export const themePaletteRadiiSchema = z
  .object({
    radiusButton: z.number().int().min(0).max(24).optional(),
    radiusCard: z.number().int().min(0).max(24).optional(),
    radiusSm: z.number().int().min(0).max(8).optional(),
    radiusMd: z.number().int().min(0).max(16).optional(),
  })
  .strict();

/** A font stack, not a stylesheet: braces, semicolons and url() are refused. */
export const themeFontStackSchema = z
  .string()
  .trim()
  .min(1)
  .max(120)
  .refine(
    (value) => !/[;{}<>]|url\s*\(/i.test(value),
    "must be a plain CSS font stack",
  );

export const themePaletteTypeSchema = z
  .object({
    fontSans: themeFontStackSchema.optional(),
    fontDisplay: themeFontStackSchema.optional(),
    fsDisplay1: z.number().int().min(24).max(96).optional(),
    fsDisplay2: z.number().int().min(20).max(72).optional(),
    fsDisplay3: z.number().int().min(16).max(56).optional(),
    fsBody: z.number().int().min(12).max(20).optional(),
    fsCaption: z.number().int().min(10).max(16).optional(),
  })
  .strict();

/** Sparse admin-authored palette: the source the resolver paints from. */
export const themePaletteSchema = z
  .object({
    brand: themePaletteBrandSchema.optional(),
    ink: themePaletteInkSchema.optional(),
    surfaces: themePaletteSurfacesSchema.optional(),
    sale: themePaletteSaleSchema.optional(),
    success: themePaletteStatusSchema.optional(),
    warning: themePaletteStatusSchema.optional(),
    error: themePaletteStatusSchema.optional(),
    navbar: themePaletteNavbarSchema.optional(),
    footer: themePaletteFooterSchema.optional(),
    scrim: themePaletteScrimSchema.optional(),
    state: themePaletteStateSchema.optional(),
    radii: themePaletteRadiiSchema.optional(),
    type: themePaletteTypeSchema.optional(),
  })
  .strict();

/**
 * Paint/geometry projection of `--nb-*` only. Nav *content* — link items,
 * sticky mode, region flags — stays owned by navigation.ts, so there is one
 * owner per concept instead of two drifting copies.
 */
export const themeNavbarGroupSchema = z
  .object({
    height: z.number().int().min(48).max(96).optional(),
    bg: colorOrEmptySchema.optional(),
    text: colorOrEmptySchema.optional(),
    hover: colorOrEmptySchema.optional(),
    badgeBg: colorOrEmptySchema.optional(),
    badgeText: colorOrEmptySchema.optional(),
    announceBg: colorOrEmptySchema.optional(),
    announceText: colorOrEmptySchema.optional(),
  })
  .strict();

/** Paint/geometry projection of `--facet-*` on the shop listing rail. */
export const themeFilterRailGroupSchema = z
  .object({
    bg: colorOrEmptySchema.optional(),
    border: colorOrEmptySchema.optional(),
    title: colorOrEmptySchema.optional(),
    label: colorOrEmptySchema.optional(),
    gap: z.number().int().min(0).max(40).optional(),
    pad: z.number().int().min(0).max(40).optional(),
    radius: z.number().int().min(0).max(24).optional(),
    actionGap: z.number().int().min(0).max(24).optional(),
    maxHeight: z.number().int().min(120).max(800).optional(),
    headGap: z.number().int().min(0).max(24).optional(),
    titleSize: z.number().int().min(12).max(28).optional(),
    innerGap: z.number().int().min(0).max(24).optional(),
    labelSize: z.number().int().min(10).max(20).optional(),
    priceGap: z.number().int().min(0).max(24).optional(),
    tagGap: z.number().int().min(0).max(20).optional(),
    tagMax: z.number().int().min(60).max(400).optional(),
  })
  .strict();

/** Paint/motion of the filter/cart sheets; the side stays nav.mobile. */
export const themeDrawerGroupSchema = z
  .object({
    bg: colorOrEmptySchema.optional(),
    text: colorOrEmptySchema.optional(),
    borderColor: colorOrEmptySchema.optional(),
    overlayColor: cssColorOrEmptySchema.optional(),
    width: z.number().int().min(280).max(480).optional(),
    durationMs: z.number().int().min(100).max(600).optional(),
    motion: z.enum(["slide", "fade", "none"]).optional(),
  })
  .strict();

export const themeMarqueeGroupSchema = z
  .object({
    speed: z.number().int().min(20).max(200).optional(),
    direction: z.enum(["left", "right"]).optional(),
    pauseOnHover: z.boolean().optional(),
  })
  .strict();

export const themeGridGroupSchema = z
  .object({
    gap: z.number().int().min(0).max(48).optional(),
  })
  .strict();

export const cssVarNameSchema = z
  .string()
  .regex(/^--[a-z][a-z0-9-]*$/, "must be a lowercase CSS custom property name");

/** Any CSS-var map: admin preview, resolver output, or a partial override. */
export const themeVarsSchema = z.record(
  cssVarNameSchema,
  z.union([z.string(), z.number()]),
);

/**
 * The concrete map served to the shopper shell. Same shape as themeVarsSchema
 * by design: a resolved value is already a string or number, never an empty
 * sentinel, so the receiver needs no second parsing rule.
 */
export const resolvedThemeSchema = themeVarsSchema;

export const themeSettingsSchema = z
  .object({
    button: themeButtonSchema.optional(),
    input: themeInputSchema.optional(),
    checkbox: themeCheckboxSchema.optional(),
    toggle: themeToggleSchema.optional(),
    badges: themeBadgesSchema.optional(),
    icon: themeIconSchema.optional(),
    textarea: themeTextareaSchema.optional(),
    select: themeSelectSchema.optional(),
    tooltip: themeTooltipSchema.optional(),
    dialog: themeDialogSchema.optional(),
    productCard: themeProductCardSchema.optional(),
    photoSettings: themePhotoSettingsSchema.optional(),
    palette: themePaletteSchema.optional(),
    navbar: themeNavbarGroupSchema.optional(),
    filterRail: themeFilterRailGroupSchema.optional(),
    drawer: themeDrawerGroupSchema.optional(),
    marquee: themeMarqueeGroupSchema.optional(),
    grid: themeGridGroupSchema.optional(),
  })
  .strict();

export const themeResponseSchema = z
  .object({
    theme: themeSettingsSchema,
    version: versionSchema,
    // cms-012: distinguishes a document that exists from one never configured.
    configured: z.boolean().optional(),
  })
  .strict();

export type ThemeButtonField = z.infer<typeof themeButtonSchema>;
export type ThemeInputField = z.infer<typeof themeInputSchema>;
export type ThemeCheckboxField = z.infer<typeof themeCheckboxSchema>;
export type ThemeToggleField = z.infer<typeof themeToggleSchema>;
export type CustomBadgeField = z.infer<typeof customBadgeSchema>;
export type ThemeBadgesField = z.infer<typeof themeBadgesSchema>;
export type ThemeIconField = z.infer<typeof themeIconSchema>;
export type ThemeTextareaField = z.infer<typeof themeTextareaSchema>;
export type ThemeSelectField = z.infer<typeof themeSelectSchema>;
export type ThemeTooltipField = z.infer<typeof themeTooltipSchema>;
export type ThemeDialogField = z.infer<typeof themeDialogSchema>;
export type ThemeProductCardField = z.infer<typeof themeProductCardSchema>;
export type ThemePhotoSettingsField = z.infer<typeof themePhotoSettingsSchema>;
export type ThemePaletteBrandField = z.infer<typeof themePaletteBrandSchema>;
export type ThemePaletteInkField = z.infer<typeof themePaletteInkSchema>;
export type ThemePaletteSurfacesField = z.infer<typeof themePaletteSurfacesSchema>;
export type ThemePaletteSaleField = z.infer<typeof themePaletteSaleSchema>;
export type ThemePaletteStatusField = z.infer<typeof themePaletteStatusSchema>;
export type ThemePaletteNavbarField = z.infer<typeof themePaletteNavbarSchema>;
export type ThemePaletteFooterField = z.infer<typeof themePaletteFooterSchema>;
export type ThemePaletteScrimField = z.infer<typeof themePaletteScrimSchema>;
export type ThemePaletteStateField = z.infer<typeof themePaletteStateSchema>;
export type ThemePaletteRadiiField = z.infer<typeof themePaletteRadiiSchema>;
export type ThemePaletteTypeField = z.infer<typeof themePaletteTypeSchema>;
export type ThemePaletteField = z.infer<typeof themePaletteSchema>;
export type ThemeNavbarGroupField = z.infer<typeof themeNavbarGroupSchema>;
export type ThemeFilterRailGroupField = z.infer<typeof themeFilterRailGroupSchema>;
export type ThemeDrawerGroupField = z.infer<typeof themeDrawerGroupSchema>;
export type ThemeMarqueeGroupField = z.infer<typeof themeMarqueeGroupSchema>;
export type ThemeGridGroupField = z.infer<typeof themeGridGroupSchema>;
export type ThemeVars = z.infer<typeof themeVarsSchema>;
export type ResolvedTheme = z.infer<typeof resolvedThemeSchema>;
export type ThemeSettings = z.infer<typeof themeSettingsSchema>;
export type ThemeResponse = z.infer<typeof themeResponseSchema>;
