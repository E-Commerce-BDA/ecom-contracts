import { describe, expect, it } from "vitest";
import {
  cssColorSchema,
  resolvedThemeSchema,
  themeGridGroupSchema,
  themeMarqueeGroupSchema,
  themePaletteSchema,
  themeSettingsSchema,
  themeVarsSchema,
} from "../src/index.js";

describe("Layered palette (2.2.0)", () => {
  const palette = {
    brand: {
      brand: "#0077b6",
      brandHover: "#005f8f",
      onBrand: "#ffffff",
      brandWash: "",
    },
    ink: { ink: "#0a2540", muted: "#64748b", border: "#e2e8f0" },
    surfaces: {
      surface: "#ffffff",
      surfaceSunken: "#f8fafc",
      surfaceRaised: "#ffffff",
      imagePlaceholder: "",
    },
    sale: {
      saleFill: "#ef4444",
      saleText: "#ffffff",
      saleWash: "#fef2f2",
      onSale: "",
    },
    success: { fg: "#065f46", fill: "#10b981", bg: "", border: "#a7f3d0" },
    warning: { fg: "#92400e", fill: "#f59e0b", bg: "", border: "#fde68a" },
    error: { fg: "#991b1b", fill: "#ef4444", bg: "", border: "#fecaca" },
    navbar: {
      bg: "#ffffff",
      text: "#0a2540",
      hover: "#0077b6",
      badgeBg: "#0077b6",
      badgeText: "#ffffff",
      announceBg: "#0a2540",
      announceText: "#ffffff",
    },
    footer: { bg: "#0a2540", text: "#ffffff", link: "", hover: "#93c5fd" },
    scrim: {
      soft: "rgba(10, 37, 64, 0.25)",
      panel: "hsla(210, 40%, 18%, 0.8)",
      strong: "#0a2540",
    },
    state: {
      focusOutline: "#0077b6",
      focusHalo: "#bae6fd",
      disabledBg: "#e2e8f0",
      disabledText: "#64748b",
      disabledBorder: "",
    },
    radii: { radiusButton: 8, radiusCard: 12, radiusSm: 4, radiusMd: 8 },
    type: {
      fontSans: "Inter, system-ui, sans-serif",
      fontDisplay: '"Playfair Display", Georgia, serif',
      fsDisplay1: 56,
      fsDisplay2: 40,
      fsDisplay3: 28,
      fsBody: 16,
      fsCaption: 12,
    },
  };

  it("accepts every palette group with the empty-string sentinel", () => {
    const parsed = themePaletteSchema.safeParse(palette);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.brand?.brandWash).toBe("");
      expect(parsed.data.scrim?.soft).toBe("rgba(10, 37, 64, 0.25)");
    }
  });

  it("accepts a fully sparse palette and wires it into themeSettings", () => {
    expect(themePaletteSchema.safeParse({}).success).toBe(true);
    expect(
      themeSettingsSchema.safeParse({
        palette: { brand: { brand: "" }, radii: { radiusCard: 0 } },
      }).success,
    ).toBe(true);
  });

  it("rejects wrong colour types, unknown keys and non-hex named colours", () => {
    expect(themePaletteSchema.safeParse({ brand: { brand: "red" } }).success).toBe(
      false,
    );
    expect(themePaletteSchema.safeParse({ brand: { brand: 123 } }).success).toBe(
      false,
    );
    expect(
      themePaletteSchema.safeParse({ ink: { ink: "#fff", oops: true } }).success,
    ).toBe(false);
    expect(
      themePaletteSchema.safeParse({ radii: { radiusButton: "8" } }).success,
    ).toBe(false);
    expect(
      themePaletteSchema.safeParse({ radii: { radiusCard: 25 } }).success,
    ).toBe(false);
    expect(
      themePaletteSchema.safeParse({ type: { fsBody: 1 } }).success,
    ).toBe(false);
    expect(
      themePaletteSchema.safeParse({
        type: { fontSans: "Inter; background:url(evil)" },
      }).success,
    ).toBe(false);
  });

  it("allows rgba/hsl scrims but refuses CSS injection", () => {
    expect(cssColorSchema.safeParse("rgba(0, 0, 0, 0.4)").success).toBe(true);
    expect(cssColorSchema.safeParse("#0a2540cc").success).toBe(true);
    expect(cssColorSchema.safeParse("transparent").success).toBe(true);
    expect(
      themePaletteSchema.safeParse({
        scrim: { panel: "rgba(0,0,0,0.5); background: url(evil)" },
      }).success,
    ).toBe(false);
    expect(
      themePaletteSchema.safeParse({ scrim: { panel: "url(evil)" } }).success,
    ).toBe(false);
  });

  it("keeps the numeric bounds at the resolver's clamps", () => {
    expect(themePaletteSchema.safeParse({ radii: { radiusSm: 8 } }).success).toBe(
      true,
    );
    expect(themePaletteSchema.safeParse({ radii: { radiusSm: 9 } }).success).toBe(
      false,
    );
    expect(themePaletteSchema.safeParse({ type: { fsDisplay1: 24 } }).success).toBe(
      true,
    );
    expect(themePaletteSchema.safeParse({ type: { fsDisplay1: 97 } }).success).toBe(
      false,
    );
  });
});

