import { describe, expect, it } from "vitest";
import {
  navLinkSchema,
  navResponseSchema,
  navSettingsSchema,
} from "../src/index.js";

describe("CMS-backed mega-menu (2.2.0)", () => {
  const group = {
    title: "Women",
    columns: 2,
    items: [
      {
        label: "Dresses",
        href: "/products?category=dresses",
        description: "Everyday and occasion pieces",
        badge: { text: "New" },
      },
      { label: "Knitwear", href: "https://example.com/knitwear" },
    ],
    promo: {
      title: "Autumn edit",
      href: "/collections/autumn",
      description: "Layered textures for cooler days",
      imageUrl: "media/2026/11/autumn.webp",
      badge: { text: "Featured" },
    },
  };

  it("parses mega-menu groups on both existing link kinds", () => {
    const category = navLinkSchema.safeParse({
      kind: "category",
      label: "Women",
      href: "/products?category=women",
      categoryId: "cat_women",
      groups: [group],
    });
    expect(category.success).toBe(true);
    if (category.success && category.data.kind === "category") {
      expect(category.data.groups?.[0]?.items[0]?.badge?.text).toBe("New");
    }

    const custom = navLinkSchema.safeParse({
      kind: "custom",
      label: "Journal",
      href: "/journal",
      groups: [{ title: "Reads", items: [{ label: "Lookbook", href: "/lookbook" }] }],
    });
    expect(custom.success).toBe(true);
  });

  it("keeps every pre-2.2.0 link field valid without groups", () => {
    for (const link of [
      {
        kind: "category",
        label: "Shoes",
        href: "/products?category=shoes",
        categoryId: "cat_shoes",
        icon: "shoe",
        badge: { text: "Sale" },
        highlight: "sale",
        schedule: { startsAt: "2026-11-01T00:00:00.000Z" },
      },
      {
        kind: "custom",
        label: "About",
        href: "https://example.com/about",
        icon: "info",
        badge: { text: "New" },
        highlight: "accent",
        schedule: { endsAt: "2026-12-01T00:00:00.000Z" },
      },
    ]) {
      expect(navLinkSchema.safeParse(link).success).toBe(true);
    }
  });

  it("rejects unsafe hrefs, empty groups and unknown keys", () => {
    expect(
      navLinkSchema.safeParse({
        kind: "custom",
        label: "Bad",
        href: "/x",
        groups: [
          {
            title: "Bad",
            items: [{ label: "Click", href: "javascript:alert(1)" }],
          },
        ],
      }).success,
    ).toBe(false);
    expect(
      navLinkSchema.safeParse({
        kind: "custom",
        label: "Bad",
        href: "/x",
        groups: [{ title: "Empty", items: [] }],
      }).success,
    ).toBe(false);
    expect(
      navLinkSchema.safeParse({
        kind: "custom",
        label: "Bad",
        href: "/x",
        groups: [{ ...group, surprise: true }],
      }).success,
    ).toBe(false);
    expect(
      navLinkSchema.safeParse({
        kind: "custom",
        label: "Bad",
        href: "/x",
        groups: [{ ...group, columns: 5 }],
      }).success,
    ).toBe(false);
  });

  it("carries mega-menu content inside the nav settings and response", () => {
    const settings = {
      shared: {
        links: {
          items: [
            {
              kind: "category",
              label: "Women",
              href: "/products?category=women",
              categoryId: "cat_women",
              groups: [group],
            },
          ],
        },
      },
    };
    expect(navSettingsSchema.safeParse(settings).success).toBe(true);
    expect(
      navResponseSchema.safeParse({ navbar: settings, version: 3, configured: true })
        .success,
    ).toBe(true);
  });
});
