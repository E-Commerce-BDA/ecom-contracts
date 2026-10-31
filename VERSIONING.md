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
