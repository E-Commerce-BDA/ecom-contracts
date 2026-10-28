import { z } from "zod";
import { hexColorSchema } from "./common.js";

/**
 * Section settings are sparse overrides. An absent key inherits the global
 * value; null is never accepted. Each section type exposes only the keys that
 * its renderer actually reads.
 */
export const SECTION_SETTING_KEYS = [
  "bgColor",
  "blendMode",
  "ratio",
  "customRatio",
  "gutter",
  "showPhotos",
  "maxItems",
] as const;

export type SectionSettingKey = (typeof SECTION_SETTING_KEYS)[number];

const blendModeSchema = z.enum(["multiply", "normal"]);
const ratioSchema = z.enum(["1:1", "4:3", "3:4", "16:9", "custom"]);
const customRatioSchema = z.number().min(0.5).max(2.5);
const gutterSchema = z.number().int().min(0).max(48);
const maxItemsSchema = z.number().int().min(1).max(24);

function hasValidCustomRatio(value: {
  ratio?: string;
  customRatio?: number;
}): boolean {
  return value.customRatio === undefined || value.ratio === "custom";
}

const customRatioIssue = {
  path: ["customRatio"],
  message: "customRatio requires ratio=custom",
};

export const sectionSettingsSchema = z
  .object({
    bgColor: hexColorSchema.optional(),
    blendMode: blendModeSchema.optional(),
    ratio: ratioSchema.optional(),
    customRatio: customRatioSchema.optional(),
    gutter: gutterSchema.optional(),
    showPhotos: z.boolean().optional(),
    maxItems: maxItemsSchema.optional(),
  })
  .strict()
  .refine(hasValidCustomRatio, customRatioIssue);

export const heroSettingsSchema = z
  .object({
    bgColor: hexColorSchema.optional(),
    blendMode: blendModeSchema.optional(),
    ratio: ratioSchema.optional(),
    customRatio: customRatioSchema.optional(),
  })
  .strict()
  .refine(hasValidCustomRatio, customRatioIssue);

export const bannerSettingsSchema = z
  .object({
    bgColor: hexColorSchema.optional(),
    blendMode: blendModeSchema.optional(),
  })
  .strict();

export const featuredProductsSettingsSchema = z
  .object({
    bgColor: hexColorSchema.optional(),
    blendMode: blendModeSchema.optional(),
    ratio: ratioSchema.optional(),
    customRatio: customRatioSchema.optional(),
    gutter: gutterSchema.optional(),
    showPhotos: z.boolean().optional(),
    maxItems: maxItemsSchema.optional(),
  })
  .strict()
  .refine(hasValidCustomRatio, customRatioIssue);

export const categoryShowcaseSettingsSchema = z
  .object({
    bgColor: hexColorSchema.optional(),
    blendMode: blendModeSchema.optional(),
    ratio: ratioSchema.optional(),
    customRatio: customRatioSchema.optional(),
    gutter: gutterSchema.optional(),
    showPhotos: z.boolean().optional(),
    maxItems: maxItemsSchema.optional(),
  })
  .strict()
  .refine(hasValidCustomRatio, customRatioIssue);

export const brandStripSettingsSchema = z
  .object({
    bgColor: hexColorSchema.optional(),
    blendMode: blendModeSchema.optional(),
    gutter: gutterSchema.optional(),
    maxItems: maxItemsSchema.optional(),
  })
  .strict();

export const blogTeaserSettingsSchema = z
  .object({
    bgColor: hexColorSchema.optional(),
    blendMode: blendModeSchema.optional(),
    gutter: gutterSchema.optional(),
    maxItems: maxItemsSchema.optional(),
  })
  .strict();

export const testimonialSettingsSchema = z
  .object({
    bgColor: hexColorSchema.optional(),
    blendMode: blendModeSchema.optional(),
    gutter: gutterSchema.optional(),
    maxItems: maxItemsSchema.optional(),
  })
  .strict();

export const sectionSettingsByType = {
  hero: heroSettingsSchema,
  banner: bannerSettingsSchema,
  featured_products: featuredProductsSettingsSchema,
  category_showcase: categoryShowcaseSettingsSchema,
  brand_strip: brandStripSettingsSchema,
  blog_teaser: blogTeaserSettingsSchema,
  testimonial: testimonialSettingsSchema,
} as const;

export type SectionSettings = z.infer<typeof sectionSettingsSchema>;
