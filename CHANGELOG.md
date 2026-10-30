# Changelog

All notable contract changes are recorded here.

## 1.5.0 — 2026-10-30

Media visibility (MINOR release, backwards compatible with 1.4.0).

- Added `mediaVisibilitySchema` (`public` | `private`) and the `MediaVisibility` type.
- Added **optional** `visibility` to `mediaSchema`. Absent means `public`, so every 1.4.0-era record and payload keeps parsing; `private` assets are served only by the authenticated admin file route. cms-003 is the producing change (`cms_media.visibility`, default `public`).

## 1.4.0 — 2026-10-30

Event payload schemas and the topic registry (MINOR release, backwards compatible with 1.3.0).

- Added payload schemas in `src/schemas/events.ts`:
  - `userRegisteredPayloadSchema` — `userId`, optional `displayName`, `registeredAt`. No email: notify-svc resolves it through `GET /internal/users/:id/email`.
  - `cartUpdatedPayloadSchema` — mirrors `buildCartUpdatedEvent`/`toItemDto`: `id` and `addedAt` per line, nullable `userId`, `sessionId`, `variantId`, `productSlug`, `imageUrl`, `variantLabel`.
  - `cartAbandonedPayloadSchema`, `pageViewedPayloadSchema` — target contracts for analytics-svc.
  - `orderCreatedPayloadSchema` — accepts `reservationId: ''` so a resumed checkout validates.
  - `orderStatusUpdatedPayloadSchema` — 8-value `from`/`to`, optional `note`, `actor`, `refundAmount` (string or number), `refundReference`.
  - `orderStatusSchema` — the order lifecycle enum, exported for DTO reuse.
- Added `src/schemas/topics.ts`: `EVENT_TOPICS` (11 topics with producer, consumers, partitions, retention, key, DLQ), `eventTopicSchema`, `eventPayloadSchemas`, `parseEventPayload()`, `parseEventEnvelope()`, `dlqTopicName()`, `isEventTopic()`.

## 1.3.0 — 2026-10-29

Canonical event envelope with a dual-read/dual-write window (MINOR release, backwards compatible with 1.2.0).

- Added optional `type` to `eventEnvelopeSchema`; `type` is the canonical event name and Kafka topic.
- Made `topic` and `eventType` optional legacy fields; at least one of `type`, `topic`, or `eventType` is required.
- Added `canonicalEventEnvelopeSchema` for 2.0.0-ready producers (`type`, `version`, and `idempotencyKey` required).
- Added `readEventEnvelope()` to normalize legacy envelopes to `{id,type,version,timestamp,producer,idempotencyKey,payload}`; `version` defaults to 1 and `idempotencyKey` defaults to `id`.
- Dual-write envelopes must keep `type`, `topic`, and `eventType` in agreement when `type` is present.

## 1.2.0 — 2026-10-28

- Widened search document and result IDs to `varchar(64)` strings.

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
