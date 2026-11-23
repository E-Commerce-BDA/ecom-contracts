import { z } from "zod";
import { ctasSchema } from "./cta.js";
import { faqItemSchema } from "./faq.js";
import {
  hexColorSchema,
  imageRefSchema,
  isoDateSchema,
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
 * v1 product selection is manual and ordered, or "newest" — the server's
 * newest active products capped by settings.maxItems. The admin picks product
 * ids explicitly for manual mode; there is no popularity metric.
 */
export const featuredProductsContentSchema = z
  .object({
    title: sectionTitleSchema.optional(),
    source: z.enum(["manual", "newest"]).optional(),
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

export const brandStripItemSchema = z
  .object({
    brandId: uuidSchema,
    label: z.string().trim().max(60).optional(),
  })
  .strict();

export const brandStripContentSchema = z
  .object({
    title: sectionTitleSchema.optional(),
    brandIds: z.array(uuidSchema).max(24).optional(),
    items: z.array(brandStripItemSchema).max(24).optional(),
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
    rating: z.number().int().min(1).max(5).optional(),
    verified: z.boolean().optional(),
    date: isoDateSchema.optional(),
  })
  .strict();

export const testimonialContentSchema = z
  .object({
    title: sectionTitleSchema.optional(),
    items: z.array(testimonialItemSchema).max(12).optional(),
  })
  .strict();


export const pdpDescriptionContentSchema = z
  .object({
    title: sectionTitleSchema.optional(),
    body: z.string().trim().min(1).max(50000).optional(),
  })
  .strict();

export const pdpDetailsRowSchema = z
  .object({
    label: z.string().trim().min(1).max(80),
    value: z.string().trim().min(1).max(240),
  })
  .strict();

export const pdpDetailsContentSchema = z
  .object({
    title: sectionTitleSchema.optional(),
    rows: z.array(pdpDetailsRowSchema).min(1).max(50).optional(),
  })
  .strict();

export const pdpReviewsContentSchema = z
  .object({
    title: sectionTitleSchema.optional(),
    items: z.array(testimonialItemSchema).max(12).optional(),
  })
  .strict();

export const pdpRelatedContentSchema = z
  .object({
    title: sectionTitleSchema.optional(),
    source: z.enum(["category", "brand", "manual"]).optional(),
    productIds: z.array(uuidSchema).max(24).optional(),
    layout: z.enum(["grid", "carousel"]).optional(),
  })
  .strict()
  .refine(
    (value) => value.source !== "manual" || (value.productIds?.length ?? 0) > 0,
    {
      path: ["productIds"],
      message: "manual related products require at least one product id",
    },
  )
  .refine((value) => value.source === "manual" || value.productIds === undefined, {
    path: ["productIds"],
    message: "productIds are only allowed when source is manual",
  });

/** Closed icon vocabulary for trust items — the storefront renders these
 * with a typed Icon, never a string cast. */
export const PDP_TRUST_ICONS = [
  "truck",
  "returns",
  "shield-check",
  "clock",
  "heart",
  "store",
] as const;

export const pdpTrustIconSchema = z.enum(PDP_TRUST_ICONS);

export const pdpTrustItemSchema = z
  .object({
    id: stableIdSchema,
    icon: pdpTrustIconSchema,
    title: z.string().trim().min(1).max(80),
    description: z.string().trim().min(1).max(200),
  })
  .strict();

export const pdpTrustContentSchema = z
  .object({
    title: sectionTitleSchema.optional(),
    items: z.array(pdpTrustItemSchema).max(6).optional(),
  })
  .strict();

export const pdpStoryContentSchema = z
  .object({
    title: sectionTitleSchema.optional(),
    body: z.string().trim().min(1).max(50000).optional(),
    image: imageRefSchema.optional(),
    imageAlt: imageAltSchema.optional(),
    ctas: ctasSchema.optional(),
  })
  .strict()
  .refine((value) => value.body !== undefined || value.image !== undefined, {
    message: "a story needs a body or an image",
  });

export const pdpFaqContentSchema = z
  .object({
    title: sectionTitleSchema.optional(),
    items: z.array(faqItemSchema).min(1).max(20),
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
  pdp_description: pdpDescriptionContentSchema,
  pdp_details: pdpDetailsContentSchema,
  pdp_reviews: pdpReviewsContentSchema,
  pdp_related: pdpRelatedContentSchema,
  pdp_trust: pdpTrustContentSchema,
  pdp_story: pdpStoryContentSchema,
  pdp_faq: pdpFaqContentSchema,
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
export type BrandStripItem = z.infer<typeof brandStripItemSchema>;
export type BlogTeaserContent = z.infer<typeof blogTeaserContentSchema>;
export type TestimonialContent = z.infer<typeof testimonialContentSchema>;
export type PdpDescriptionContent = z.infer<typeof pdpDescriptionContentSchema>;
export type PdpDetailsContent = z.infer<typeof pdpDetailsContentSchema>;
export type PdpDetailsRow = z.infer<typeof pdpDetailsRowSchema>;
export type PdpReviewsContent = z.infer<typeof pdpReviewsContentSchema>;
export type PdpRelatedContent = z.infer<typeof pdpRelatedContentSchema>;
export type PdpTrustIcon = z.infer<typeof pdpTrustIconSchema>;
export type PdpTrustItem = z.infer<typeof pdpTrustItemSchema>;
export type PdpTrustContent = z.infer<typeof pdpTrustContentSchema>;
export type PdpStoryContent = z.infer<typeof pdpStoryContentSchema>;
export type PdpFaqContent = z.infer<typeof pdpFaqContentSchema>;
