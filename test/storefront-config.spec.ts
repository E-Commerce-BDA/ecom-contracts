import { describe, expect, it } from "vitest";
import { storefrontConfigResponseSchema } from "../src/index.js";

describe("Versioned storefront config (2.2.0)", () => {
  const config = {
    configVersion: "2.2.0",
    revision: 7,
    theme: {
      "--color-brand": "#0077b6",
      "--radius-card": 12,
      "--scrim-soft": "rgba(10, 37, 64, 0.25)",
    },
    palette: {
      brand: { brand: "#0077b6", brandHover: "" },
      scrim: { soft: "rgba(10, 37, 64, 0.25)" },
      radii: { radiusCard: 12 },
    },
    navigation: {
      shared: {
        links: {
          items: [
            {
              kind: "custom",
              label: "Journal",
              href: "/journal",
              groups: [
                {
                  title: "Reads",
                  items: [{ label: "Lookbook", href: "/lookbook" }],
                },
              ],
            },
          ],
        },
      },
    },
    footer: { wordmark: "STORE", copyright: "2026 Store" },
    badges: [
      {
        id: "a0000000-0000-0000-0000-000000000001",
        key: "sale",
        label: "Sale",
        bg: "#ef4444",
        textColor: "#ffffff",
      },
    ],
    preview: {
      tokenUrl: "/api/preview/token",
      queryParam: "token",
      headerName: "x-preview-token",
    },
  };

  it("accepts a string configVersion, numeric revision and preview metadata", () => {
    const parsed = storefrontConfigResponseSchema.safeParse(config);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.configVersion).toBe("2.2.0");
      expect(parsed.data.revision).toBe(7);
      expect(parsed.data.preview?.headerName).toBe("x-preview-token");
    }
  });

  it("accepts a prerelease version and the deprecated numeric alias", () => {
    expect(
      storefrontConfigResponseSchema.safeParse({
        ...config,
        configVersion: "2.2.0-rc.1+build.4",
        version: 4,
      }).success,
    ).toBe(true);
  });

  it("does not require the sparse palette", () => {
    const { palette: _palette, ...withoutPalette } = config;
    expect(storefrontConfigResponseSchema.safeParse(withoutPalette).success).toBe(
      true,
    );
  });

  it("rejects swapped version types, bad versions and unknown fields", () => {
    expect(
      storefrontConfigResponseSchema.safeParse({ ...config, configVersion: 2 })
        .success,
    ).toBe(false);
    expect(
      storefrontConfigResponseSchema.safeParse({ ...config, revision: "7" })
        .success,
    ).toBe(false);
    expect(
      storefrontConfigResponseSchema.safeParse({ ...config, version: "4" })
        .success,
    ).toBe(false);
    expect(
      storefrontConfigResponseSchema.safeParse({ ...config, configVersion: "2.2" })
        .success,
    ).toBe(false);
    expect(
      storefrontConfigResponseSchema.safeParse({ ...config, surprise: true })
        .success,
    ).toBe(false);
  });

  it("rejects unsafe preview metadata and unknown var shapes", () => {
    expect(
      storefrontConfigResponseSchema.safeParse({
        ...config,
        preview: { ...config.preview, tokenUrl: "javascript:alert(1)" },
      }).success,
    ).toBe(false);
    expect(
      storefrontConfigResponseSchema.safeParse({
        ...config,
        preview: { ...config.preview, headerName: "bad header" },
      }).success,
    ).toBe(false);
    expect(
      storefrontConfigResponseSchema.safeParse({
        ...config,
        theme: { "color-brand": "#0077b6" },
      }).success,
    ).toBe(false);
  });
});
