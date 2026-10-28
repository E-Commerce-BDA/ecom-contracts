# @ecom/contracts

Versioned shared contracts for the e-commerce platform.

Status: Phase 2 bootstrap | Version 1.0.0 | Date 2026-10-28

This package owns transport/storage shapes only. It never imports NestJS,
React, storefront components, or service code. Consumers pin an exact release
tarball; there is no floating `^` range.

---

## 1. Install

Published releases are GitHub Release tarballs:

```json
{
  "dependencies": {
    "@ecom/contracts": "https://github.com/E-Commerce-BDA/ecom-contracts/releases/download/v1.0.0/ecom-contracts-1.0.0.tgz"
  }
}
```

`pnpm-lock.yaml` pins the integrity hash. CI rejects `file:` and sibling-path
dependencies.

---

## 2. CMS section catalog v1 (locked 2026-10-28)

A **CMS section** is a page-body block stored in `cms_sections`. It is rendered
by the storefront in `sort_order` order. A section is not the page shell, not a
navigation entry, and not a product/category/brand record.

### 2.1 Section types

| Type | Admin-editable content | Allowed `settings` overrides | Notes |
|---|---|---|---|
| `hero` | `slides[]` (0–12), each with `id`, `headline`, `image`, `imageAlt?`, `eyebrow?`, `subcopy?`, `bgColor?`, `textColor?`, `imageBgColor?`, `ctas?`, `split?`, `flip?`, `ratio?` | `bgColor`, `blendMode`, `ratio`, `customRatio` | 0–3 CTAs per slide. Empty slides are skipped. |
| `banner` | `title?`, `subcopy?`, `image`, `imageAlt?`, `bgColor?`, `align?`, `ctas?` | `bgColor`, `blendMode` | Full-width promo strip. Image required. |
| `featured_products` | `title?`, `productIds?` (ordered, max 24), `layout?` (`grid`/`carousel`) | `bgColor`, `blendMode`, `ratio`, `customRatio`, `gutter`, `showPhotos`, `maxItems` | Manual product picker only in v1; category-driven selection is deferred. |
| `category_showcase` | `title?`, `categoryIds?` (ordered, max 12) | `bgColor`, `blendMode`, `ratio`, `customRatio`, `gutter`, `showPhotos`, `maxItems` | Images are controlled by `showPhotos`. |
| `brand_strip` | `title?`, `brandIds?` (ordered, max 24) | `bgColor`, `blendMode`, `gutter`, `maxItems` | Empty `brandIds` = active brands with logos, capped by `maxItems`. |
| `blog_teaser` | `title?`, `postIds?` (ordered, max 12), `count?` (1–12) | `bgColor`, `blendMode`, `gutter`, `maxItems` | Empty `postIds` = latest published posts. |
| `testimonial` | `title?`, `items?` (max 12), each `{id, quote, name, role?, avatar?}` | `bgColor`, `blendMode`, `gutter`, `maxItems` | Optional in v1; hidden when empty. |

Canonical type name is `brand_strip`. The older docs' `brands` value is a
legacy alias and is normalized by `cms-svc` before validation.

### 2.2 What the admin can modify

| Field | Editable? | Rule |
|---|---|---|
| `key` | Create only | Immutable after create. Lowercase kebab-case. |
| `pageKey` | Create only | Immutable after create. A move = create + delete. |
| `type` | Create only | Immutable after create. A type change = create + delete. |
| `title` | Yes | Admin-facing label only. |
| `content` | Yes | Per-type schema above. |
| `settings` | Yes | Only the type's allowlist. Omit a key to inherit; never send `null`. |
| `sortOrder` | No direct edit | Only via `PATCH /sections/reorder`; creates append. |
| `isActive` | Yes | Visibility toggle; inactive sections are hidden from public reads. |
| `createdAt`, `updatedAt` | No | Server-managed. |
| `version` | No | Global CMS revision, server-managed. |

The admin may also create, delete, reorder, and activate/deactivate sections of
the allowed types. Cloning is not a v1 action.

### 2.3 What is explicitly not CMS-managed in a section

- Raw HTML, CSS, JavaScript, iframes, or arbitrary embeds.
- New section types or arbitrary component names.
- Arbitrary settings keys outside the per-type allowlist.
- Product, category, brand, or blog records themselves. Sections store ordered
  references only; catalog-svc/search-svc own the source data.
- Prices, stock, availability, or product copy.
- Page routing, page SEO, or page blocks. Those belong to `pages`.
- Navbar, announcement bar, footer, or other shell chrome. Those belong to
  navigation settings, not sections.
- Auth, checkout, cart, or account behavior. Those are route code.
- Media binary lifecycle. Images are selected from the media library; the
  section stores a media key/URL.

### 2.4 Empty and inactive behavior

- Empty content is valid but skipped by the storefront: hero with no slides,
  featured products with no ids, category showcase with no ids, brand strip with
  no brands, blog teaser with no posts, testimonial with no items.
- Removing all sections is valid; the homepage renders its minimal shell.
- Inactive sections stay in Mongo and remain visible to admin reads, but public
  reads filter `isActive: true` in the Mongo query.
- Unknown section types are skipped by the storefront; cms-svc rejects them on
  write.

### 2.5 Validation rules

- `ctas[]` max 3 per slide/banner; 0 is valid.
- CTA `link` must be an internal path (`/...`), never `//host` or `javascript:`.
- Colors are `#RGB`, `#RRGGBB`, or `#RRGGBBAA`.
- `borderWidth` 0–4; `borderRadius` 0–24; `gutter` 0–48; `maxItems` 1–24.
- `customRatio` 0.5–2.5 and only with `ratio: "custom"`.
- Section keys are lowercase kebab-case, max 80 characters.
- `null` is rejected for every optional override; omit the key to inherit.

---

## 3. Package layout

```text
src/schemas/common.ts          primitive schemas + internal path guard
src/schemas/cta.ts             CTA + max-3 array
src/schemas/section-types.ts   canonical type names
src/schemas/section-content.ts per-type content schemas
src/schemas/section-settings.ts per-type settings allowlists
src/schemas/section-catalog.ts admin governance catalog
src/schemas/section.ts         discriminated union + response/reorder schemas
```

Future slices add theme, navigation, pages, blogs, media, page settings, event
envelopes, and resize-image jobs. The first published version is `1.0.0` only
when those Phase 2 schemas are complete.

---

## 4. Release workflow

1. PR: `pnpm typecheck && pnpm test && pnpm build`.
2. Merge to `main`.
3. Tag `v1.0.0`.
4. GitHub Actions verifies tag/version, builds, runs tests, packs, and creates a
   GitHub Release with `ecom-contracts-1.0.0.tgz`.
5. Consumers bump the exact tarball URL and lockfile.

No GitHub Packages/npm scope is required. See `VERSIONING.md` for semver rules.
