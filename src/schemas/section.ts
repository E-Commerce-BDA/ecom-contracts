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
  pdpDescriptionContentSchema,
  pdpDetailsContentSchema,
  pdpFaqContentSchema,
  pdpRelatedContentSchema,
  pdpReviewsContentSchema,
  pdpStoryContentSchema,
  pdpTrustContentSchema,
  testimonialContentSchema,
} from "./section-content.js";
import {
  bannerSettingsSchema,
  blogTeaserSettingsSchema,
  brandStripSettingsSchema,
  categoryShowcaseSettingsSchema,
  featuredProductsSettingsSchema,
  heroSettingsSchema,
  pdpDescriptionSettingsSchema,
  pdpDetailsSettingsSchema,
  pdpFaqSettingsSchema,
  pdpRelatedSettingsSchema,
  pdpReviewsSettingsSchema,
  pdpStorySettingsSchema,
  pdpTrustSettingsSchema,
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
  sectionBase
    .extend({
      type: z.literal("pdp_description"),
      content: pdpDescriptionContentSchema,
      settings: pdpDescriptionSettingsSchema.optional(),
    })
    .strict(),
  sectionBase
    .extend({
      type: z.literal("pdp_details"),
      content: pdpDetailsContentSchema,
      settings: pdpDetailsSettingsSchema.optional(),
    })
    .strict(),
  sectionBase
    .extend({
      type: z.literal("pdp_reviews"),
      content: pdpReviewsContentSchema,
      settings: pdpReviewsSettingsSchema.optional(),
    })
    .strict(),
  sectionBase
    .extend({
      type: z.literal("pdp_related"),
      content: pdpRelatedContentSchema,
      settings: pdpRelatedSettingsSchema.optional(),
    })
    .strict(),
  sectionBase
    .extend({
      type: z.literal("pdp_trust"),
      content: pdpTrustContentSchema,
      settings: pdpTrustSettingsSchema.optional(),
    })
    .strict(),
  sectionBase
    .extend({
      type: z.literal("pdp_story"),
      content: pdpStoryContentSchema,
      settings: pdpStorySettingsSchema.optional(),
    })
    .strict(),
  sectionBase
    .extend({
      type: z.literal("pdp_faq"),
      content: pdpFaqContentSchema,
      settings: pdpFaqSettingsSchema.optional(),
    })
    .strict(),
]);

export const sectionListResponseSchema = z
  .object({
    sections: z.array(sectionSchema),
    version: versionSchema,
  })
  .strict();

/**
 * Outer envelope for public section reads. Storefront consumers use this
 * instead of `sectionListResponseSchema` so a single unknown/invalid
 * section does not null the entire list: validate the envelope, then run
 * `sectionSchema.safeParse` per entry and skip only the failures.
 */
export const sectionListEnvelopeSchema = z
  .object({
    sections: z.array(z.unknown()),
    version: versionSchema,
    // cms-012: shopper visibility state, even on a preview read.
    state: z.enum(["missing", "empty", "published"]).optional(),
  })
  .strict();

/**
 * Clone a section page key into another. Used to materialize `pdp-default`
 * into each product's `pdp-<id>` page. `replace` is required to overwrite
 * an already-populated target.
 */
export const cloneSectionsSchema = z
  .object({
    fromPageKey: pageKeySchema,
    toPageKey: pageKeySchema,
    replace: z.boolean().optional(),
  })
  .strict()
  .refine((value) => value.fromPageKey !== value.toPageKey, {
    path: ["toPageKey"],
    message: "target page must differ from source",
  });

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
export type SectionListEnvelope = z.infer<typeof sectionListEnvelopeSchema>;
export type SectionReorder = z.infer<typeof sectionReorderSchema>;
export type CloneSections = z.infer<typeof cloneSectionsSchema>;
