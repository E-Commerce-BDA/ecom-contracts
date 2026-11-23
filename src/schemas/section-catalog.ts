import type { z } from "zod";
import { sectionContentByType } from "./section-content.js";
import {
  sectionSettingsByType,
  type SectionSettingKey,
} from "./section-settings.js";
import type { SectionType } from "./section-types.js";

export interface SectionAdminRules {
  readonly create: boolean;
  readonly delete: boolean;
  readonly reorder: boolean;
  readonly toggleActive: boolean;
  readonly editTitle: boolean;
  readonly editContent: boolean;
  readonly editSettings: boolean;
  readonly immutableFields: readonly string[];
}

export type SectionGroup = "home" | "pdp";

export interface SectionCatalogEntry {
  readonly type: SectionType;
  readonly group: SectionGroup;
  readonly label: string;
  readonly description: string;
  readonly allowedSettings: readonly SectionSettingKey[];
  readonly contentSchema: z.ZodTypeAny;
  readonly settingsSchema: z.ZodTypeAny;
  readonly admin: SectionAdminRules;
}

const SECTION_ADMIN_RULES: SectionAdminRules = {
  create: true,
  delete: true,
  reorder: true,
  toggleActive: true,
  editTitle: true,
  editContent: true,
  editSettings: true,
  immutableFields: [
    "key",
    "pageKey",
    "type",
    "sortOrder",
    "createdAt",
    "updatedAt",
  ],
};

