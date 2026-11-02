import { describe, expect, it } from "vitest";
import {
  FOOTER_LIMITS,
  footerResponseSchema,
  footerSchema,
} from "../src/index.js";

const VALID_FOOTER = {
  columns: [
    {
      title: "Shop",
      links: [
        { label: "All products", href: "/products" },
        { label: "Journal", href: "/blog" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About us", href: "/about" },
        { label: "Privacy policy", href: "/privacy" },
        { label: "Terms of service", href: "/terms" },
      ],
    },
  ],
  social: [
    { platform: "instagram", label: "Instagram", url: "https://instagram.com/oceanic" },
    { platform: "x", label: "X", url: "https://x.com/oceanic" },
  ],
  legal: [{ label: "Privacy", href: "/privacy" }],
  contact: {
    email: "hello@oceanic.example",
    phone: "+1 555 010 0100",
    address: "1 Harbour Road, Coastal City",
  },
  logo: "/media/seed/brand/logo.svg",
  wordmark: "Oceanic",
  tagline: "Everything for every day.",
  copyright: "© 2026 Oceanic Trading Co.",
  paymentIcons: ["visa", "mastercard", "paypal", "applepay"],
} as const;

describe("footerSchema", () => {
  it("accepts a full footer document", () => {
    const result = footerSchema.safeParse(VALID_FOOTER);
    expect(result.success).toBe(true);
  });

  it("accepts an empty object — every block is optional", () => {
    expect(footerSchema.safeParse({}).success).toBe(true);
  });

  it("rejects unknown top-level keys (no newsletter in v1)", () => {
    const result = footerSchema.safeParse({
      columns: [],
      newsletter: { enabled: true },
    });
    expect(result.success).toBe(false);
  });

  it("rejects unsafe hrefs at the contract boundary", () => {
    for (const href of [
      "javascript:alert(1)",
      "data:text/html,<script>",
      "//evil.example",
      "ftp://example.com",
    ]) {
      const result = footerSchema.safeParse({
        legal: [{ label: "x", href }],
      });
      expect(result.success, href).toBe(false);
    }
  });

  it("rejects unsafe social urls", () => {
    const result = footerSchema.safeParse({
      social: [{ platform: "x", label: "X", url: "javascript:alert(1)" }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects free-form payment icon labels", () => {
    const result = footerSchema.safeParse({
      paymentIcons: ["Visa & Mastercard"],
    });
    expect(result.success).toBe(false);
  });

  it("enforces the documented caps", () => {
    const tooManyColumns = {
      columns: Array.from({ length: FOOTER_LIMITS.columns + 1 }, (_, i) => ({
        title: `Col ${i}`,
        links: [{ label: "l", href: "/x" }],
      })),
    };
    expect(footerSchema.safeParse(tooManyColumns).success).toBe(false);

    const tooManyLinks = {
      columns: [
        {
          title: "Col",
          links: Array.from({ length: FOOTER_LIMITS.linksPerColumn + 1 }, (_, i) => ({
            label: `l${i}`,
            href: "/x",
          })),
        },
      ],
    };
    expect(footerSchema.safeParse(tooManyLinks).success).toBe(false);
  });

  it("rejects an empty column (a heading with no links is a mistake)", () => {
    const result = footerSchema.safeParse({
      columns: [{ title: "Empty", links: [] }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects a malformed contact email", () => {
    const result = footerSchema.safeParse({
      contact: { email: "not-an-email" },
    });
    expect(result.success).toBe(false);
  });
});

describe("footerResponseSchema", () => {
  it("wraps the footer with the CMS revision", () => {
    const result = footerResponseSchema.safeParse({
      footer: VALID_FOOTER,
      version: 3,
    });
    expect(result.success).toBe(true);
  });

  it("refuses a missing or fractional version", () => {
    expect(
      footerResponseSchema.safeParse({ footer: {} }).success,
    ).toBe(false);
    expect(
      footerResponseSchema.safeParse({ footer: {}, version: 1.5 }).success,
    ).toBe(false);
  });
});
