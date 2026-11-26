import { describe, expect, it } from "vitest";
import {
  authSettingsSchema,
  blogCategorySchema,
  blogListResponseSchema,
  blogSchema,
  blogUpdatedPayloadSchema,
  cmsUpdatedPayloadSchema,
  canonicalEventEnvelopeSchema,
  createBlogSchema,
  createPageSchema,
  eventEnvelopeSchema,
  mediaListResponseSchema,
  mediaSchema,
  navResponseSchema,
  navSettingsSchema,
  pageListResponseSchema,
  pageSchema,
  pageSettingsResponseSchema,
  readEventEnvelope,
  resizeImageJobSchema,
  themeResponseSchema,
  themeSettingsSchema,
  themeProductCardSchema,
  themePhotoSettingsSchema,
  badgeSchema,
  createBadgeSchema,
  productBadgeAssignmentSchema,
  productBadgeItemSchema,
  productCardOptionSchema,
  productCardSettingsSchema,
  catalogProductQuerySchema,
  catalogProductSortSchema,
  navCartSchema,
  reindexSearchDocumentsSchema,
} from "../src/index.js";

describe("Theme schemas", () => {
  it("parses valid theme settings with sparse values", () => {
    const validTheme = {
      button: {
        defaultVariant: "primary",
        borderRadius: 8,
        bg: "#0077b6",
      },
      dialog: {
        overlayAlpha: 50,
        maxWidth: 448,
      },
    };
    const parsed = themeSettingsSchema.safeParse(validTheme);
    expect(parsed.success).toBe(true);
  });

  it("wraps theme in themeResponseSchema with version", () => {
    const res = themeResponseSchema.safeParse({
      theme: {
        input: { borderRadius: 10 },
      },
      version: 4,
    });
    expect(res.success).toBe(true);
  });

  it("accepts the additive configured flag on theme responses", () => {
    expect(
      themeResponseSchema.safeParse({
        theme: { input: { borderRadius: 10 } },
        version: 4,
        configured: true,
      }).success,
    ).toBe(true);
  });

  it("rejects unknown fields when strict", () => {
    const res = themeSettingsSchema.safeParse({
      button: { unknownField: true },
    });
    expect(res.success).toBe(false);
  });

  it("parses and clamps theme photoSettings", () => {
    expect(
      themePhotoSettingsSchema.safeParse({
        format: "horizontal",
        ratio: "4:5",
        customRatio: 1.2,
        layout: "grid",
        gutter: 8,
        widthPercent: 100,
        blendMode: "normal",
        showPhotos: true,
      }).success,
    ).toBe(true);
    expect(themePhotoSettingsSchema.safeParse({ gutter: 49 }).success).toBe(false);
    expect(themePhotoSettingsSchema.safeParse({ widthPercent: 10 }).success).toBe(false);
    expect(themePhotoSettingsSchema.safeParse({ ratio: "2:1" }).success).toBe(false);
    expect(
      themeSettingsSchema.safeParse({ photoSettings: { layout: "carousel" } }).success,
    ).toBe(true);
  });

  it("parses valid themeProductCard in themeSettingsSchema", () => {
    const res = themeSettingsSchema.safeParse({
      productCard: {
        cardType: "standard",
        mediaRatio: "4:5",
        borderRadius: 8,
        cardBg: "#ffffff",
        borderColor: "#e2e8f0",
        ctaVariant: "below",
        ctaStyle: "icon-label",
        ctaSet: ["add-to-cart", "wishlist"],
        showSwatches: true,
      },
    });
    expect(res.success).toBe(true);
  });
});

