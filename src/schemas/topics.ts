import { z } from "zod";
import {
  blogUpdatedPayloadSchema,
  cartAbandonedPayloadSchema,
  cartUpdatedPayloadSchema,
  categoryUpdatedPayloadSchema,
  cmsUpdatedPayloadSchema,
  orderCreatedPayloadSchema,
  orderStatusUpdatedPayloadSchema,
  pageViewedPayloadSchema,
  productImportedPayloadSchema,
  productUpdatedPayloadSchema,
  userRegisteredPayloadSchema,
  type EventEnvelope,
} from "./events.js";

/**
 * The topic registry.
 *
 * One place answers three questions the services used to answer from memory:
 * who publishes a topic, who consumes it, and which payload schema applies.
 * Operational values (partitions, retention, partition key, DLQ) are the ones
 * `state-for-agents/tasks.json` declares as canonical.
 */

export interface EventTopicConfig {
  readonly producer: string;
  readonly consumers: readonly string[];
  readonly partitions: number;
  readonly retention: string;
  readonly key: string;
  readonly dlq: string;
  readonly note?: string;
}

export const EVENT_TOPICS = {
  "user.registered": {
    producer: "auth-svc",
    consumers: ["notify-svc", "analytics-svc"],
    partitions: 1,
    retention: "7d",
    key: "userId",
    dlq: "user.registered.dlq",
  },
  "cart.updated": {
    producer: "cart-svc",
    consumers: ["analytics-svc"],
    partitions: 3,
    retention: "7d",
    key: "cartId",
    dlq: "cart.updated.dlq",
  },
  "cart.abandoned": {
    producer: "analytics-svc",
    consumers: ["notify-svc"],
    partitions: 3,
    retention: "7d",
    key: "userId",
    dlq: "cart.abandoned.dlq",
  },
  "order.created": {
    producer: "order-svc",
    consumers: ["cart-svc", "catalog-svc", "notify-svc", "analytics-svc"],
    partitions: 3,
    retention: "30d",
    key: "orderId",
    dlq: "order.created.dlq",
  },
  "order.status.updated": {
    producer: "order-svc",
    consumers: ["catalog-svc", "notify-svc"],
    partitions: 3,
    retention: "30d",
    key: "orderId",
    dlq: "order.status.updated.dlq",
  },
  "product.imported": {
    producer: "import-svc",
    consumers: ["catalog-svc", "search-svc"],
    partitions: 1,
    retention: "7d",
    key: "productId",
    dlq: "product.imported.dlq",
  },
  "product.updated": {
    producer: "catalog-svc",
    consumers: ["search-svc"],
    partitions: 3,
    retention: "7d",
    key: "productId",
    dlq: "product.updated.dlq",
  },
  "category.updated": {
    producer: "catalog-svc",
    consumers: ["search-svc"],
    partitions: 1,
    retention: "7d",
    key: "categoryId",
    dlq: "category.updated.dlq",
  },
  "cms.updated": {
    producer: "cms-svc",
    consumers: [],
    partitions: 1,
    retention: "7d",
    key: "sectionKey",
    dlq: "cms.updated.dlq",
    note: "No Kafka consumer in v1: storefront cache invalidation goes through the HTTP webhook, so the storefront never holds Kafka credentials.",
  },
  "blog.updated": {
    producer: "cms-svc",
    consumers: ["search-svc"],
    partitions: 1,
    retention: "7d",
    key: "blogId",
    dlq: "blog.updated.dlq",
  },
  "page.viewed": {
    producer: "analytics-svc",
    consumers: ["analytics-svc"],
    partitions: 6,
    retention: "3d",
    key: "sessionId",
    dlq: "page.viewed.dlq",
    note: "The storefront sends an HTTP beacon to /api/track; analytics-svc validates it and publishes the event.",
  },
} as const satisfies Record<string, EventTopicConfig>;

export type EventTopic = keyof typeof EVENT_TOPICS;

export const EVENT_TOPIC_NAMES = Object.keys(EVENT_TOPICS) as [
  EventTopic,
  ...EventTopic[],
];

export const eventTopicSchema = z.enum(EVENT_TOPIC_NAMES);

/**
 * Payload schema per topic. Typed as a full record so a new topic cannot be
 * registered without a payload contract in the same change.
 */
export const eventPayloadSchemas = {
  "user.registered": userRegisteredPayloadSchema,
  "cart.updated": cartUpdatedPayloadSchema,
  "cart.abandoned": cartAbandonedPayloadSchema,
  "order.created": orderCreatedPayloadSchema,
  "order.status.updated": orderStatusUpdatedPayloadSchema,
  "product.imported": productImportedPayloadSchema,
  "product.updated": productUpdatedPayloadSchema,
  "category.updated": categoryUpdatedPayloadSchema,
  "cms.updated": cmsUpdatedPayloadSchema,
  "blog.updated": blogUpdatedPayloadSchema,
  "page.viewed": pageViewedPayloadSchema,
} as const satisfies Record<EventTopic, z.ZodType>;

export type EventPayload<T extends EventTopic> = z.infer<
  (typeof eventPayloadSchemas)[T]
>;

export function isEventTopic(value: string): value is EventTopic {
  return Object.hasOwn(EVENT_TOPICS, value);
}

export function dlqTopicName(topic: EventTopic): string {
  return EVENT_TOPICS[topic].dlq;
}

/**
 * Validate a payload against its topic. Throws `ZodError` on drift, which is
 * what a consumer should log together with the envelope id.
 */
export function parseEventPayload<T extends EventTopic>(
  topic: T,
  payload: unknown,
): EventPayload<T> {
  // The union of parse() outputs narrows to the requested topic's payload.
  return eventPayloadSchemas[topic].parse(payload) as EventPayload<T>;
}

/**
 * Validate a whole envelope: the topic name, then its payload. Returns the
 * parsed payload so a consumer never keeps the raw `Record<string, unknown>`.
 */
export function parseEventEnvelope<T extends EventTopic>(
  topic: T,
  envelope: EventEnvelope,
): EventPayload<T> {
  if (envelope.type !== topic) {
    throw new Error(
      `envelope type '${envelope.type}' does not match topic '${topic}'`,
    );
  }

  return parseEventPayload(topic, envelope.payload);
}
