import { z } from "zod";
import {
  pageKeySchema,
  sectionKeySchema,
  versionSchema,
} from "./common.js";
import {
  bannerContentSchema,
  blogTeaserContentSchema,
  brandStripContentSchema,
  categoryShowcaseContentSchema,
  featuredProductsContentSchema,
  heroContentSchema,
  testimonialContentSchema,
} from "./section-content.js";
import {
  bannerSettingsSchema,
  blogTeaserSettingsSchema,
  brandStripSettingsSchema,
  categoryShowcaseSettingsSchema,
  featuredProductsSettingsSchema,
  heroSettingsSchema,
  testimonialSettingsSchema,
} from "./section-settings.js";

const sectionBase = z.object({
  key: sectionKeySchema,
  pageKey: pageKeySchema,
  title: z.string().trim().max(120).optional(),
  sortOrder: z.number().int().nonnegative().optional(),
  isActive: z.boolean().optional(),
});

/**
 * A CMS section document.
 *
 * `sortOrder` is present in responses but is server-managed: creates append,
 * and the only way to change order is PATCH /sections/reorder.
 */
export const sectionSchema = z.discriminatedUnion("type", [
  sectionBase
    .extend({
      type: z.literal("hero"),
      content: heroContentSchema,
      settings: heroSettingsSchema.optional(),
    })
    .strict(),
  sectionBase
    .extend({
      type: z.literal("banner"),
      content: bannerContentSchema,
      settings: bannerSettingsSchema.optional(),
    })
    .strict(),
  sectionBase
    .extend({
      type: z.literal("featured_products"),
      content: featuredProductsContentSchema,
      settings: featuredProductsSettingsSchema.optional(),
    })
    .strict(),
  sectionBase
    .extend({
      type: z.literal("category_showcase"),
      content: categoryShowcaseContentSchema,
      settings: categoryShowcaseSettingsSchema.optional(),
    })
    .strict(),
  sectionBase
    .extend({
      type: z.literal("brand_strip"),
      content: brandStripContentSchema,
      settings: brandStripSettingsSchema.optional(),
    })
    .strict(),
  sectionBase
    .extend({
      type: z.literal("blog_teaser"),
      content: blogTeaserContentSchema,
      settings: blogTeaserSettingsSchema.optional(),
    })
    .strict(),
  sectionBase
    .extend({
      type: z.literal("testimonial"),
      content: testimonialContentSchema,
      settings: testimonialSettingsSchema.optional(),
    })
    .strict(),
]);

export const sectionListResponseSchema = z
  .object({
    sections: z.array(sectionSchema),
    version: versionSchema,
  })
  .strict();

export const sectionReorderSchema = z
  .object({
    pageKey: pageKeySchema,
    orderedKeys: z.array(sectionKeySchema).min(1).max(200),
  })
  .strict()
  .refine(
    (value) => new Set(value.orderedKeys).size === value.orderedKeys.length,
    {
      path: ["orderedKeys"],
      message: "orderedKeys must be unique",
    },
  );

export type Section = z.infer<typeof sectionSchema>;
export type SectionListResponse = z.infer<typeof sectionListResponseSchema>;
export type SectionReorder = z.infer<typeof sectionReorderSchema>;
