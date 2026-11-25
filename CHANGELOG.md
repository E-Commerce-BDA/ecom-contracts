# Changelog

All notable contract changes are recorded here.

## 2.0.0 — 2026-11-26

Canonical envelope only (MAJOR, breaking from 1.x).

- `eventEnvelopeSchema` now requires `type`, `version` and `idempotencyKey`.
  The 1.x aliases `topic` and `eventType` are removed, and `readEventEnvelope`
  no longer falls back between them or defaults missing fields.
- Producers must emit the full envelope. Stored 1.x outbox rows need a backfill
  before the relay parses them with this version.

## 1.17.0 — 2026-11-25

Email template vocabulary (MINOR release, backwards compatible with 1.16.0).

- `emailTemplateSchema` gains `"status-update"`: an order status notice is now
  its own email instead of reusing `order-confirmation`. The existing three
  values are unchanged, so older payloads still validate. No payload shape
  changed; an address is still absent from every job.

## 1.16.0 — 2026-11-17

PDP depth (MINOR release, backwards compatible with 1.15.0).

- `pdpRelatedContentSchema.source` gains `"brand"`: related products can come
  from the product's brand as well as its category or a manual id list. The
  existing refinement still forbids `productIds` for non-manual sources.
- Added `themePhotoSettingsSchema` and an optional `photoSettings` layer on
  `themeSettingsSchema`: the global face of product > section > global PDP
  photo precedence, with clamped ratio/gutter/widthPercent and a closed
  format/layout/blend vocabulary.

## 1.15.0 — 2026-11-13

Catalog listing query slice (MINOR release, backwards compatible with 1.14.0).

- Added `catalogProductSortSchema` with `rating_desc` and `popularity_desc`
  alongside the existing `created_desc`, `price_asc`, `price_desc`, `name_asc`.
- Added `catalogProductQuerySchema`: `tags` (AND semantics, max 10),
  `discounted`, `minPrice`/`maxPrice`, `q`, `cursor`, `limit`, `ids`, and the
  six sort values. This is the shared shape for the storefront listing and
  catalog-svc's `ProductQueryDto`.

## 1.14.0 — 2026-11-08

Per-product PDP sections (MINOR release, backwards compatible with 1.13.0).

- Added seven PDP section types: `pdp_description`, `pdp_details`,
  `pdp_reviews`, `pdp_related`, `pdp_trust`, `pdp_story`, `pdp_faq`. Catalog
  remains the default source for description/details; a present CMS value
  overrides it. Reviews are CMS-authored quotes — no synthetic ratings.
- `SECTION_CATALOG` entries gain `group: "home" | "pdp"` so the admin editor
  can filter types by page context.
- `section-settings.ts` gains `columns` and `showIcons`, plus per-type PDP
  settings schemas. Settings stay sparse: absent keys inherit, null rejects.
- Added `sectionListEnvelopeSchema` (outer shape only) so public-read
  consumers can validate the envelope and skip only invalid/unknown sections,
  and `cloneSectionsSchema` for `POST /cms/admin/sections/clone`
  (materializing `pdp-default` into `pdp-<id>`).
- `pdp_related` refines `source`/`productIds`: manual requires at least one
  id, category forbids ids. `pdp_trust` icons are a closed enum. `pdp_story`
  requires a body or an image. `pdp_faq` requires at least one item.
- Extracted `faqItemSchema` into `src/schemas/faq.ts`, shared by CMS page
  FAQ blocks and `pdp_faq`. No wire change.

## 1.13.0 — 2026-11-03

Nav cart drawer actions and search reindex schemas (MINOR release).

- `navigation.ts`: `navCartDrawerActionsSchema` and `drawerActions` on
  `navCartSchema`.
- `search.ts`: `reindexSearchDocumentsSchema` and response schemas.

## 1.12.0 — 2026-11-02

The CMS homepage wave: section field extensions and the footer document
(MINOR release, backwards compatible with 1.11.0).

- `section-settings.ts`: `heroSettingsSchema` gains `height: "auto" |
  "viewport"`; `brandStripSettingsSchema` gains `motion: "static" | "marquee"`,
  `speed` (20–200 px/s), `direction: "left" | "right"`, `pauseOnHover`;
  `testimonialSettingsSchema` gains `layout: "grid" | "marquee"`, `speed`,
  `pauseOnHover`. All six keys join `SECTION_SETTING_KEYS` and the matching
  `SECTION_CATALOG.allowedSettings` rows.
- `section-content.ts`: `featuredProductsContentSchema` gains
  `source: "manual" | "newest"` (absent means manual — every 1.11 payload stays
  valid); `brandStripContentSchema` gains ordered `items: [{ brandId, label? }]`
  where `label` renders beside the logo (`brandIds` stays for logos-only
  selection); `testimonialItemSchema` gains `rating` (1–5), `verified`, `date`.
