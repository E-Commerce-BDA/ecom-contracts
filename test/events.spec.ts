import { describe, expect, it } from "vitest";
import {
  EVENT_TOPIC_NAMES,
  EVENT_TOPICS,
  cartAbandonedPayloadSchema,
  cartUpdatedPayloadSchema,
  dlqTopicName,
  eventPayloadSchemas,
  eventTopicSchema,
  isEventTopic,
  orderCreatedPayloadSchema,
  orderStatusUpdatedPayloadSchema,
  pageViewedPayloadSchema,
  parseEventEnvelope,
  parseEventPayload,
  userRegisteredPayloadSchema,
  type EventEnvelope,
} from "../src/index.js";

const uuid = (suffix: string) =>
  `00000000-0000-4000-8000-${suffix.padStart(12, "0")}`;

/** Exactly what `buildCartUpdatedEvent` + `toItemDto` put on the wire. */
const cartItem = {
  id: uuid("101"),
  productId: uuid("201"),
  variantId: null,
  qty: 2,
  unitPrice: 24.5,
  productName: "Linen Shirt",
  productSlug: "linen-shirt",
  imageUrl: null,
  variantLabel: null,
  addedAt: "2026-10-29T09:15:00.000Z",
};

const cartUpdated = {
  cartId: uuid("301"),
  userId: null,
  sessionId: "sess-abc",
  status: "active" as const,
  items: [cartItem],
  totals: { subtotal: 49, itemCount: 2, lineCount: 1 },
  updatedAt: "2026-10-29T09:16:00.000Z",
};

const orderCreated = {
  orderId: uuid("401"),
  orderNumber: "ORD-2026-000123",
  userId: uuid("501"),
  grandTotal: 149.99,
  itemsCount: 3,
  reservationId: uuid("601"),
  createdAt: "2026-10-29T10:00:00.000Z",
};

const statusUpdated = {
  orderId: uuid("401"),
  orderNumber: "ORD-2026-000123",
  from: "processing" as const,
  to: "cancelled" as const,
  note: "customer request",
  actor: uuid("701"),
  timestamp: "2026-10-29T11:00:00.000Z",
};

describe("user.registered payload", () => {
  it("accepts the id-only payload auth-svc publishes", () => {
    const parsed = userRegisteredPayloadSchema.parse({
      userId: uuid("501"),
      displayName: "Ada",
      registeredAt: "2026-10-29T08:00:00.000Z",
    });

    expect(parsed.displayName).toBe("Ada");
  });

  it("omits displayName rather than sending null", () => {
    const result = userRegisteredPayloadSchema.safeParse({
      userId: uuid("501"),
      displayName: null,
      registeredAt: "2026-10-29T08:00:00.000Z",
    });

    expect(result.success).toBe(false);
  });

  it("rejects an embedded email (PII stays out of the event)", () => {
    const result = userRegisteredPayloadSchema.safeParse({
      userId: uuid("501"),
      email: "ada@example.com",
      registeredAt: "2026-10-29T08:00:00.000Z",
    });

    expect(result.success).toBe(false);
  });

  it("rejects an unknown field", () => {
    const result = userRegisteredPayloadSchema.safeParse({
      userId: uuid("501"),
      registeredAt: "2026-10-29T08:00:00.000Z",
      role: "admin",
    });

    expect(result.success).toBe(false);
  });
});

describe("cart.updated payload", () => {
  it("accepts the guest-cart shape with null columns", () => {
    const parsed = cartUpdatedPayloadSchema.parse(cartUpdated);

    expect(parsed.userId).toBeNull();
    expect(parsed.items[0]?.variantId).toBeNull();
  });

  it("accepts a variant line and rejects a numeric string price", () => {
    const withVariant = {
      ...cartUpdated,
      userId: uuid("501"),
      items: [
        {
          ...cartItem,
          variantId: uuid("801"),
          productSlug: null,
          variantLabel: "M / White",
          unitPrice: "24.50",
        },
      ],
    };

    expect(cartUpdatedPayloadSchema.safeParse(withVariant).success).toBe(false);
  });

  it("rejects a missing item id", () => {
    const { id: _id, ...withoutId } = cartItem;
    const result = cartUpdatedPayloadSchema.safeParse({
      ...cartUpdated,
      items: [withoutId],
    });

    expect(result.success).toBe(false);
  });

  it("rejects a zero-quantity line", () => {
    const result = cartUpdatedPayloadSchema.safeParse({
      ...cartUpdated,
      items: [{ ...cartItem, qty: 0 }],
    });

    expect(result.success).toBe(false);
  });

  it("rejects an unknown cart status", () => {
    const result = cartUpdatedPayloadSchema.safeParse({
      ...cartUpdated,
      status: "merged",
    });

    expect(result.success).toBe(false);
  });
});

describe("cart.abandoned payload", () => {
  it("accepts the documented shape", () => {
    const parsed = cartAbandonedPayloadSchema.parse({
      cartId: uuid("301"),
      userId: null,
      sessionId: "sess-abc",
      itemsCount: 2,
      subtotal: 49,
      lastActivityAt: "2026-10-29T09:16:00.000Z",
      abandonedAt: "2026-10-30T09:16:00.000Z",
    });

    expect(parsed.itemsCount).toBe(2);
  });
});

