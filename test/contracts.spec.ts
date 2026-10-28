import { describe, expect, it } from "vitest";
import {
  authSettingsSchema,
  blogCategorySchema,
  blogListResponseSchema,
  blogSchema,
  blogUpdatedPayloadSchema,
  cmsUpdatedPayloadSchema,
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
  resizeImageJobSchema,
  themeResponseSchema,
  themeSettingsSchema,
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

  it("rejects unknown fields when strict", () => {
    const res = themeSettingsSchema.safeParse({
      button: { unknownField: true },
    });
    expect(res.success).toBe(false);
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
      topic: "cms.events",
      eventType: "cms.updated",
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
