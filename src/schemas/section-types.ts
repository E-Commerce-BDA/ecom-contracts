import { z } from "zod";

/**
 * Canonical section type names.
 *
 * `brand_strip` is the v1 name; the older docs' `brands` value is a legacy
 * alias and is normalized by cms-svc before validation.
 */
export const SECTION_TYPES = [
  "hero",
  "banner",
  "featured_products",
  "category_showcase",
  "brand_strip",
  "blog_teaser",
  "testimonial",
  "pdp_description",
  "pdp_details",
  "pdp_reviews",
  "pdp_related",
  "pdp_trust",
  "pdp_story",
  "pdp_faq",
] as const;

export type SectionType = (typeof SECTION_TYPES)[number];

export const sectionTypeSchema = z.enum(SECTION_TYPES);
