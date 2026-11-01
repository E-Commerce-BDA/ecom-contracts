import { describe, expect, it } from "vitest";

import {
  TASK_QUEUES,
  resizeImageJobSchema,
  taskMessageFor,
  taskMessageSchema,
} from "../src/index.js";

const message = {
  id: "0190c9f4-0000-7000-8000-000000000010",
  queue: "media-resize-image" as const,
  type: "media.resize-image",
  idempotencyKey: "media:0190c9f4-0000-7000-8000-000000000003",
  enqueuedAt: "2026-11-02T10:00:00.000Z",
  payload: { mediaId: "0190c9f4-0000-7000-8000-000000000003" },
};

const resizeJob = {
  mediaId: "0190c9f4-0000-7000-8000-000000000003",
  sourceKey: "media/2026/10/0190c9f4-0000-7000-8000-000000000003.png",
  formats: ["webp", "avif"],
  widths: [320, 960],
};

describe("taskMessageSchema", () => {
  it("accepts an envelope for a declared queue", () => {
    expect(taskMessageSchema.parse(message)).toEqual(message);
  });

  it("rejects a queue that is not in TASK_QUEUES", () => {
    expect(
      taskMessageSchema.safeParse({ ...message, queue: "media-resize" }).success,
    ).toBe(false);
    expect(
      taskMessageSchema.safeParse({ ...message, queue: "Kafka:media.tasks" })
        .success,
    ).toBe(false);
  });

  it("requires the idempotency key that makes redelivery a no-op", () => {
    const { idempotencyKey, ...withoutKey } = message;
    expect(idempotencyKey).toBeTruthy();
    expect(taskMessageSchema.safeParse(withoutKey).success).toBe(false);
    expect(
      taskMessageSchema.safeParse({ ...message, idempotencyKey: "" }).success,
    ).toBe(false);
  });

  it("requires a UUID id, so two enqueues of one effect are distinguishable", () => {
    expect(taskMessageSchema.safeParse({ ...message, id: "task-1" }).success).toBe(
      false,
    );
  });

  it("rejects a timestamp that does not parse", () => {
    expect(
      taskMessageSchema.safeParse({ ...message, enqueuedAt: "yesterday" })
        .success,
    ).toBe(false);
  });

  it("rejects an unknown envelope field: the envelope is closed like every payload", () => {
    expect(
      taskMessageSchema.safeParse({ ...message, dlqReason: "manual" }).success,
    ).toBe(false);
  });

  it("rejects a dot in the queue name, which SQS cannot create", () => {
    expect(
      taskMessageSchema.safeParse({ ...message, queue: "media.resize.image" })
        .success,
    ).toBe(false);
  });
});

describe("taskMessageFor", () => {
  it("validates the envelope and the job together", () => {
    const schema = taskMessageFor(resizeImageJobSchema);
    const full = { ...message, payload: resizeJob };

    expect(schema.parse(full)).toEqual(full);
    expect(
      schema.safeParse({ ...full, payload: { ...resizeJob, widths: [] } })
        .success,
    ).toBe(false);
  });

  it("still rejects a bad envelope before it looks at the payload", () => {
    const schema = taskMessageFor(resizeImageJobSchema);
    expect(schema.safeParse({ ...message, queue: "nope", payload: resizeJob }).success).toBe(
      false,
    );
  });

  it("names the queue the media worker actually listens on", () => {
    expect(TASK_QUEUES.mediaResizeImage.queue).toBe(message.queue);
    expect(TASK_QUEUES.mediaResizeImage.consumer).toBe("cms-svc");
  });
});
