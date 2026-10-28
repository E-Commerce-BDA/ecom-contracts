import { describe, expect, it } from "vitest";
import {
  blogUpdatedPayloadSchema,
  categoryUpdatedPayloadSchema,
  eventEnvelopeSchema,
  ingestSearchDocumentsSchema,
  productImportedPayloadSchema,
  productUpdatedPayloadSchema,
  searchDocumentSchema,
  searchQuerySchema,
  searchResponseSchema,
  searchResultItemSchema,
  searchSuggestResponseSchema,
  suggestQuerySchema,
} from "../src/index.js";

const VALID_UUID = "018f9e01-1234-7000-8000-000000000001";
const VALID_UUID_2 = "018f9e01-1234-7000-8000-000000000002";
const NOW = new Date().toISOString();

describe("search contracts", () => {
  describe("searchDocumentSchema", () => {
    it("accepts a valid product search document", () => {
      const doc = {
        id: VALID_UUID,
        documentType: "product",
        title: "Trail Runner Pro",
        slug: "trail-runner-pro",
        content: "Trail Runner Pro Waterproof outdoor running shoes",
        imageUrl: "https://cdn.example.com/shoes.jpg",
        price: 129.99,
        effectivePrice: 99.99,
        categoryId: VALID_UUID_2,
        popularity: 42,
        status: "active",
        sourceUpdatedAt: NOW,
      };

      const parsed = searchDocumentSchema.parse(doc);
      expect(parsed.title).toBe("Trail Runner Pro");
      expect(parsed.documentType).toBe("product");
    });

    it("accepts valid category and blog documents", () => {
      const catDoc = {
        id: VALID_UUID,
        documentType: "category",
        title: "Shoes",
        slug: "shoes",
        content: "Shoes category with footwear collection",
        status: "active",
        sourceUpdatedAt: NOW,
      };
      expect(searchDocumentSchema.parse(catDoc).documentType).toBe("category");

      const blogDoc = {
        id: "507f1f77bcf86cd799439021",
        documentType: "blog",
        title: "Best Trail Shoes 2026",
        slug: "best-trail-shoes-2026",
        content: "Comprehensive review of trail shoes",
        status: "inactive",
        sourceUpdatedAt: NOW,
      };
      const parsedBlog = searchDocumentSchema.parse(blogDoc);
      expect(parsedBlog.id).toBe("507f1f77bcf86cd799439021");
      expect(parsedBlog.status).toBe("inactive");
    });

    it("accepts MongoDB ObjectId as well as UUID for searchDocumentSchema and searchResultItemSchema", () => {
      const mongoId = "507f1f77bcf86cd799439021";
      const doc = {
        id: mongoId,
        documentType: "blog",
        title: "Mongo Blog",
        slug: "mongo-blog",
        content: "Content with Mongo ObjectId",
        status: "active",
        sourceUpdatedAt: NOW,
      };
      expect(searchDocumentSchema.parse(doc).id).toBe(mongoId);

      const resultItem = searchResultItemSchema.parse({
        id: mongoId,
        type: "blog",
        title: "Mongo Blog",
        slug: "mongo-blog",
        popularity: 10,
        updatedAt: NOW,
      });
      expect(resultItem.id).toBe(mongoId);
    });

    it("rejects invalid document type or negative price", () => {
      expect(() =>
        searchDocumentSchema.parse({
          id: VALID_UUID,
          documentType: "unknown",
          title: "Invalid",
          slug: "invalid",
          content: "Invalid",
          status: "active",
          sourceUpdatedAt: NOW,
        }),
      ).toThrow();

      expect(() =>
        searchDocumentSchema.parse({
          id: VALID_UUID,
          documentType: "product",
          title: "Negative Price",
          slug: "negative-price",
          content: "Negative price",
          price: -10,
          status: "active",
          sourceUpdatedAt: NOW,
        }),
      ).toThrow();
    });
  });

  describe("query schemas", () => {
    it("suggestQuerySchema enforces min 2 chars and trims input", () => {
      expect(() => suggestQuerySchema.parse({ q: "a" })).toThrow();
      expect(() => suggestQuerySchema.parse({ q: "  a  " })).toThrow();

      const parsed = suggestQuerySchema.parse({ q: "  shoes  ", limit: "8" });
      expect(parsed.q).toBe("shoes");
      expect(parsed.limit).toBe(8);
    });

    it("searchQuerySchema validates sorting and cursor bounds", () => {
      const parsed = searchQuerySchema.parse({
        q: "trail runners",
        sort: "price.asc",
        minPrice: "50",
        maxPrice: "150",
      });
      expect(parsed.q).toBe("trail runners");
      expect(parsed.sort).toBe("price.asc");
      expect(parsed.minPrice).toBe(50);
      expect(parsed.maxPrice).toBe(150);
      expect(parsed.limit).toBe(24);

      expect(() =>
        searchQuerySchema.parse({
          q: "trail",
          sort: "invalid-sort",
        }),
      ).toThrow();
    });
  });

  describe("response schemas", () => {
    it("validates searchSuggestResponseSchema shape", () => {
      const suggestRes = {
        query: "sho",
        categories: [
          {
            id: VALID_UUID,
            name: "Shoes",
            slug: "shoes",
            image: "https://cdn.example.com/shoes.jpg",
          },
        ],
        products: [
          {
            id: VALID_UUID,
            slug: "trail-runner",
            name: "Trail Runner",
            image: "https://cdn.example.com/trail.jpg",
            price: 99.99,
            effectivePrice: 89.99,
          },
        ],
        blogs: [
          {
            id: VALID_UUID,
            slug: "best-shoes",
            title: "Best Shoes",
            cover: null,
          },
        ],
      };
      const parsed = searchSuggestResponseSchema.parse(suggestRes);
      expect(parsed.categories).toHaveLength(1);
      expect(parsed.products).toHaveLength(1);
      expect(parsed.blogs).toHaveLength(1);
    });

    it("validates searchResponseSchema with cursor and totalHits", () => {
      const searchRes = {
        query: "shoes",
        data: [
          {
            id: VALID_UUID,
            type: "product",
            title: "Trail Runner",
            slug: "trail-runner",
            image: null,
            price: 99.99,
            effectivePrice: null,
            popularity: 15,
            updatedAt: NOW,
          },
        ],
        nextCursor: "eyJ2IjoxLCJxIjoic2hvZXMiLCJzb3J0IjoicmVsZXZhbmNlIn0",
        totalHits: 1,
      };
      const parsed = searchResponseSchema.parse(searchRes);
      expect(parsed.totalHits).toBe(1);
      expect(parsed.data[0]?.type).toBe("product");
    });
  });

  describe("batch ingestion schema", () => {
    it("accepts valid batch and rejects empty batch or batch > 500", () => {
      expect(() => ingestSearchDocumentsSchema.parse({ documents: [] })).toThrow();

      const singleDoc = {
        id: VALID_UUID,
        documentType: "product",
        title: "Doc",
        slug: "doc",
        content: "Doc content",
        status: "active",
        sourceUpdatedAt: NOW,
      };

      const parsed = ingestSearchDocumentsSchema.parse({
        documents: [singleDoc],
      });
      expect(parsed.documents).toHaveLength(1);

      const oversized = Array.from({ length: 501 }, () => singleDoc);
      expect(() =>
        ingestSearchDocumentsSchema.parse({ documents: oversized }),
      ).toThrow();
    });
  });

  describe("event schemas", () => {
    it("eventEnvelopeSchema accepts optional idempotencyKey and version", () => {
      const envelope = {
        id: VALID_UUID,
        topic: "product.updated",
        eventType: "product.updated",
        producer: "catalog-svc",
        timestamp: NOW,
        idempotencyKey: "evt-prod-101",
        version: 1,
        payload: { productId: VALID_UUID, name: "Shoe" },
      };
      const parsed = eventEnvelopeSchema.parse(envelope);
      expect(parsed.idempotencyKey).toBe("evt-prod-101");
      expect(parsed.version).toBe(1);
    });

    it("validates productUpdatedPayloadSchema and productImportedPayloadSchema", () => {
      const productPayload = {
        productId: VALID_UUID,
        sku: "PROD-101",
        name: "Trail Runner",
        slug: "trail-runner",
        price: 99.99,
        effectivePrice: 89.99,
        status: "active",
        updatedAt: NOW,
      };

      expect(productUpdatedPayloadSchema.parse(productPayload).name).toBe(
        "Trail Runner",
      );
      expect(productImportedPayloadSchema.parse(productPayload).sku).toBe(
        "PROD-101",
      );
    });

    it("validates categoryUpdatedPayloadSchema", () => {
      const catPayload = {
        categoryId: VALID_UUID,
        name: "Footwear",
        slug: "footwear",
        isActive: true,
        updatedAt: NOW,
      };
      expect(categoryUpdatedPayloadSchema.parse(catPayload).slug).toBe(
        "footwear",
      );
    });

    it("blogUpdatedPayloadSchema preserves backwards compatibility while supporting enriched fields", () => {
      // 1.0.0 minimal payload
      const v100Payload = {
        blogId: VALID_UUID,
        slug: "intro-post",
        status: "published",
      };
      expect(blogUpdatedPayloadSchema.parse(v100Payload).slug).toBe(
        "intro-post",
      );

      // 1.1.0 enriched payload
      const v110Payload = {
        blogId: VALID_UUID,
        slug: "intro-post",
        status: "published",
        title: "Intro Post",
        excerpt: "Welcome to our store blog",
        coverUrl: "https://cdn.example.com/cover.jpg",
        publishedAt: NOW,
        updatedAt: NOW,
        categoryId: VALID_UUID_2,
      };
      const parsedEnriched = blogUpdatedPayloadSchema.parse(v110Payload);
      expect(parsedEnriched.title).toBe("Intro Post");
      expect(parsedEnriched.coverUrl).toBe("https://cdn.example.com/cover.jpg");
    });
  });
});
