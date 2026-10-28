import { z } from "zod";
import { hexColorSchema, imageRefSchema, versionSchema } from "./common.js";

export const authModeSchema = z.enum(["centered", "split"]);
export const panelSideSchema = z.enum(["left", "right"]);
export const splitRatioSchema = z.enum(["50-50", "60-40", "40-60"]);
export const authMobileSchema = z.enum(["stacked", "hidden-panel"]);
export const panelBgModeSchema = z.enum([
  "solid",
  "gradient",
  "image",
  "pattern",
  "none",
]);
export const imageFitSchema = z.enum(["cover", "contain"]);
export const formSurfaceSchema = z.enum(["white", "tinted", "transparent"]);
export const formElevationSchema = z.enum(["flat", "border", "floating"]);
export const fontFamilySchema = z.enum(["outfit", "fraunces", "system"]);
export const textAlignSchema = z.enum(["left", "center", "right"]);
export const socialProviderSchema = z.enum(["google", "apple", "facebook"]);
export const errorStyleSchema = z.enum(["banner", "inline"]);

export const gradientStopSchema = z
  .object({
    color: hexColorSchema,
    at: z.number().min(0).max(100).optional(),
  })
  .strict();

export const panelGradientSchema = z.discriminatedUnion("type", [
  z
    .object({
      type: z.literal("linear"),
      angle: z.number().min(0).max(360),
      stops: z.array(gradientStopSchema).min(2).max(6),
    })
    .strict(),
  z
    .object({
      type: z.literal("radial"),
      shape: z.enum(["circle", "ellipse"]),
      at: z.string().min(1),
      stops: z.array(gradientStopSchema).min(2).max(6),
    })
    .strict(),
  z
    .object({
      type: z.literal("conic"),
      from: z.number().min(0).max(360),
      at: z.string().min(1),
      stops: z.array(gradientStopSchema).min(2).max(6),
    })
    .strict(),
]);

export const elementStyleSchema = z
  .object({
    size: z.number().int().min(10).max(48),
    weight: z.number().int().min(400).max(700),
    color: hexColorSchema,
    align: textAlignSchema,
  })
  .strict();

export const authLayoutFieldSchema = z
  .object({
    mode: authModeSchema.optional(),
    panelSide: panelSideSchema.optional(),
    ratio: splitRatioSchema.optional(),
    mobile: authMobileSchema.optional(),
  })
  .strict();

export const authFormFieldSchema = z
  .object({
    surface: formSurfaceSchema.optional(),
    radius: z.number().int().min(0).max(24).optional(),
    width: z.number().int().min(360).max(480).optional(),
    elevation: formElevationSchema.optional(),
  })
  .strict();

export const authInputsFieldSchema = z
  .object({
    bg: hexColorSchema.optional(),
    border: hexColorSchema.optional(),
    radius: z.number().int().min(0).max(24).optional(),
    text: hexColorSchema.optional(),
    placeholder: hexColorSchema.optional(),
    focusBorder: hexColorSchema.optional(),
    focusRing: hexColorSchema.optional(),
    focusRingWidth: z.number().int().min(0).max(8).optional(),
    errorBorder: hexColorSchema.optional(),
  })
  .strict();

export const authPanelFieldSchema = z
  .object({
    bgMode: panelBgModeSchema.optional(),
    solid: hexColorSchema.optional(),
    gradient: panelGradientSchema.optional(),
    imageUrl: imageRefSchema.or(z.literal("")).optional(),
    imageFit: imageFitSchema.optional(),
    imagePosition: z.string().max(64).optional(),
    overlay: z.number().int().min(0).max(80).optional(),
    logoUrl: imageRefSchema.or(z.literal("")).optional(),
    logoHeight: z.number().int().min(16).max(64).optional(),
  })
  .strict();

export const authTypographyFieldSchema = z
  .object({
    family: fontFamilySchema.optional(),
    headline: elementStyleSchema.optional(),
    sub: elementStyleSchema.optional(),
    bullets: elementStyleSchema.optional(),
    quote: elementStyleSchema.optional(),
    formTitle: elementStyleSchema.optional(),
    labels: elementStyleSchema.optional(),
  })
  .strict();

