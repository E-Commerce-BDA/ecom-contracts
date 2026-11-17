import { describe, expect, it } from "vitest";
import {
  cloneSectionsSchema,
  SECTION_CATALOG,
  SECTION_SETTING_KEYS,
  SECTION_TYPES,
  sectionListEnvelopeSchema,
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
      pageKey: "homepage",
      orderedKeys: ["home-hero", "home-hero"],
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing pageKey", () => {
    const result = sectionReorderSchema.safeParse({
      orderedKeys: ["home-hero", "home-banner"],
    });
    expect(result.success).toBe(false);
  });

  it("accepts a unique ordered key list with pageKey", () => {
    const result = sectionReorderSchema.safeParse({
      pageKey: "homepage",
      orderedKeys: ["home-hero", "home-banner"],
    });
    expect(result.success).toBe(true);
  });
});

/**
 * 1.12.0 field extensions. Every case here must keep the 1.11 payloads above
 * valid — this is a MINOR release, so absent keys mean the old behaviour.
 */
describe("sectionSchema 1.12 extensions", () => {
  it("accepts hero height and refuses values outside the enum", () => {
    expect(
      sectionSchema.safeParse({
        ...HERO,
        settings: { ratio: "16:9", height: "viewport" },
      }).success,
    ).toBe(true);
    expect(
      sectionSchema.safeParse({ ...HERO, settings: { height: "tall" } }).success,
    ).toBe(false);
  });

  it("keeps source absent meaning manual for featured products", () => {
    const legacy = {
      ...HERO,
      key: "home-featured",
      type: "featured_products",
      content: {
        productIds: ["11111111-1111-4111-8111-111111111111"],
      },
    };
    expect(sectionSchema.safeParse(legacy).success).toBe(true);

    const newest = {
      ...HERO,
      key: "home-featured",
      type: "featured_products",
      content: { source: "newest" },
      settings: { maxItems: 8 },
    };
    expect(sectionSchema.safeParse(newest).success).toBe(true);

    const fakeMetric = {
      ...HERO,
      key: "home-featured",
      type: "featured_products",
      content: { source: "popular" },
    };
    expect(sectionSchema.safeParse(fakeMetric).success).toBe(false);
  });

  it("accepts brand_strip marquee settings and rejects out-of-band speed", () => {
    expect(
      sectionSchema.safeParse({
        ...HERO,
        key: "home-brands",
        type: "brand_strip",
        content: { brandIds: [] },
        settings: {
          motion: "marquee",
          speed: 60,
          direction: "left",
          pauseOnHover: true,
        },
      }).success,
    ).toBe(true);
    expect(
      sectionSchema.safeParse({
        ...HERO,
        key: "home-brands",
        type: "brand_strip",
        content: {},
        settings: { motion: "marquee", speed: 10 },
      }).success,
    ).toBe(false);
    expect(
      sectionSchema.safeParse({
        ...HERO,
        key: "home-brands",
        type: "brand_strip",
        content: {},
        settings: { motion: "carousel" },
      }).success,
    ).toBe(false);
  });

  it("accepts labelled brand items and rejects unknown item keys", () => {
    const result = sectionSchema.safeParse({
      ...HERO,
      key: "home-brands",
      type: "brand_strip",
      settings: { maxItems: 12 },
      content: {
        items: [
          { brandId: "33333333-3333-4333-8333-333333333333", label: "Northwind" },
          { brandId: "44444444-4444-4444-8444-444444444444" },
        ],
      },
    });
    expect(result.success).toBe(true);

    const smuggled = sectionSchema.safeParse({
      ...HERO,
      key: "home-brands",
      type: "brand_strip",
      settings: { maxItems: 12 },
      content: {
        items: [
          {
            brandId: "33333333-3333-4333-8333-333333333333",
            href: "https://evil.example",
          },
        ],
      },
    });
    expect(smuggled.success).toBe(false);
  });

  it("accepts testimonial rating/verified/date and grid/marquee layout", () => {
    expect(
      sectionSchema.safeParse({
        ...HERO,
        key: "home-testimonials",
        type: "testimonial",
        content: {
          items: [
            {
              id: "quote_01",
              quote: "Great quality.",
              name: "A. Buyer",
              rating: 5,
              verified: true,
              date: "2026-10-01",
            },
          ],
        },
        settings: { layout: "marquee", speed: 40, pauseOnHover: true },
      }).success,
    ).toBe(true);
    expect(
      sectionSchema.safeParse({
        ...HERO,
        key: "home-testimonials",
        type: "testimonial",
        settings: { maxItems: 6 },
        content: {
          items: [
            { id: "q", quote: "x", name: "n", rating: 6 },
          ],
        },
      }).success,
    ).toBe(false);
    expect(
      sectionSchema.safeParse({
        ...HERO,
        key: "home-testimonials",
        type: "testimonial",
        content: { items: [] },
        settings: { layout: "carousel" },
      }).success,
    ).toBe(false);
  });

  it("refuses motion settings on a type that does not expose them", () => {
    const result = sectionSchema.safeParse({
      ...HERO,
      settings: { ratio: "16:9", motion: "marquee" },
    });
    expect(result.success).toBe(false);
  });
});