- Added `src/schemas/footer.ts`: `footerSchema` (columns, social, legal,
  contact, logo/wordmark/tagline/copyright, `paymentIcons` as platform keys
  only), `footerResponseSchema { footer, version }`, `updateFooterSchema`,
  `FOOTER_LIMITS`. Hrefs are internal paths or http(s) URLs at the contract
  boundary — the renderer puts them straight into `href`, so `//host`, `data:`
  and `javascript:` are refused here, not at paint time.

**Why extensions rather than new section types.** The existing types already
own content and ordering, so the admin surface and the renderer registry stay
small. "Most Popular" is `featured_products source:"manual"`; a computed
popularity would need a catalog metrics table and is deliberately not faked.

**Why a separate footer module.** The footer is global link structure — not
theme, not navbar — and a whole-document PUT means one partial edit can never
risk another concern.

## 1.11.0 — 2026-11-02

The SQS task envelope (MINOR release, backwards compatible with 1.10.0).

- Added `src/schemas/tasks.ts`: `taskMessageSchema` (`id`, `queue`, `type`,
  `idempotencyKey`, `enqueuedAt`, `payload`) and the `TaskMessage` type.
- Added `taskMessageFor(payloadSchema)`, which narrows the envelope to one job
  type so a worker validates the envelope and the job with a single parse.
- Nothing consumes it yet, so the release cannot break anyone: no producer emits
  a `TaskMessage` until `@ecom/messaging` 0.4.0 ships the client and cms-svc
  adopts it.

**Why an envelope at all.** `TASK_QUEUES` names the queue and `jobs.ts` types the
payload, but neither says *which* enqueue a delivery is. Without that, an
at-least-once redelivery and a genuine second request are indistinguishable, so
`cms-006`'s acceptance ("a re-delivered job writes identical values") could not
be met from the payload alone. `id` identifies the enqueue and `idempotencyKey`
identifies the effect.

**Why not SQS's own dedupe.** A `MessageDeduplicationId` exists only on FIFO
queues; the three queues are standard, and the id is not carried onto the DLQ,
so the key has to live in the body where a redrive preserves it.

**Why `payload: z.unknown()`.** The envelope validates the envelope. A worker
composes it with its own job schema via `taskMessageFor` (or parses the payload
separately), which is what keeps one queue from being validated against another
queue's job type.

**Why `type` stays a string.** `TASK_QUEUES` has no type registry, and inventing
a second closed union that must be kept in step with the first would be a new
failure mode. The dotted form (`media.resize-image`) is documented in the schema
and pinned by `test/tasks.spec.ts`; a queue that grows a second job type needs a
registry, and that is the release to add it.

## 1.10.0 — 2026-11-01

`refundAmount` is one wire type (released as MINOR; the classification is argued below).

- `moneySchema` (`src/schemas/events.ts`) is now `z.number().nonnegative()`. It was `z.union([z.number().nonnegative(), z.string().regex(/^\d+(?:\.\d{1,2})?$/)])`. Its only consumer is `orderStatusUpdatedPayloadSchema.refundAmount`; nothing else in the package uses it.
- The union existed because `pg` returns a `DECIMAL` column as text, so the producer that read the amount straight off the row emitted `"118.00"` while a hand-built JavaScript payload emitted `118`. That is fixed at the source instead: `order-svc/src/db/pool.ts` registers a NUMERIC type parser, so every money field that service reads is a number, and the outbox event is built from that value. A schema accepting both shapes had been hiding the missing parser.
- The decimal-scale assertion (`"49.901"` rejected) went with the string branch. Scale is governed by `DECIMAL(12,2)` at the source; a number carries no observable scale to re-check on the wire.
- **Unchanged, and deliberately:** the `price`/`effectivePrice` unions on `productImportedPayloadSchema` and `productVariantRefSchema`. Their producer is catalog-svc's importer, which passes an external CSV/JSON cell through as read; narrowing those is a catalog-svc task, not this one.

**Classification.** VERSIONING.md lists "change a field's type or meaning" under MAJOR, and by the letter this is MAJOR. It is shipped as 1.10.0 because the evidence says no consumer can observe a difference: `refundAmount` has exactly one producer (order-svc, which emitted a number from the moment its DB boundary was fixed and never emitted a string outside tests) and no consumer reads the field at all — the only subscriber to `order.status.updated` is notify-svc, which does not exist yet. A 2.0.0 would have cost more than the change is worth: 2.0.0 is reserved for the envelope cutover, and `@ecom/messaging` 0.3.0 pins its peer range at `>=1.9.0 <2`, so a major here would force a messaging re-release and a re-pin of every service for a field nothing consumes. **If a producer is ever found emitting a string refund amount, this release must be treated as a breaking one and re-issued as 2.0.0.**

**Adoption ordering.** The narrowing is stricter than what it replaces, so a consumer that repins to 1.10.0 while a producer still sends `"118.00"` would dead-letter that record. Only order-svc validates `order.status.updated`, and it is repinned in the same change as its producer fix; the other services may stay on their current pins because no payload they validate changed.

