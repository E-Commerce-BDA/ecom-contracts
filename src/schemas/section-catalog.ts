import type { z } from "zod";
import { sectionContentByType } from "./section-content.js";
import {
  sectionSettingsByType,
  type SectionSettingKey,
} from "./section-settings.js";
import type { SectionType } from "./section-types.js";

/**
 * Admin governance for CMS sections.
 *
 * This catalog is the single source of truth for:
 * - which section types exist;
 * - which settings keys each type may override;
 * - which fields the admin may edit;
 * - which fields are server-managed or immutable.
 *
 * The admin UI and cms-svc both consume it. Adding a section type or an
 * editable field is a contracts MINOR release; changing meaning is MAJOR.
 */
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

export interface SectionCatalogEntry {
  readonly type: SectionType;
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
    label: "Hero",
    description:
      "Primary split hero with ordered slides, per-slide layout, and 0-3 CTAs per slide.",
    allowedSettings: ["bgColor", "blendMode", "ratio", "customRatio"],
    contentSchema: sectionContentByType.hero,
    settingsSchema: sectionSettingsByType.hero,
    admin: SECTION_ADMIN_RULES,
  },
  banner: {
    type: "banner",
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
    label: "Featured products",
    description:
      "Ordered manual product picker rendered as a grid or carousel. Category-driven selection is deferred.",
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
    label: "Brand strip",
    description:
      "Logo row. Empty brandIds means active brands with logos, capped by maxItems; supplied ids pin order.",
    allowedSettings: ["bgColor", "blendMode", "gutter", "maxItems"],
    contentSchema: sectionContentByType.brand_strip,
    settingsSchema: sectionSettingsByType.brand_strip,
    admin: SECTION_ADMIN_RULES,
  },
  blog_teaser: {
    type: "blog_teaser",
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
    label: "Testimonial",
    description:
      "CMS-managed quote cards. Optional in v1; hidden when empty.",
    allowedSettings: ["bgColor", "blendMode", "gutter", "maxItems"],
    contentSchema: sectionContentByType.testimonial,
    settingsSchema: sectionSettingsByType.testimonial,
    admin: SECTION_ADMIN_RULES,
  },
} satisfies Record<SectionType, SectionCatalogEntry>;

export type SectionCatalog = typeof SECTION_CATALOG;