describe("Component groups (2.2.0)", () => {
  it("accepts paint/geometry projections and the product-card CTA colours", () => {
    const parsed = themeSettingsSchema.safeParse({
      navbar: {
        height: 64,
        bg: "#ffffff",
        text: "#0a2540",
        hover: "#0077b6",
        badgeBg: "#0077b6",
        badgeText: "#ffffff",
        announceBg: "#0a2540",
        announceText: "#ffffff",
      },
      filterRail: {
        bg: "#ffffff",
        border: "#e2e8f0",
        title: "#0a2540",
        label: "#64748b",
        gap: 20,
        pad: 16,
        radius: 10,
        actionGap: 8,
        maxHeight: 320,
        headGap: 8,
        titleSize: 18,
        innerGap: 8,
        labelSize: 14,
        priceGap: 8,
        tagGap: 6,
        tagMax: 220,
      },
      drawer: {
        bg: "#ffffff",
        text: "#0a2540",
        borderColor: "",
        overlayColor: "rgba(10, 37, 64, 0.4)",
        width: 360,
        durationMs: 240,
        motion: "slide",
      },
      marquee: { speed: 40, direction: "left", pauseOnHover: true },
      grid: { gap: 20 },
      productCard: {
        ctaBg: "#0077b6",
        ctaTextColor: "#ffffff",
        ctaBorderColor: "",
      },
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects out-of-range geometry and unknown motion/direction values", () => {
    expect(
      themeSettingsSchema.safeParse({ navbar: { height: 120 } }).success,
    ).toBe(false);
    expect(
      themeSettingsSchema.safeParse({ navbar: { sticky: "always" } }).success,
    ).toBe(false);
    expect(
      themeSettingsSchema.safeParse({ filterRail: { maxHeight: 100 } }).success,
    ).toBe(false);
    expect(
      themeSettingsSchema.safeParse({ drawer: { motion: "bounce" } }).success,
    ).toBe(false);
    expect(themeMarqueeGroupSchema.safeParse({ speed: 19 }).success).toBe(false);
    expect(themeMarqueeGroupSchema.safeParse({ speed: 201 }).success).toBe(false);
    expect(
      themeMarqueeGroupSchema.safeParse({ direction: "up" }).success,
    ).toBe(false);
    expect(themeGridGroupSchema.safeParse({ gap: 49 }).success).toBe(false);
    expect(
      themeSettingsSchema.safeParse({ productCard: { ctaBg: "blue" } }).success,
    ).toBe(false);
  });
});

describe("Resolved CSS-var maps (2.2.0)", () => {
  it("accepts concrete string and number vars for admin preview", () => {
    const vars = {
      "--color-brand": "#0077b6",
      "--radius-card": 12,
      "--scrim-soft": "rgba(10, 37, 64, 0.25)",
    };
    expect(resolvedThemeSchema.safeParse(vars).success).toBe(true);
    expect(themeVarsSchema.safeParse(vars).success).toBe(true);
  });

  it("rejects non-var keys and non-scalar values", () => {
    expect(resolvedThemeSchema.safeParse({ "color-brand": "#0077b6" }).success).toBe(
      false,
    );
    expect(resolvedThemeSchema.safeParse({ "--color-brand": null }).success).toBe(
      false,
    );
    expect(resolvedThemeSchema.safeParse({ "--Grid_Gap": 20 }).success).toBe(false);
  });
});

describe("2.1.0 theme regression", () => {
  it("parses an unchanged 2.1.0 theme body", () => {
    const body210 = {
      button: {
        defaultVariant: "primary",
        defaultSize: "md",
        bg: "#0077b6",
        textColor: "#ffffff",
        borderColor: "",
        borderRadius: 8,
      },
      input: { bg: "#ffffff", focusBorderColor: "#0077b6", borderRadius: 6 },
      checkbox: { size: 18, boxBg: "#ffffff", tickColor: "#0077b6", borderRadius: 4 },
      toggle: { width: 40, height: 24, onColor: "#0077b6", offColor: "#e2e8f0" },
      badges: {
        custom: [
          { id: "eco", bg: "#10b981", textColor: "#ffffff", borderStyle: "solid" },
        ],
      },
      icon: { size: 20, strokeWidth: 1.5, color: "#0a2540" },
      textarea: { bg: "#ffffff", rows: 4 },
      select: { variant: "native", borderRadius: 6, optionPaddingY: 8 },
      tooltip: { bg: "#0a2540", animation: "fade", durationMs: 200 },
      dialog: { overlayAlpha: 50, maxWidth: 448, borderRadius: 12 },
      productCard: { cardType: "standard", mediaRatio: "4:5", colsDesktop: 4 },
      photoSettings: { format: "horizontal", layout: "grid", gutter: 8 },
    };
    const parsed = themeSettingsSchema.safeParse(body210);
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data).toEqual(body210);
  });
});