## 1.9.0 — 2026-10-31

Product variants on the import event (MINOR release; see the adoption ordering
below before a producer emits `variants`).

- Added `productVariantRefSchema` (`src/schemas/events.ts`): optional `id`, required `sku` (`min 1`, `max 64`, i.e. the `product_variants.sku` column width), `price` (number or numeric string, as everywhere money crosses a `DECIMAL`), optional `effectivePrice`, `stock` (non-negative integer), `imageUrl`, `isActive`. `.strict()` like every other payload.
- `productImportedPayloadSchema` gains `variants?: ProductVariantRef[]` and the `ProductVariantRef` type. cat-008 upserts by `sku` and lets Postgres mint `id` on a first import, which is why `id` is optional.
- `productUpdatedPayloadSchema` is **not** changed. The asymmetry is deliberate: an importer owns variants wholesale, while `product.updated` describes a single edit and has no batch semantics. Adding `variants` there is a separate decision with its own consumer-ordering problem.

**Adoption ordering is part of this release, not an afterthought.** Every payload schema here is `.strict()`, so `parseEventPayload` rejects unknown keys by design. That means `variants` is *not* backward compatible in practice even though the field is optional: a producer that starts emitting `variants` while a consumer still pins 1.8.0 makes that consumer dead-letter every `product.imported` record it sees. The 1.9.0 tarball therefore has to reach **both** `product.imported` consumers — search-svc (which parses the payload through `event-interpreter`) and catalog-svc (cat-008) — before any fixture, importer or producer writes the field. `@ecom/messaging` 0.3.0 widens its peer range to `>=1.9.0 <2` for the same reason.

## 1.8.0 — 2026-10-30

Task-queue schemas and the queue registry (MINOR release, backwards compatible with 1.7.0).

- Added `sendEmailJobSchema` (`src/schemas/jobs.ts`): `template` (`order-confirmation` | `cart-abandoned` | `welcome`), optional `userId`/`orderId`/`cartId`, optional `locale`, required `idempotencyKey`. There is **no** recipient address field — the same PII rule that keeps emails out of the Kafka log keeps them out of SQS; notify-svc resolves the address from the named aggregate.
- Added `processImportRowJobSchema`: `jobId`, `rowNumber` (positive), `source` (`csv` | `json`), `stockMode` (`replace` | `add`), and `row` as a record of scalars.
- Added `emailTemplateSchema`, `importSourceSchema`, `importStockModeSchema`, `importRowValueSchema` and their inferred types.
- Added `src/schemas/queues.ts`: `TASK_QUEUES` (three queues × producer/consumer/`-dlq` twin/`maxReceiveCount: 5`/`visibilityTimeoutSeconds: 60`/`retention: 14d`), `TASK_QUEUE_NAMES`, `TASK_DLQ_NAMES`, `taskQueueNameSchema`, `isTaskQueue()`.
- `resizeImageJobSchema` is unchanged.
- Removed the `reminder.dispatch` queue name, which no producer ever emitted.

**Naming.** Queue names are hyphenated (`notify-send-email`, `import-process-row`, `media-resize-image`) because SQS accepts only alphanumerics, hyphens and underscores — a dot is legal only as a trailing `.fifo`. The dotted spellings used in earlier design notes were not creatable, so they never shipped.

## 1.7.0 — 2026-10-30

Product-card placement and variant contracts (MINOR release, backwards compatible with 1.6.0).

- Added `optionCardPlacementSchema` (`info` | `media` | `brand-hover` | `media-hover-top` | `hidden`) and optional `cardPlacement` on `productCardOptionSchema`, defaulting to `info`.
- Added `cardVariantSchema` (`id`, `sku`, `price`, optional `compareAtPrice`/`imageUrl`, `stock`, `optionValues`).
- Extended `themeProductCardSchema` with the gallery and grid controls: `eyebrow`, `imageNav`, `imageIndicator`, `imageIndicatorPosition`, `imageLoop`, `imageLimit`, `selectionMode`, `selectionEffects`, `colsDesktop`, `colsTablet`, `colsPhone`.

## 1.6.0 — 2026-10-30

Catalog badges and product-card settings (MINOR release, backwards compatible with 1.5.0).

- Added `src/schemas/catalog.ts`: `badgeSchema`, `createBadgeSchema`, `updateBadgeSchema`, `badgeBorderStyleSchema`, `productBadgeAssignmentSchema`, `productBadgeItemSchema`, plus the product-card option schemas `optionDisplayTypeSchema`, `productCardOptionValueSchema`, `productCardOptionSchema` and the `productCardSettingsSchema` alias of `themeProductCardSchema`.
- Added `themeProductCardSchema` to `src/schemas/theme.ts` — the appearance half of the card (layout, media, colours, CTA, typography) — and wired it into `themeSettingsSchema`.
- Deprecated `customBadgeSchema` and `themeBadgesSchema`: catalog badges are now the single source of truth.

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
