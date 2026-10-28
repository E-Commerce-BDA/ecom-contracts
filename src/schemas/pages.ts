import { z } from "zod";
import { ctaSchema } from "./cta.js";
import { imageRefSchema, pageKeySchema, stableIdSchema } from "./common.js";

export const richTextBlockSchema = z
  .object({
    type: z.literal("rich_text"),
    id: stableIdSchema,
    body: z.string().min(1).max(50000),
  })
  .strict();

export const imageBlockSchema = z
  .object({
    type: z.literal("image"),
    id: stableIdSchema,
    url: imageRefSchema,
    alt: z.string().max(160).optional(),
    caption: z.string().max(240).optional(),
  })
  .strict();

export const ctaBlockSchema = z
  .object({
    type: z.literal("cta"),
    id: stableIdSchema,
    title: z.string().max(120),
    ctas: z.array(ctaSchema).max(3),
  })
  .strict();

export const faqItemSchema = z
  .object({
    question: z.string().min(1).max(240),
    answer: z.string().min(1).max(5000),
  })
  .strict();

export const faqBlockSchema = z
  .object({
    type: z.literal("faq"),
    id: stableIdSchema,
    items: z.array(faqItemSchema).min(1).max(50),
  })
  .strict();

export const pageBlockSchema = z.discriminatedUnion("type", [
  richTextBlockSchema,
  imageBlockSchema,
  ctaBlockSchema,
  faqBlockSchema,
]);

export const pageSeoSchema = z
  .object({
    title: z.string().max(120).optional(),
    description: z.string().max(300).optional(),
    ogImage: imageRefSchema.optional(),
  })
  .strict();

export const pageSchema = z
  .object({
    id: z.string().min(1),
    slug: pageKeySchema,
    title: z.string().min(1).max(120),
    blocks: z.array(pageBlockSchema),
    seo: pageSeoSchema.optional(),
    isActive: z.boolean().default(true),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
  })
  .strict();

export const createPageSchema = z
  .object({
    slug: pageKeySchema,
    title: z.string().min(1).max(120),
    blocks: z.array(pageBlockSchema),
    seo: pageSeoSchema.optional(),
    isActive: z.boolean().optional(),
  })
  .strict();

export const updatePageSchema = z
  .object({
    title: z.string().min(1).max(120).optional(),
    blocks: z.array(pageBlockSchema).optional(),
    seo: pageSeoSchema.optional(),
    isActive: z.boolean().optional(),
  })
  .strict();

export const pageListResponseSchema = z
  .object({
    data: z.array(pageSchema),
  })
  .strict();

export type RichTextBlock = z.infer<typeof richTextBlockSchema>;
export type ImageBlock = z.infer<typeof imageBlockSchema>;
export type CtaBlock = z.infer<typeof ctaBlockSchema>;
export type FaqBlock = z.infer<typeof faqBlockSchema>;
export type PageBlock = z.infer<typeof pageBlockSchema>;
export type PageSeo = z.infer<typeof pageSeoSchema>;
export type Page = z.infer<typeof pageSchema>;
export type CreatePage = z.infer<typeof createPageSchema>;
export type UpdatePage = z.infer<typeof updatePageSchema>;
export type PageListResponse = z.infer<typeof pageListResponseSchema>;
