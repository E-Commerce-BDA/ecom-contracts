# Versioning

`@ecom/contracts` follows semantic versioning. Consumers pin an exact release
tarball; floating ranges are not allowed.

## MAJOR

- Remove or rename a required field.
- Change a field's type or meaning.
- Remove an enum value or change its semantics.
- Change an endpoint path, response envelope, event name, or job payload shape
  in a way that breaks existing consumers.

## MINOR

- Add an optional field.
- Add a new section type, event type, job type, or schema export.
- Add a new enum value when consumers can safely ignore unknown values.
- Add a new settings key to a type's allowlist.
- Add a queue or topic to a registry (`TASK_QUEUES`, `EVENT_TOPICS`). Renaming or
  removing one is MAJOR: the name is the contract with the broker.

## PATCH

- Documentation, tests, comments, and internal refactors that do not change the
  runtime shape.

## Rules

- The first published version is `1.0.0`.
- Breaking changes bump MAJOR; all consumers must re-pin.
- Additive changes bump MINOR; consumers may adopt at their own pace.
- `null` is never a valid override. Omit the key to inherit.
- A new major may provide `vN` subpath exports for a dual-publish window when a
  second major exists. v1 does not need that yet.

## 2.2.0 — 2026-11-27

Layered palette, component groups, mega-menu and the resolved config envelope
(MINOR, additive to 2.1.0).

- `themeSettingsSchema` gains `palette`, `navbar`, `filterRail`, `drawer`,
  `marquee` and `grid`; `themeProductCardSchema` gains three CTA colours. All
  are optional and every object remains `.strict()`.
- `navLinkSchema` gains optional `groups` on both existing kinds; no existing
  nav field is renamed or narrowed.
- New `storefrontConfigResponseSchema` is a new export, not a change to an
  existing response. Its `configVersion` is a semver-like **string** (the
  contract shape version, so prereleases are expressible) and `revision` is a
  number (the CMS document revision). Those two clocks are deliberately
  different: repinning the package must not be confused with an admin edit.
- `version` in that new response is a deprecated numeric alias, accepted for
  one release and removed in 2.3.0. Do not add it to new producers.
- Resolved CSS-var maps (`themeVarsSchema`, `resolvedThemeSchema`) carry
  concrete `string | number` values; the empty-string "no override" sentinel
  belongs only in the sparse source, never in the resolved output.

**Why additive is enough.** 2.1.0 readers ignore absent keys, and their
strict parsers reject only *unknown* keys — so the adoption ordering below
still governs when producers may start writing the new fields. **Rejected:**
a major with renamed fields or relaxed strictness, which would force every
consumer to re-pin at once for no new capability.

## Strict-schema adoption ordering

Every event payload schema is `.strict()`, so adding an optional field is MINOR
for the *schema* but can still break a *stale consumer*: `parseEventPayload`
rejects the unknown key and the consumer dead-letters a record it used to read.

An additive payload field therefore ships in that order, never in reverse:

1. Publish the MINOR contracts release.
2. Re-pin **every** consumer of that topic to it and deploy.
3. Only then may a producer, fixture or importer start writing the new field.

`product.imported.variants` (1.9.0) is the worked example: search-svc and
catalog-svc both had to move to 1.9.0 before the first payload carried it.

## Event envelope transition

- `1.3.0` accepts the canonical `type` field and the legacy `topic`/`eventType`
  fields. Producers dual-write and consumers call `readEventEnvelope()`.
- `2.0.0` requires `type`, `version`, and `idempotencyKey`; `topic` and
  `eventType` are removed.
