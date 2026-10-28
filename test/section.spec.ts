import { describe, expect, it } from "vitest";
import {
  SECTION_CATALOG,
  SECTION_TYPES,
  sectionListResponseSchema,
  sectionReorderSchema,
  sectionSchema,
} from "../src/index.js";

const HERO_SLIDE = {
  id: "slide_01",
  eyebrow: "New collection",
  headline: "Built for everyday",
  subcopy: "Simple, durable pieces.",
  image: "media/hero-01.webp",
  imageAlt: "Model wearing an overshirt",
  bgColor: "#ffffff",
  textColor: "#111111",
  imageBgColor: "#f2f2f2",
  ctas: [
    {
      id: "cta_01",
      text: "Shop now",
      link: "/products",
      bg: "#111111",
      textColor: "#ffffff",
      borderColor: "#111111",
      borderWidth: 1,
      borderRadius: 6,
    },
  ],
  split: "50-50",
  flip: false,
  ratio: "4:3",
} as const;

const HERO = {
  key: "home-hero",
  pageKey: "homepage",
  type: "hero",
  title: "Home hero",
  content: { slides: [HERO_SLIDE] },
  settings: { ratio: "16:9", blendMode: "multiply" },
  sortOrder: 0,
  isActive: true,
} as const;

describe("sectionSchema", () => {
  it("parses a valid hero section", () => {
    const result = sectionSchema.safeParse(HERO);
    expect(result.success).toBe(true);
  });

  it("accepts 0 and 3 CTAs", () => {
    const zero = {
      ...HERO,
      content: { slides: [{ ...HERO_SLIDE, ctas: [] }] },
    };
    expect(sectionSchema.safeParse(zero).success).toBe(true);

    const three = {
      ...HERO,
      content: {
        slides: [
          {
            ...HERO_SLIDE,
            ctas: [
              HERO_SLIDE.ctas[0],
              { ...HERO_SLIDE.ctas[0], id: "cta_02" },
              { ...HERO_SLIDE.ctas[0], id: "cta_03" },
            ],
          },
        ],
      },
    };
    expect(sectionSchema.safeParse(three).success).toBe(true);
  });

  it("rejects more than 3 CTAs", () => {
    const result = sectionSchema.safeParse({
      ...HERO,
      content: {
        slides: [
          {
            ...HERO_SLIDE,
            ctas: [
              HERO_SLIDE.ctas[0],
              { ...HERO_SLIDE.ctas[0], id: "cta_02" },
              { ...HERO_SLIDE.ctas[0], id: "cta_03" },
              { ...HERO_SLIDE.ctas[0], id: "cta_04" },
            ],
          },
        ],
      },
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path.join(".")).toContain(
        "content.slides.0.ctas",
      );
    }
  });

  it("rejects null overrides instead of treating them as inherit", () => {
    const result = sectionSchema.safeParse({
      ...HERO,
      settings: { ratio: null },
    });
    expect(result.success).toBe(false);
  });

  it("rejects a setting the section type does not expose", () => {
    const result = sectionSchema.safeParse({
      ...HERO,
      settings: { maxItems: 6 },
    });
    expect(result.success).toBe(false);
  });

  it("requires customRatio to be paired with ratio=custom", () => {
    const bad = sectionSchema.safeParse({
      ...HERO,
      settings: { ratio: "16:9", customRatio: 1.4 },
    });
    expect(bad.success).toBe(false);

    const good = sectionSchema.safeParse({
      ...HERO,
      settings: { ratio: "custom", customRatio: 1.4 },
    });
    expect(good.success).toBe(true);
  });

  it("rejects non-internal CTA links", () => {
    const result = sectionSchema.safeParse({
      ...HERO,
      content: {
        slides: [
          {
            ...HERO_SLIDE,
            ctas: [{ ...HERO_SLIDE.ctas[0], link: "//evil.example" }],
          },
        ],
      },
    });
    expect(result.success).toBe(false);
  });

  it("rejects unsafe image refs", () => {
    const result = sectionSchema.safeParse({
      ...HERO,
      content: {
        slides: [{ ...HERO_SLIDE, image: "javascript:alert(1)" }],
      },
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-kebab-case section keys", () => {
    expect(sectionSchema.safeParse({ ...HERO, key: "HomeHero" }).success).toBe(
      false,
    );
  });

  it("parses the other v1 section types", () => {
    const cases = [
      {
        ...HERO,
        key: "home-banner",
        type: "banner",
        content: { title: "Free shipping", image: "media/banner.webp" },
        settings: { bgColor: "#ffffff" },
      },
      {
        ...HERO,
        key: "home-featured",
        type: "featured_products",
        content: {
          title: "Featured",
          productIds: ["11111111-1111-4111-8111-111111111111"],
          layout: "carousel",
        },
        settings: { maxItems: 8, showPhotos: true },
      },
      {
        ...HERO,
        key: "home-categories",
        type: "category_showcase",
        content: {
          title: "Shop by category",
          categoryIds: ["22222222-2222-4222-8222-222222222222"],
        },
        settings: { showPhotos: true, maxItems: 6 },
      },
      {
        ...HERO,
        key: "home-brands",
        type: "brand_strip",
        content: {
          brandIds: ["33333333-3333-4333-8333-333333333333"],
        },
        settings: { maxItems: 12 },
      },
      {
        ...HERO,
        key: "home-blog",
        type: "blog_teaser",
        content: { title: "From the journal", count: 3 },
        settings: { maxItems: 3 },
      },
      {
        ...HERO,
        key: "home-testimonials",
        type: "testimonial",
        content: {
          items: [
            { id: "quote_01", quote: "Great quality.", name: "A. Buyer" },
          ],
        },
        settings: { maxItems: 6 },
      },
    ];

    for (const value of cases) {
      expect(sectionSchema.safeParse(value).success).toBe(true);
    }
  });

  it("rejects unknown section types", () => {
    const result = sectionSchema.safeParse({ ...HERO, type: "carousel" });
    expect(result.success).toBe(false);
  });
});

describe("SECTION_CATALOG", () => {
  it("covers every section type exactly once", () => {
    expect(Object.keys(SECTION_CATALOG).sort()).toEqual(
      [...SECTION_TYPES].sort(),
    );
  });

  it("locks server-managed and identity fields", () => {
    for (const type of SECTION_TYPES) {
      const entry = SECTION_CATALOG[type];
      expect(entry.type).toBe(type);
      expect(entry.admin.immutableFields).toEqual(
        expect.arrayContaining([
          "key",
          "pageKey",
          "type",
          "sortOrder",
          "createdAt",
          "updatedAt",
        ]),
      );
      expect(entry.admin.create).toBe(true);
      expect(entry.admin.delete).toBe(true);
      expect(entry.admin.reorder).toBe(true);
      expect(entry.admin.toggleActive).toBe(true);
    }
  });

  it("exposes only type-specific settings", () => {
    expect(SECTION_CATALOG.hero.allowedSettings).not.toContain("maxItems");
    expect(SECTION_CATALOG.featured_products.allowedSettings).toContain(
      "maxItems",
    );
    expect(SECTION_CATALOG.banner.allowedSettings).toEqual([
      "bgColor",
      "blendMode",
    ]);
  });
});

describe("sectionListResponseSchema", () => {
  it("wraps sections with the CMS revision", () => {
    const result = sectionListResponseSchema.safeParse({
      sections: [HERO],
      version: 7,
    });
    expect(result.success).toBe(true);
  });
});

describe("sectionReorderSchema", () => {
  it("rejects duplicate keys", () => {
    const result = sectionReorderSchema.safeParse({
      orderedKeys: ["home-hero", "home-hero"],
    });
    expect(result.success).toBe(false);
  });

  it("accepts a unique ordered key list", () => {
    const result = sectionReorderSchema.safeParse({
      orderedKeys: ["home-hero", "home-banner"],
    });
    expect(result.success).toBe(true);
  });
});
