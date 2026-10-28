import { z } from "zod";
import { hexColorSchema, imageRefSchema, versionSchema } from "./common.js";

const colorOrEmptySchema = hexColorSchema.or(z.literal(""));

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
  })
  .strict();

export const themeResponseSchema = z
  .object({
    theme: themeSettingsSchema,
    version: versionSchema,
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
export type ThemeSettings = z.infer<typeof themeSettingsSchema>;
export type ThemeResponse = z.infer<typeof themeResponseSchema>;
