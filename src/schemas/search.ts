import { z } from "zod";
import { imageRefSchema, isoDateSchema, uuidSchema } from "./common.js";

export const searchDocumentTypeSchema = z.enum(["product", "category", "blog"]);
export const searchDocumentStatusSchema = z.enum(["active", "inactive"]);
export const searchSortOptionSchema = z.enum([
  "relevance",
  "price.asc",
  "price.desc",
  "newest",
  "popular",
]);

export const searchDocumentSchema = z
  .object({
    id: z.string().min(1).max(64),
    documentType: searchDocumentTypeSchema,
    title: z.string().min(1).max(255),
    slug: z.string().min(1).max(280),
    content: z.string(),
    imageUrl: imageRefSchema.nullable().optional(),
    price: z.union([z.number().nonnegative(), z.string()]).nullable().optional(),
    effectivePrice: z
      .union([z.number().nonnegative(), z.string()])
      .nullable()
      .optional(),
    categoryId: uuidSchema.nullable().optional(),
    popularity: z.number().int().nonnegative().optional(),
    status: searchDocumentStatusSchema,
    sourceUpdatedAt: isoDateSchema,
  })
  .strict();

export const searchResultItemSchema = z
  .object({
    id: z.string().min(1).max(64),
    type: searchDocumentTypeSchema,
    title: z.string().min(1).max(255),
    slug: z.string().min(1).max(280),
    image: imageRefSchema.nullable().optional(),
    price: z.number().nullable().optional(),
    effectivePrice: z.number().nullable().optional(),
    popularity: z.number().int().nonnegative(),
    updatedAt: isoDateSchema,
  })
  .strict();

export const searchSuggestCategorySchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    slug: z.string().min(1),
    image: imageRefSchema.nullable().optional(),
  })
  .strict();

export const searchSuggestProductSchema = z
  .object({
    id: z.string().min(1),
    slug: z.string().min(1),
    name: z.string().min(1),
    image: imageRefSchema.nullable().optional(),
    price: z.number().nullable().optional(),
    effectivePrice: z.number().nullable().optional(),
  })
  .strict();

export const searchSuggestBlogSchema = z
  .object({
    id: z.string().min(1),
    slug: z.string().min(1),
    title: z.string().min(1),
    cover: imageRefSchema.nullable().optional(),
  })
  .strict();

export const searchSuggestResponseSchema = z
  .object({
    query: z.string(),
    categories: z.array(searchSuggestCategorySchema),
    products: z.array(searchSuggestProductSchema),
    blogs: z.array(searchSuggestBlogSchema),
  })
  .strict();

export const searchResponseSchema = z
  .object({
    query: z.string(),
    data: z.array(searchResultItemSchema),
    nextCursor: z.string().nullable(),
    totalHits: z.number().int().nonnegative(),
  })
  .strict();

export const suggestQuerySchema = z
  .object({
    q: z.string().trim().min(2).max(100),
    limit: z.coerce.number().int().min(1).max(10).default(5),
  })
  .strict();

export const searchQuerySchema = z
  .object({
    q: z.string().trim().min(2).max(100),
    type: searchDocumentTypeSchema.optional(),
    category: z.string().optional(),
    minPrice: z.coerce.number().min(0).optional(),
    maxPrice: z.coerce.number().min(0).optional(),
    sort: searchSortOptionSchema.default("relevance"),
    cursor: z.string().max(512).optional(),
    limit: z.coerce.number().int().min(1).max(50).default(24),
  })
  .strict();

export const ingestSearchDocumentsSchema = z
  .object({
    documents: z.array(searchDocumentSchema).min(1).max(500),
  })
  .strict();

export const ingestSearchDocumentsResponseSchema = z
  .object({
    accepted: z.number().int().nonnegative(),
    skipped: z.number().int().nonnegative(),
    rejected: z.number().int().nonnegative(),
  })
  .strict();

export const searchStatsSchema = z
  .object({
    documents: z.number().int().nonnegative(),
    active: z.number().int().nonnegative(),
    byType: z
      .object({
        product: z.number().int().nonnegative(),
        category: z.number().int().nonnegative(),
        blog: z.number().int().nonnegative(),
      })
      .strict(),
    lastSyncedAt: isoDateSchema.nullable(),
  })
  .strict();

export type SearchDocumentType = z.infer<typeof searchDocumentTypeSchema>;
export type SearchDocumentStatus = z.infer<typeof searchDocumentStatusSchema>;
export type SearchSortOption = z.infer<typeof searchSortOptionSchema>;
export type SearchDocument = z.infer<typeof searchDocumentSchema>;
export type SearchResultItem = z.infer<typeof searchResultItemSchema>;
export type SearchSuggestCategory = z.infer<typeof searchSuggestCategorySchema>;
export type SearchSuggestProduct = z.infer<typeof searchSuggestProductSchema>;
export type SearchSuggestBlog = z.infer<typeof searchSuggestBlogSchema>;
export type SearchSuggestResponse = z.infer<typeof searchSuggestResponseSchema>;
export type SearchResponse = z.infer<typeof searchResponseSchema>;
export type SuggestQuery = z.infer<typeof suggestQuerySchema>;
export type SearchQuery = z.infer<typeof searchQuerySchema>;
export type IngestSearchDocumentsPayload = z.infer<
  typeof ingestSearchDocumentsSchema
>;
export type IngestSearchDocumentsResponse = z.infer<
  typeof ingestSearchDocumentsResponseSchema
>;
export type SearchStats = z.infer<typeof searchStatsSchema>;

