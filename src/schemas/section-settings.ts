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
  "height",
  "motion",
  "speed",
  "direction",
  "pauseOnHover",
  "layout",
] as const;

export type SectionSettingKey = (typeof SECTION_SETTING_KEYS)[number];

const blendModeSchema = z.enum(["multiply", "normal"]);
const ratioSchema = z.enum(["1:1", "4:3", "3:4", "16:9", "custom"]);
const customRatioSchema = z.number().min(0.5).max(2.5);
const gutterSchema = z.number().int().min(0).max(48);
const maxItemsSchema = z.number().int().min(1).max(24);
const heroHeightSchema = z.enum(["auto", "viewport"]);
const brandMotionSchema = z.enum(["static", "marquee"]);
/** Scroll velocity in px/second. A track slower than 20 reads as broken and
 * faster than 200 is unreadable; both are guardrails, not product rules. */
const marqueeSpeedSchema = z.number().int().min(20).max(200);
const marqueeDirectionSchema = z.enum(["left", "right"]);
const testimonialLayoutSchema = z.enum(["grid", "marquee"]);

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
    height: heroHeightSchema.optional(),
    motion: brandMotionSchema.optional(),
    speed: marqueeSpeedSchema.optional(),
    direction: marqueeDirectionSchema.optional(),
    pauseOnHover: z.boolean().optional(),
    layout: testimonialLayoutSchema.optional(),
  })
  .strict()
  .refine(hasValidCustomRatio, customRatioIssue);

export const heroSettingsSchema = z
  .object({
    bgColor: hexColorSchema.optional(),
    blendMode: blendModeSchema.optional(),
    ratio: ratioSchema.optional(),
    customRatio: customRatioSchema.optional(),
    height: heroHeightSchema.optional(),
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
    motion: brandMotionSchema.optional(),
    speed: marqueeSpeedSchema.optional(),
    direction: marqueeDirectionSchema.optional(),
    pauseOnHover: z.boolean().optional(),
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
    layout: testimonialLayoutSchema.optional(),
    speed: marqueeSpeedSchema.optional(),
    pauseOnHover: z.boolean().optional(),
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