export const SECTION_CATALOG = {
  hero: {
    type: "hero",
    group: "home",
    label: "Hero",
    description:
      "Primary split hero with ordered slides, per-slide layout, and 0-3 CTAs per slide.",
    allowedSettings: ["bgColor", "blendMode", "ratio", "customRatio", "height"],
    contentSchema: sectionContentByType.hero,
    settingsSchema: sectionSettingsByType.hero,
    admin: SECTION_ADMIN_RULES,
  },
  banner: {
    type: "banner",
    group: "home",
    label: "Banner",
    description:
      "Full-width promotional strip with image, copy, alignment, and 0-3 CTAs.",
    allowedSettings: ["bgColor", "blendMode"],
    contentSchema: sectionContentByType.banner,
    settingsSchema: sectionSettingsByType.banner,
    admin: SECTION_ADMIN_RULES,
  },
  featured_products: {
    type: "featured_products",
    group: "home",
    label: "Featured products",
    description:
      "Product collection: manual ordered picker or newest arrivals, rendered as a grid or carousel.",
    allowedSettings: [
      "bgColor",
      "blendMode",
      "ratio",
      "customRatio",
      "gutter",
      "showPhotos",
      "maxItems",
    ],
    contentSchema: sectionContentByType.featured_products,
    settingsSchema: sectionSettingsByType.featured_products,
    admin: SECTION_ADMIN_RULES,
  },
  category_showcase: {
    type: "category_showcase",
    group: "home",
    label: "Category showcase",
    description:
      "Ordered category cards with optional images and configurable grid density.",
    allowedSettings: [
      "bgColor",
      "blendMode",
      "ratio",
      "customRatio",
      "gutter",
      "showPhotos",
      "maxItems",
    ],
    contentSchema: sectionContentByType.category_showcase,
    settingsSchema: sectionSettingsByType.category_showcase,
    admin: SECTION_ADMIN_RULES,
  },
  brand_strip: {
    type: "brand_strip",
    group: "home",
    label: "Brand strip",
    description:
      "Logo row. Empty brandIds means active brands in sort order, capped by maxItems; items pin the order and may carry a label beside each logo. A brand with no logo still shows its name.",
    allowedSettings: [
      "bgColor",
      "blendMode",
      "gutter",
      "maxItems",
      "motion",
      "speed",
      "direction",
      "pauseOnHover",
    ],
    contentSchema: sectionContentByType.brand_strip,
    settingsSchema: sectionSettingsByType.brand_strip,
    admin: SECTION_ADMIN_RULES,
  },
  blog_teaser: {
    type: "blog_teaser",
    group: "home",
    label: "Blog teaser",
    description:
      "Published blog cards. Empty postIds means latest published posts, capped by count or maxItems.",
    allowedSettings: ["bgColor", "blendMode", "gutter", "maxItems"],
    contentSchema: sectionContentByType.blog_teaser,
    settingsSchema: sectionSettingsByType.blog_teaser,
    admin: SECTION_ADMIN_RULES,
  },
  testimonial: {
    type: "testimonial",
    group: "home",
    label: "Testimonial",
    description:
      "CMS-managed quote cards with optional rating, verified flag and date. Hidden when empty.",
    allowedSettings: [
      "bgColor",
      "blendMode",
      "gutter",
      "maxItems",
      "layout",
      "speed",
      "pauseOnHover",
    ],
    contentSchema: sectionContentByType.testimonial,
    settingsSchema: sectionSettingsByType.testimonial,
    admin: SECTION_ADMIN_RULES,
  },
  pdp_description: {
    type: "pdp_description",
    group: "pdp",
    label: "Product description",
    description:
      "PDP description. Absent body uses the catalog description; a present body is sanitized rich text that overrides it.",
    allowedSettings: ["bgColor", "gutter", "layout"],
    contentSchema: sectionContentByType.pdp_description,
    settingsSchema: sectionSettingsByType.pdp_description,
    admin: SECTION_ADMIN_RULES,
  },
  pdp_details: {
    type: "pdp_details",
    group: "pdp",
    label: "Product details",
    description:
      "PDP specification list. Absent rows use scalar catalog attributes; present rows override them in admin order.",
    allowedSettings: ["bgColor", "gutter", "columns"],
    contentSchema: sectionContentByType.pdp_details,
    settingsSchema: sectionSettingsByType.pdp_details,
    admin: SECTION_ADMIN_RULES,
  },
  pdp_reviews: {
    type: "pdp_reviews",
    group: "pdp",
    label: "Product reviews",
    description:
      "PDP reviews the CMS authored. Empty items hide the section; the buy-box rating is averaged only from numeric item ratings.",
    allowedSettings: [
      "bgColor",
      "gutter",
      "maxItems",
      "layout",
      "speed",
      "pauseOnHover",
    ],
    contentSchema: sectionContentByType.pdp_reviews,
    settingsSchema: sectionSettingsByType.pdp_reviews,
    admin: SECTION_ADMIN_RULES,
  },
  pdp_related: {
    type: "pdp_related",
    group: "pdp",
    label: "Related products",
    description:
      "Related products. Category/brand sources use the product's category or brand and exclude the current product; manual source pins ordered product ids.",
    allowedSettings: [
      "bgColor",
      "blendMode",
      "ratio",
      "customRatio",
      "gutter",
      "showPhotos",
      "maxItems",
    ],
    contentSchema: sectionContentByType.pdp_related,
    settingsSchema: sectionSettingsByType.pdp_related,
    admin: SECTION_ADMIN_RULES,
  },
  pdp_trust: {
    type: "pdp_trust",
    group: "pdp",
    label: "Trust badges",
    description:
      "PDP trust items with closed icon vocabulary. Empty items hide the section; there is no implicit fallback when the CMS page is present.",
    allowedSettings: ["bgColor", "gutter", "maxItems", "layout", "showIcons"],
    contentSchema: sectionContentByType.pdp_trust,
    settingsSchema: sectionSettingsByType.pdp_trust,
    admin: SECTION_ADMIN_RULES,
  },
  pdp_story: {
    type: "pdp_story",
    group: "pdp",
    label: "Product story",
    description:
      "PDP story with sanitized rich text, an optional image, and 0-3 CTAs. Requires a body or an image.",
    allowedSettings: [
      "bgColor",
      "blendMode",
      "ratio",
      "customRatio",
      "gutter",
      "layout",
    ],
    contentSchema: sectionContentByType.pdp_story,
    settingsSchema: sectionSettingsByType.pdp_story,
    admin: SECTION_ADMIN_RULES,
  },
  pdp_faq: {
    type: "pdp_faq",
    group: "pdp",
    label: "Product FAQ",
    description:
      "PDP questions. Accordion is closed by default with no JavaScript; list renders every answer.",
    allowedSettings: ["bgColor", "gutter", "maxItems", "layout"],
    contentSchema: sectionContentByType.pdp_faq,
    settingsSchema: sectionSettingsByType.pdp_faq,
    admin: SECTION_ADMIN_RULES,
  },
} satisfies Record<SectionType, SectionCatalogEntry>;

export type SectionCatalog = typeof SECTION_CATALOG;