describe("SECTION_CATALOG 1.12 rows", () => {
  it("exposes the new keys only on the types that render them", () => {
    expect(SECTION_CATALOG.hero.allowedSettings).toContain("height");
    expect(SECTION_CATALOG.brand_strip.allowedSettings).toEqual(
      expect.arrayContaining([
        "motion",
        "speed",
        "direction",
        "pauseOnHover",
      ]),
    );
    expect(SECTION_CATALOG.testimonial.allowedSettings).toEqual(
      expect.arrayContaining(["layout", "speed", "pauseOnHover"]),
    );
    expect(SECTION_CATALOG.featured_products.allowedSettings).not.toContain(
      "motion",
    );
    expect(SECTION_CATALOG.blog_teaser.allowedSettings).not.toContain("speed");
  });

  it("keeps every allowedSettings entry inside SECTION_SETTING_KEYS", () => {
    for (const type of SECTION_TYPES) {
      for (const key of SECTION_CATALOG[type].allowedSettings) {
        expect(SECTION_SETTING_KEYS).toContain(key);
      }
    }
  });
});

describe("PDP sections 1.14", () => {
  const base = { key: "pdp-x", pageKey: "pdp-default", sortOrder: 0 } as const;

  it("groups home and pdp types", () => {
    expect(SECTION_CATALOG.hero.group).toBe("home");
    expect(SECTION_CATALOG.pdp_description.group).toBe("pdp");
    expect(SECTION_CATALOG.pdp_faq.group).toBe("pdp");
  });

  it("accepts every pdp type with minimal content", () => {
    const cases = [
      { ...base, type: "pdp_description", content: {} },
      { ...base, type: "pdp_details", content: {} },
      {
        ...base,
        type: "pdp_reviews",
        content: {
          items: [{ id: "r1", quote: "Great", name: "Sam" }],
        },
      },
      {
        ...base,
        type: "pdp_related",
        content: { source: "category", layout: "grid" },
      },
      {
        ...base,
        type: "pdp_trust",
        content: {
          items: [
            {
              id: "ship",
              icon: "truck",
              title: "Shipping",
              description: "Free over $50",
            },
          ],
        },
      },
      {
        ...base,
        type: "pdp_story",
        content: { body: "<p>Our story</p>" },
      },
      {
        ...base,
        type: "pdp_faq",
        content: { items: [{ question: "When?", answer: "Today." }] },
      },
    ];
    for (const value of cases) {
      expect(sectionSchema.safeParse(value).success).toBe(true);
    }
  });

  it("rejects closed-icon violations and related source mistakes", () => {
    expect(
      sectionSchema.safeParse({
        ...base,
        type: "pdp_trust",
        content: {
          items: [
            {
              id: "x",
              icon: "rocket",
              title: "Nope",
              description: "Nope",
            },
          ],
        },
      }).success,
    ).toBe(false);

    expect(
      sectionSchema.safeParse({
        ...base,
        type: "pdp_related",
        content: { source: "manual" },
      }).success,
    ).toBe(false);

    expect(
      sectionSchema.safeParse({
        ...base,
        type: "pdp_related",
        content: {
          source: "category",
          productIds: ["00000000-0000-4000-8000-0000000000c1"],
        },
      }).success,
    ).toBe(false);
  });

  it("requires a story body or image and at least one faq item", () => {
    expect(
      sectionSchema.safeParse({
        ...base,
        type: "pdp_story",
        content: { title: "Story" },
      }).success,
    ).toBe(false);
    expect(
      sectionSchema.safeParse({
        ...base,
        type: "pdp_faq",
        content: { items: [] },
      }).success,
    ).toBe(false);
  });

  it("exposes only sparse pdp settings", () => {
    expect(
      sectionSchema.safeParse({
        ...base,
        type: "pdp_details",
        content: {},
        settings: { columns: 2, gutter: 8 },
      }).success,
    ).toBe(true);
    expect(
      sectionSchema.safeParse({
        ...base,
        type: "pdp_details",
        content: {},
        settings: { ratio: "1:1" },
      }).success,
    ).toBe(false);
    expect(
      sectionSchema.safeParse({
        ...base,
        type: "pdp_trust",
        content: {},
        settings: { layout: "grid", showIcons: false },
      }).success,
    ).toBe(true);
  });

  it("tolerates unknown sections in the envelope but rejects them in the strict list", () => {
    const envelope = {
      sections: [{ ...base, type: "future_type", content: {} }, { ...base, type: "pdp_details", content: {} }],
      version: 3,
    };
    expect(sectionListEnvelopeSchema.safeParse(envelope).success).toBe(true);
    expect(sectionListResponseSchema.safeParse(envelope).success).toBe(false);
  });

  it("validates clone requests", () => {
    expect(
      cloneSectionsSchema.safeParse({
        fromPageKey: "pdp-default",
        toPageKey: "pdp-00000000-0000-4000-8000-000000000001",
      }).success,
    ).toBe(true);
    expect(
      cloneSectionsSchema.safeParse({
        fromPageKey: "pdp-default",
        toPageKey: "pdp-default",
      }).success,
    ).toBe(false);
  });
});