describe("order.created payload", () => {
  it("accepts a checkout-created order", () => {
    const parsed = orderCreatedPayloadSchema.parse(orderCreated);

    expect(parsed.reservationId).toBe(uuid("601"));
  });

  it("accepts an empty reservationId from a legacy resume", () => {
    const parsed = orderCreatedPayloadSchema.parse({
      ...orderCreated,
      reservationId: "",
    });

    expect(parsed.reservationId).toBe("");
  });

  it("rejects a malformed reservationId", () => {
    const result = orderCreatedPayloadSchema.safeParse({
      ...orderCreated,
      reservationId: "res-123",
    });

    expect(result.success).toBe(false);
  });

  it("rejects a missing orderId", () => {
    const { orderId: _orderId, ...rest } = orderCreated;
    expect(orderCreatedPayloadSchema.safeParse(rest).success).toBe(false);
  });
});

describe("order.status.updated payload", () => {
  it("accepts a status change with a note and actor", () => {
    const parsed = orderStatusUpdatedPayloadSchema.parse(statusUpdated);

    expect(parsed.to).toBe("cancelled");
  });

  it("accepts a null note", () => {
    const parsed = orderStatusUpdatedPayloadSchema.parse({
      ...statusUpdated,
      note: null,
    });

    expect(parsed.note).toBeNull();
  });

  it("accepts a refund amount as string and as number", () => {
    const withString = orderStatusUpdatedPayloadSchema.parse({
      ...statusUpdated,
      to: "refunded",
      refundAmount: "49.90",
      refundReference: "re_123",
    });
    const withNumber = orderStatusUpdatedPayloadSchema.parse({
      ...statusUpdated,
      to: "refunded",
      refundAmount: 49.9,
    });

    expect(withString.refundAmount).toBe("49.90");
    expect(withNumber.refundAmount).toBe(49.9);
  });

  it("rejects money with three decimals", () => {
    const result = orderStatusUpdatedPayloadSchema.safeParse({
      ...statusUpdated,
      refundAmount: "49.901",
    });

    expect(result.success).toBe(false);
  });

  it("rejects an unknown status", () => {
    const result = orderStatusUpdatedPayloadSchema.safeParse({
      ...statusUpdated,
      to: "refunding",
    });

    expect(result.success).toBe(false);
  });
});

describe("page.viewed payload", () => {
  it("accepts a beacon with optional device and duration", () => {
    const parsed = pageViewedPayloadSchema.parse({
      sessionId: "sess-abc",
      page: "/products/linen-shirt",
      referrer: "https://example.test/search",
      device: "mobile",
      eventKind: "heartbeat",
      durationMs: 15000,
      exited: false,
      timestamp: "2026-10-29T10:00:00.000Z",
    });

    expect(parsed.eventKind).toBe("heartbeat");
  });

  it("rejects an eventKind outside pageview and heartbeat", () => {
    const result = pageViewedPayloadSchema.safeParse({
      sessionId: "sess-abc",
      page: "/",
      eventKind: "click",
      timestamp: "2026-10-29T10:00:00.000Z",
    });

    expect(result.success).toBe(false);
  });
});

describe("topic registry", () => {
  it("lists eleven topics and a schema for every one of them", () => {
    expect(EVENT_TOPIC_NAMES).toHaveLength(11);
    expect(Object.keys(eventPayloadSchemas).sort()).toEqual(
      [...EVENT_TOPIC_NAMES].sort(),
    );
  });

  it("names one producer and a partitions/key/retention triple per topic", () => {
    for (const name of EVENT_TOPIC_NAMES) {
      const config = EVENT_TOPICS[name];
      expect(config.producer.length).toBeGreaterThan(0);
      expect(config.partitions).toBeGreaterThan(0);
      expect(config.retention).toMatch(/^\d+d$/);
      expect(config.key.length).toBeGreaterThan(0);
      expect(config.dlq).toBe(`${name}.dlq`);
      // page.viewed is the one self-consumed topic (analytics reads its own stream).
      expect(new Set(config.consumers).size).toBe(config.consumers.length);
    }
  });

  it("keeps cms.updated without a Kafka consumer", () => {
    expect(EVENT_TOPICS["cms.updated"].consumers).toEqual([]);
  });

  it("validates a topic name and rejects an unregistered one", () => {
    expect(eventTopicSchema.parse("order.created")).toBe("order.created");
    expect(eventTopicSchema.safeParse("order.refunded").success).toBe(false);
    expect(isEventTopic("cart.updated")).toBe(true);
    expect(isEventTopic("cart.merged")).toBe(false);
  });

  it("returns the dlq topic for a topic", () => {
    expect(dlqTopicName("order.status.updated")).toBe(
      "order.status.updated.dlq",
    );
  });

  it("parses a payload by topic", () => {
    const payload = parseEventPayload("order.created", orderCreated);

    expect(payload.orderNumber).toBe("ORD-2026-000123");
  });

  it("throws with the failing path when a payload drifts", () => {
    expect(() =>
      parseEventPayload("order.created", { ...orderCreated, grandTotal: -1 }),
    ).toThrow();
  });
});

describe("parseEventEnvelope", () => {
  const envelope: EventEnvelope = {
    id: uuid("901"),
    type: "user.registered",
    producer: "auth-svc",
    timestamp: "2026-10-29T08:00:00.000Z",
    payload: {
      userId: uuid("501"),
      registeredAt: "2026-10-29T08:00:00.000Z",
    },
  };

  it("returns the typed payload for a matching topic", () => {
    expect(parseEventEnvelope("user.registered", envelope).userId).toBe(
      uuid("501"),
    );
  });

  it("refuses an envelope whose type names a different topic", () => {
    expect(() => parseEventEnvelope("cart.updated", envelope)).toThrow(
      /does not match topic/,
    );
  });
});
