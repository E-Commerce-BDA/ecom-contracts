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

## Event envelope transition

- `1.3.0` accepts the canonical `type` field and the legacy `topic`/`eventType`
  fields. Producers dual-write and consumers call `readEventEnvelope()`.
- `2.0.0` requires `type`, `version`, and `idempotencyKey`; `topic` and
  `eventType` are removed.
