# Changelog

All notable contract changes are recorded here.

## 1.1.0 — 2026-10-28

Search domain contracts and event payloads (MINOR release, backwards compatible with 1.0.0).

- Added search DTO schemas: `searchDocumentSchema`, `searchResultItemSchema`, `searchSuggestResponseSchema`, `searchResponseSchema`.
- Added query schemas: `suggestQuerySchema`, `searchQuerySchema`.
- Added ingestion & stats schemas: `ingestSearchDocumentsSchema`, `ingestSearchDocumentsResponseSchema`, `searchStatsSchema`.
- Added Kafka event payload schemas in `src/schemas/events.ts`:
  - `productImportedPayloadSchema`
  - `productUpdatedPayloadSchema`
  - `categoryUpdatedPayloadSchema`
  - enriched `blogUpdatedPayloadSchema` with optional `title`, `excerpt`, `coverUrl`, `publishedAt`, `updatedAt`, `categoryId`.
- Added optional `idempotencyKey` and `version` to `eventEnvelopeSchema`.

## 1.0.0 — 2026-10-28

Initial Phase 2 contract package.

- Added shared primitive schemas: keys, UUIDs, hex colors, internal paths,
  image refs, ISO dates, CMS revision.
- Added CTA schema with max 3 CTAs.
- Added CMS section types: `hero`, `banner`, `featured_products`,
  `category_showcase`, `brand_strip`, `blog_teaser`, `testimonial`.
- Added per-type section content schemas and settings allowlists.
- Added `SECTION_CATALOG` admin governance rules.
- Added section list response and reorder schemas.
