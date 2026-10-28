import { z } from "zod";
import { ctasSchema } from "./cta.js";
import {
  hexColorSchema,
  imageRefSchema,
  stableIdSchema,
  uuidSchema,
} from "./common.js";

const sectionTitleSchema = z.string().trim().max(80);
const imageAltSchema = z.string().trim().max(160);

/**
 * Hero: ordered slides. An empty slide array is valid but the storefront skips
 * the section. The 12-slide cap is a guardrail, not a product requirement.
 */
export const slideSchema = z
  .object({
    id: stableIdSchema,
    eyebrow: z.string().trim().max(40).optional(),
    headline: z.string().trim().min(1).max(80),
    subcopy: z.string().trim().max(200).optional(),
    image: imageRefSchema,
    imageAlt: imageAltSchema.optional(),
    bgColor: hexColorSchema.optional(),
    textColor: hexColorSchema.optional(),
    imageBgColor: hexColorSchema.optional(),
    ctas: ctasSchema.optional(),
    split: z
      .enum(["50-50", "60-40", "40-60", "70-30", "30-70"])
      .optional(),
    flip: z.boolean().optional(),
    ratio: z.enum(["1:1", "4:3", "3:4", "16:9"]).optional(),
  })
  .strict();

export const heroContentSchema = z
  .object({
    slides: z.array(slideSchema).max(12),
  })
  .strict();

export const bannerContentSchema = z
  .object({
    title: sectionTitleSchema.optional(),
    subcopy: z.string().trim().max(200).optional(),
    image: imageRefSchema,
    imageAlt: imageAltSchema.optional(),
    bgColor: hexColorSchema.optional(),
    align: z.enum(["left", "center", "right"]).optional(),
    ctas: ctasSchema.optional(),
  })
  .strict();

/**
 * v1 product selection is manual and ordered. Category-driven selection is
 * intentionally deferred; the admin picks product ids explicitly.
 */
export const featuredProductsContentSchema = z
  .object({
    title: sectionTitleSchema.optional(),
    productIds: z.array(uuidSchema).max(24).optional(),
    layout: z.enum(["grid", "carousel"]).optional(),
  })
  .strict();

export const categoryShowcaseContentSchema = z
  .object({
    title: sectionTitleSchema.optional(),
    categoryIds: z.array(uuidSchema).max(12).optional(),
  })
  .strict();

/**
 * Empty brandIds means "active brands with logos", capped by settings.maxItems.
 * Supplying ids pins the order.
 */
export const brandStripContentSchema = z
  .object({
    title: sectionTitleSchema.optional(),
    brandIds: z.array(uuidSchema).max(24).optional(),
  })
  .strict();

/**
 * Empty postIds means "latest published posts", capped by content.count or
 * settings.maxItems.
 */
export const blogTeaserContentSchema = z
  .object({
    title: sectionTitleSchema.optional(),
    postIds: z.array(uuidSchema).max(12).optional(),
    count: z.number().int().min(1).max(12).optional(),
  })
  .strict();

export const testimonialItemSchema = z
  .object({
    id: stableIdSchema,
    quote: z.string().trim().min(1).max(400),
    name: z.string().trim().min(1).max(80),
    role: z.string().trim().max(80).optional(),
    avatar: imageRefSchema.optional(),
  })
  .strict();

export const testimonialContentSchema = z
  .object({
    title: sectionTitleSchema.optional(),
    items: z.array(testimonialItemSchema).max(12).optional(),
  })
  .strict();

export const sectionContentByType = {
  hero: heroContentSchema,
  banner: bannerContentSchema,
  featured_products: featuredProductsContentSchema,
  category_showcase: categoryShowcaseContentSchema,
  brand_strip: brandStripContentSchema,
  blog_teaser: blogTeaserContentSchema,
  testimonial: testimonialContentSchema,
} as const;

export type HeroContent = z.infer<typeof heroContentSchema>;
export type BannerContent = z.infer<typeof bannerContentSchema>;
export type FeaturedProductsContent = z.infer<
  typeof featuredProductsContentSchema
>;
export type CategoryShowcaseContent = z.infer<
  typeof categoryShowcaseContentSchema
>;
export type BrandStripContent = z.infer<typeof brandStripContentSchema>;
export type BlogTeaserContent = z.infer<typeof blogTeaserContentSchema>;
export type TestimonialContent = z.infer<typeof testimonialContentSchema>;
