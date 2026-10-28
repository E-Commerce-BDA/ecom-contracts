import { z } from "zod";
import { imageRefSchema, pageKeySchema, stableIdSchema } from "./common.js";
import { pageSeoSchema } from "./pages.js";

export const blogStatusSchema = z.enum(["draft", "published"]);

export const headingBlockSchema = z
  .object({
    type: z.literal("heading"),
    id: stableIdSchema,
    text: z.string().min(1).max(240),
    level: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  })
  .strict();

export const paragraphBlockSchema = z
  .object({
    type: z.literal("paragraph"),
    id: stableIdSchema,
    text: z.string().min(1).max(20000),
  })
  .strict();

export const blogImageBlockSchema = z
  .object({
    type: z.literal("image"),
    id: stableIdSchema,
    url: imageRefSchema,
    alt: z.string().max(160).optional(),
    caption: z.string().max(240).optional(),
  })
  .strict();

export const quoteBlockSchema = z
  .object({
    type: z.literal("quote"),
    id: stableIdSchema,
    quote: z.string().min(1).max(2000),
    cite: z.string().max(120).optional(),
  })
  .strict();

export const blogBlockSchema = z.discriminatedUnion("type", [
  headingBlockSchema,
  paragraphBlockSchema,
  blogImageBlockSchema,
  quoteBlockSchema,
]);

export const blogCategorySchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1).max(64),
    slug: pageKeySchema,
    description: z.string().max(240).optional(),
  })
  .strict();

export const createBlogCategorySchema = z
  .object({
    name: z.string().min(1).max(64),
    slug: pageKeySchema,
    description: z.string().max(240).optional(),
  })
  .strict();

export const blogSchema = z
  .object({
    id: z.string().min(1),
    slug: pageKeySchema,
    title: z.string().min(1).max(160),
    coverUrl: imageRefSchema.optional(),
    excerpt: z.string().max(300).optional(),
    content: z.array(blogBlockSchema),
    categoryId: z.string().min(1),
    author: z.string().max(80).optional(),
    status: blogStatusSchema,
    publishedAt: z.string().nullable().optional(),
    seo: pageSeoSchema.optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
  })
  .strict();

export const createBlogSchema = z
  .object({
    slug: pageKeySchema,
    title: z.string().min(1).max(160),
    coverUrl: imageRefSchema.optional(),
    excerpt: z.string().max(300).optional(),
    content: z.array(blogBlockSchema),
    categoryId: z.string().min(1),
    author: z.string().max(80).optional(),
    status: blogStatusSchema,
    publishedAt: z.string().nullable().optional(),
    seo: pageSeoSchema.optional(),
  })
  .strict();

export const updateBlogSchema = z
  .object({
    title: z.string().min(1).max(160).optional(),
    coverUrl: imageRefSchema.optional(),
    excerpt: z.string().max(300).optional(),
    content: z.array(blogBlockSchema).optional(),
    categoryId: z.string().min(1).optional(),
    author: z.string().max(80).optional(),
    status: blogStatusSchema.optional(),
    publishedAt: z.string().nullable().optional(),
    seo: pageSeoSchema.optional(),
  })
  .strict();

export const blogListResponseSchema = z
  .object({
    data: z.array(blogSchema),
    nextCursor: z.string().nullable(),
  })
  .strict();

export type BlogStatus = z.infer<typeof blogStatusSchema>;
export type HeadingBlock = z.infer<typeof headingBlockSchema>;
export type ParagraphBlock = z.infer<typeof paragraphBlockSchema>;
export type BlogImageBlock = z.infer<typeof blogImageBlockSchema>;
export type QuoteBlock = z.infer<typeof quoteBlockSchema>;
export type BlogBlock = z.infer<typeof blogBlockSchema>;
export type BlogCategory = z.infer<typeof blogCategorySchema>;
export type CreateBlogCategory = z.infer<typeof createBlogCategorySchema>;
export type Blog = z.infer<typeof blogSchema>;
export type CreateBlog = z.infer<typeof createBlogSchema>;
export type UpdateBlog = z.infer<typeof updateBlogSchema>;
export type BlogListResponse = z.infer<typeof blogListResponseSchema>;