export const authContentFieldSchema = z
  .object({
    headline: z.string().max(120).optional(),
    sub: z.string().max(300).optional(),
    bullets: z.string().max(500).optional(),
    quote: z.string().max(300).optional(),
    microcopy: z.string().max(200).optional(),
    formTitle: z.string().max(60).optional(),
    footerLinks: z
      .array(
        z.object({
          label: z.string().min(1).max(50),
          href: z.string().min(1).max(2048),
        }),
      )
      .max(6)
      .optional(),
  })
  .strict();

export const authBehaviorFieldSchema = z
  .object({
    rememberDefault: z.boolean().optional(),
    postLoginRedirect: z.string().max(2048).optional(),
    rememberLabel: z.string().max(60).optional(),
    noticeRateLimit: z.string().max(200).optional(),
    noticeSessionExpired: z.string().max(200).optional(),
  })
  .strict();

export const authErrorsFieldSchema = z
  .object({
    style: errorStyleSchema.optional(),
  })
  .strict();

export const authMotionFieldSchema = z
  .object({
    pageFadeMs: z.number().int().min(150).max(300).optional(),
  })
  .strict();

export const authSeoFieldSchema = z
  .object({
    title: z.string().max(120).optional(),
    description: z.string().max(300).optional(),
  })
  .strict();

export const authPageOverridesSchema = z
  .object({
    layout: authLayoutFieldSchema.optional(),
    form: authFormFieldSchema.optional(),
    inputs: authInputsFieldSchema.optional(),
    panel: authPanelFieldSchema.optional(),
    typography: authTypographyFieldSchema.optional(),
    content: authContentFieldSchema.optional(),
    behavior: authBehaviorFieldSchema.optional(),
    socialProviders: z.array(socialProviderSchema).max(3).optional(),
    errors: authErrorsFieldSchema.optional(),
    motion: authMotionFieldSchema.optional(),
    seo: authSeoFieldSchema.optional(),
  })
  .strict();

export const authPageLayoutSchema = z
  .object({
    mode: authModeSchema.optional(),
    panelSide: panelSideSchema.optional(),
  })
  .strict();

export const authSettingsSchema = z
  .object({
    shared: authPageOverridesSchema.optional(),
    pages: z
      .object({
        signin: authPageLayoutSchema.optional(),
        signup: authPageLayoutSchema.optional(),
        forgot: authPageLayoutSchema
          .extend({
            style: authPageOverridesSchema.optional(),
          })
          .optional(),
      })
      .strict()
      .optional(),
  })
  .strict();

export const pageSettingsResponseSchema = z
  .object({
    settings: authSettingsSchema,
    version: versionSchema,
  })
  .strict();

export type AuthMode = z.infer<typeof authModeSchema>;
export type PanelSide = z.infer<typeof panelSideSchema>;
export type SplitRatio = z.infer<typeof splitRatioSchema>;
export type AuthMobile = z.infer<typeof authMobileSchema>;
export type PanelBgMode = z.infer<typeof panelBgModeSchema>;
export type ImageFit = z.infer<typeof imageFitSchema>;
export type FormSurface = z.infer<typeof formSurfaceSchema>;
export type FormElevation = z.infer<typeof formElevationSchema>;
export type FontFamily = z.infer<typeof fontFamilySchema>;
export type TextAlign = z.infer<typeof textAlignSchema>;
export type SocialProvider = z.infer<typeof socialProviderSchema>;
export type ErrorStyle = z.infer<typeof errorStyleSchema>;
export type GradientStop = z.infer<typeof gradientStopSchema>;
export type PanelGradient = z.infer<typeof panelGradientSchema>;
export type ElementStyle = z.infer<typeof elementStyleSchema>;
export type AuthPageOverrides = z.infer<typeof authPageOverridesSchema>;
export type AuthSettings = z.infer<typeof authSettingsSchema>;
export type PageSettingsResponse = z.infer<typeof pageSettingsResponseSchema>;