describe("Catalog & ProductCard schemas", () => {
  it("validates badge creation and full badge schema", () => {
    const create = createBadgeSchema.safeParse({
      key: "eco-friendly",
      label: "Eco Friendly",
      bg: "#10b981",
      textColor: "#ffffff",
      borderStyle: "solid",
    });
    expect(create.success).toBe(true);

    const fullBadge = badgeSchema.safeParse({
      id: "a0000000-0000-0000-0000-000000000001",
      key: "sale",
      label: "Sale",
      bg: "#ef4444",
      textColor: "#ffffff",
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    expect(fullBadge.success).toBe(true);
  });

  it("validates product badge item and assignment", () => {
    const assignment = productBadgeAssignmentSchema.safeParse({
      productId: "b0000000-0000-0000-0000-000000000001",
      badgeId: "a0000000-0000-0000-0000-000000000001",
      sortOrder: 1,
    });
    expect(assignment.success).toBe(true);

    const item = productBadgeItemSchema.safeParse({
      id: "a0000000-0000-0000-0000-000000000001",
      key: "new",
      label: "New",
      bg: "#3b82f6",
      textColor: "#ffffff",
    });
    expect(item.success).toBe(true);
  });

  it("validates product card options with pills and color swatches", () => {
    const option = productCardOptionSchema.safeParse({
      name: "Color",
      displayType: "swatch",
      showOnCard: true,
      values: [
        { value: "Navy", swatchHex: "#000080" },
        { value: "Crimson", swatchHex: "#dc143c" },
      ],
    });
    expect(option.success).toBe(true);

    const sizeOption = productCardOptionSchema.safeParse({
      name: "Size",
      displayType: "pill",
      showOnCard: true,
      values: [{ value: "S" }, { value: "M" }, { value: "L" }],
    });
    expect(sizeOption.success).toBe(true);
  });
});

describe("Catalog product query schemas (1.15.0)", () => {
  it("accepts every advertised sort", () => {
    for (const sort of catalogProductSortSchema.options) {
      expect(catalogProductQuerySchema.safeParse({ sort }).success).toBe(true);
    }
  });

  it("rejects an unknown sort", () => {
    expect(catalogProductQuerySchema.safeParse({ sort: "relevance" }).success).toBe(
      false,
    );
  });

  it("accepts tags, discounted, price range and pagination", () => {
    const result = catalogProductQuerySchema.safeParse({
      tags: ["linen", "summer"],
      discounted: true,
      minPrice: 10,
      maxPrice: 100,
      limit: 24,
      cursor: "2026-01-01T00:00:00.000Z|00000000-0000-4000-8000-000000000001",
      categoryId: "00000000-0000-4000-8000-000000000001",
      brandId: "00000000-0000-4000-8000-000000000002",
    });
    expect(result.success).toBe(true);
  });

  it("rejects malformed tags, limits and ids", () => {
    expect(
      catalogProductQuerySchema.safeParse({ tags: Array.from({ length: 11 }, () => "x") })
        .success,
    ).toBe(false);
    expect(catalogProductQuerySchema.safeParse({ tags: [""] }).success).toBe(false);
    expect(catalogProductQuerySchema.safeParse({ tags: ["a".repeat(51)] }).success).toBe(
      false,
    );
    expect(catalogProductQuerySchema.safeParse({ limit: 0 }).success).toBe(false);
    expect(catalogProductQuerySchema.safeParse({ limit: 101 }).success).toBe(false);
    expect(
      catalogProductQuerySchema.safeParse({ categoryId: "not-a-uuid" }).success,
    ).toBe(false);
  });
});

describe("Navigation schemas", () => {
  it("parses navigation with category and custom links", () => {
    const nav = {
      shared: {
        bar: { height: 64, sticky: "always" },
        links: {
          items: [
            {
              kind: "category",
              label: "Shoes",
              href: "/products?category=shoes",
              categoryId: "cat_shoes",
            },
            {
              kind: "custom",
              label: "About Us",
              href: "/about",
            },
          ],
        },
      },
    };
    const res = navSettingsSchema.safeParse(nav);
    expect(res.success).toBe(true);
  });

  it("wraps navigation in navResponseSchema", () => {
    const res = navResponseSchema.safeParse({
      navbar: { shared: { regions: { announcement: true } } },
      version: 2,
    });
    expect(res.success).toBe(true);
  });
});

describe("Page Settings (Auth) schemas", () => {
  it("parses valid auth settings and response wrapper", () => {
    const auth = {
      shared: {
        layout: { mode: "split", panelSide: "left" },
        form: { surface: "white", width: 400 },
      },
      pages: {
        signin: { mode: "split", panelSide: "left" },
      },
    };
    const res = authSettingsSchema.safeParse(auth);
    expect(res.success).toBe(true);

    const wrapped = pageSettingsResponseSchema.safeParse({
      settings: auth,
      version: 1,
    });
    expect(wrapped.success).toBe(true);
  });
});

describe("Pages schemas", () => {
  it("parses a page with valid block types (rich_text, image, cta, faq)", () => {
    const page = {
      id: "page_01",
      slug: "about",
      title: "About Our Store",
      blocks: [
        {
          type: "rich_text",
          id: "block_1",
          body: "We build durable, sustainable goods.",
        },
        {
          type: "image",
          id: "block_2",
          url: "media/2026/10/banner.webp",
          alt: "Workshop image",
        },
        {
          type: "cta",
          id: "block_3",
          title: "Join Us",
          ctas: [{ id: "c1", text: "Contact", link: "/contact" }],
        },
        {
          type: "faq",
          id: "block_4",
          items: [{ question: "Where are you based?", answer: "New York" }],
        },
      ],
      isActive: true,
    };
    const res = pageSchema.safeParse(page);
    expect(res.success).toBe(true);

    const listRes = pageListResponseSchema.safeParse({
      data: [page],
    });
    expect(listRes.success).toBe(true);
  });

  it("rejects pages with unsupported block types", () => {
    const page = {
      slug: "terms",
      title: "Terms",
      blocks: [
        {
          type: "raw_html",
          id: "b1",
          content: "<script>alert(1)</script>",
        },
      ],
    };
    const res = createPageSchema.safeParse(page);
    expect(res.success).toBe(false);
  });
});

describe("Blogs schemas", () => {
  it("parses a blog post with heading, paragraph, image, quote blocks", () => {
    const blog = {
      id: "blog_01",
      slug: "autumn-lookbook",
      title: "Autumn Lookbook 2026",
      coverUrl: "media/2026/10/cover.webp",
      content: [
        { type: "heading", id: "h1", text: "New Seasonal Textures", level: 2 },
        { type: "paragraph", id: "p1", text: "Rich wools and soft linens." },
        { type: "image", id: "i1", url: "media/2026/10/look1.webp" },
        { type: "quote", id: "q1", quote: "Design is simplicity." },
      ],
      categoryId: "cat_editorial",
      status: "published",
      publishedAt: "2026-10-28T09:00:00.000Z",
    };
    const res = blogSchema.safeParse(blog);
    expect(res.success).toBe(true);

    const listRes = blogListResponseSchema.safeParse({
      data: [blog],
      nextCursor: "MjAyNi0xMC0yOHwxMjM=",
    });
    expect(listRes.success).toBe(true);
  });

  it("validates blog categories", () => {
    const cat = {
      id: "cat_1",
      name: "Style Guide",
      slug: "style-guide",
      description: "Fashion tips and seasonal curation.",
    };
    expect(blogCategorySchema.safeParse(cat).success).toBe(true);
  });
});

describe("Media schemas", () => {
  it("validates a compliant media record", () => {
    const media = {
      id: "med_01",
      key: "media/2026/10/0190a1b2-c3d4-7e8f-9012-3456789abcde.webp",
      url: "/uploads/media/2026/10/0190a1b2-c3d4-7e8f-9012-3456789abcde.webp",
      width: 1920,
      height: 1080,
      mimeType: "image/webp",
      sizeBytes: 245000,
      usage: "section",
    };
    const res = mediaSchema.safeParse(media);
    expect(res.success).toBe(true);
  });

  it("rejects unsupported MIME types such as SVG or EXE", () => {
    const media = {
      id: "med_02",
      key: "media/2026/10/0190a1b2-c3d4-7e8f-9012-3456789abcde.svg",
      url: "https://example.com/vector.svg",
      mimeType: "image/svg+xml",
      sizeBytes: 4000,
      usage: "brand",
    };
    expect(mediaSchema.safeParse(media).success).toBe(false);
  });

  it("rejects files larger than 10MB", () => {
    const media = {
      id: "med_03",
      key: "media/2026/10/0190a1b2-c3d4-7e8f-9012-3456789abcde.png",
      url: "https://example.com/large.png",
      mimeType: "image/png",
      sizeBytes: 11 * 1024 * 1024,
      usage: "page",
    };
    expect(mediaSchema.safeParse(media).success).toBe(false);
  });

  it("accepts a media record whose visibility is public or private", () => {
    const base = {
      id: "med_04",
      key: "media/2026/10/0190a1b2-c3d4-7e8f-9012-3456789abcde.webp",
      url: "https://example.com/private.webp",
      mimeType: "image/webp",
      sizeBytes: 1200,
      usage: "page",
    };

    expect(mediaSchema.safeParse({ ...base, visibility: "public" }).success).toBe(
      true,
    );
    expect(
      mediaSchema.safeParse({ ...base, visibility: "private" }).success,
    ).toBe(true);
    // Absent stays valid: 1.4.0 payloads must keep parsing in 1.5.0.
    expect(mediaSchema.safeParse(base).success).toBe(true);
  });

  it("rejects an unknown media visibility", () => {
    const media = {
      id: "med_05",
      key: "media/2026/10/0190a1b2-c3d4-7e8f-9012-3456789abcde.webp",
      url: "https://example.com/secret.webp",
      mimeType: "image/webp",
      sizeBytes: 1200,
      usage: "page",
      visibility: "secret",
    };
    expect(mediaSchema.safeParse(media).success).toBe(false);
  });
});

describe("Events & Jobs schemas", () => {
  it("validates cms.updated and blog.updated event payloads", () => {
    const cmsPayload = {
      scope: "global",
      version: 5,
    };
    expect(cmsUpdatedPayloadSchema.safeParse(cmsPayload).success).toBe(true);

    const blogPayload = {
      blogId: "blog_01",
      slug: "autumn-lookbook",
      status: "published",
    };
    expect(blogUpdatedPayloadSchema.safeParse(blogPayload).success).toBe(true);

    const envelope = {
      id: "0190a1b2-c3d4-7e8f-9012-3456789abcde",
      type: "cms.updated",
      version: 1,
      idempotencyKey: "cms-updated-1",
      producer: "cms-svc",
      timestamp: "2026-10-28T09:30:00.000Z",
      payload: cmsPayload,
    };
    expect(eventEnvelopeSchema.safeParse(envelope).success).toBe(true);
  });

  it("validates media.resize-image job payload", () => {
    const job = {
      mediaId: "med_01",
      sourceKey: "media/2026/10/0190a1b2-c3d4-7e8f-9012-3456789abcde.webp",
      formats: ["webp", "avif"],
      widths: [320, 640, 1280],
    };
    expect(resizeImageJobSchema.safeParse(job).success).toBe(true);
  });
});

describe("Event envelope 2.0.0", () => {
  const base = {
    id: "0190a1b2-c3d4-7e8f-9012-3456789abcde",
    producer: "order-svc",
    timestamp: "2026-10-29T10:00:00.000Z",
    payload: { orderId: "0190a1b2-c3d4-7e8f-9012-3456789abcdf" },
  };

  it("accepts a canonical envelope and returns it unchanged", () => {
    const envelope = {
      ...base,
      type: "order.created",
      version: 1,
      idempotencyKey: "order-created-1",
    };
    expect(canonicalEventEnvelopeSchema.safeParse(envelope).success).toBe(true);
    expect(readEventEnvelope(envelope)).toEqual(envelope);
  });

  it("rejects legacy topic/eventType aliases", () => {
    const legacy = { ...base, topic: "cms.events", eventType: "cms.updated" };
    expect(() => readEventEnvelope(legacy)).toThrow();
    expect(eventEnvelopeSchema.safeParse(legacy).success).toBe(false);
  });

  it("rejects an envelope with no canonical type", () => {
    expect(eventEnvelopeSchema.safeParse(base).success).toBe(false);
  });

  it("rejects version and idempotencyKey only supplied by fallback", () => {
    const missing = { ...base, type: "order.created" };
    expect(() => readEventEnvelope(missing)).toThrow();
  });

  it("requires version and idempotencyKey in the canonical schema", () => {
    const envelope = { ...base, type: "order.created" };
    expect(canonicalEventEnvelopeSchema.safeParse(envelope).success).toBe(false);
  });

  it("rejects unknown fields", () => {
    const envelope = { ...base, type: "order.created", extra: true };
    expect(eventEnvelopeSchema.safeParse(envelope).success).toBe(false);
  });

  it("accepts navCartSchema with drawerActions", () => {
    const valid = {
      enabled: true,
      destination: "drawer",
      drawerActions: {
        showViewCart: true,
        showCheckout: false,
      },
    };
    const parsed = navCartSchema.safeParse(valid);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.drawerActions?.showCheckout).toBe(false);
    }
  });

  it("rejects unknown fields in navCartSchema.drawerActions", () => {
    const invalid = {
      enabled: true,
      drawerActions: {
        showViewCart: true,
        unknownField: true,
      },
    };
    expect(navCartSchema.safeParse(invalid).success).toBe(false);
  });

  it("accepts reindexSearchDocumentsSchema with valid documents", () => {
    const payload = {
      documents: [
        {
          id: "prod-1",
          documentType: "product",
          title: "Chunky Wool Throw",
          slug: "chunky-wool-throw",
          content: "Warm chunky knit throw blanket.",
          status: "active",
          sourceUpdatedAt: "2026-11-03T00:00:00.000Z",
        },
      ],
    };
    expect(reindexSearchDocumentsSchema.safeParse(payload).success).toBe(true);
  });
});
