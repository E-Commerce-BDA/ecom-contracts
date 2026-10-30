import { describe, expect, it } from "vitest";

import {
  EVENT_TOPIC_NAMES,
  TASK_DLQ_NAMES,
  TASK_QUEUES,
  TASK_QUEUE_NAMES,
  isTaskQueue,
  processImportRowJobSchema,
  resizeImageJobSchema,
  sendEmailJobSchema,
  taskQueueNameSchema,
} from "../src/index.js";

const emailJob = {
  template: "order-confirmation" as const,
  orderId: "0190c9f4-0000-7000-8000-000000000001",
  idempotencyKey: "order.created:0190c9f4-0000-7000-8000-000000000001",
};

const importRow = {
  jobId: "0190c9f4-0000-7000-8000-000000000002",
  rowNumber: 1,
  source: "csv" as const,
  stockMode: "replace" as const,
  row: { sku: "SKU-1", name: "Linen shirt", stock: 12, discontinued: false },
};

describe("sendEmailJobSchema", () => {
  it("accepts a job that names the order it is about", () => {
    expect(sendEmailJobSchema.parse(emailJob)).toEqual(emailJob);
  });

  it("accepts a cart reminder keyed by user", () => {
    expect(
      sendEmailJobSchema.safeParse({
        template: "cart-abandoned",
        userId: "user-1",
        idempotencyKey: "cart.abandoned:cart-1",
      }).success,
    ).toBe(true);
  });

  it("rejects a job with no aggregate to resolve the recipient from", () => {
    const result = sendEmailJobSchema.safeParse({
      template: "welcome",
      idempotencyKey: "user.registered:user-1",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an embedded address: PII stays out of Kafka and out of SQS", () => {
    expect(sendEmailJobSchema.safeParse({ ...emailJob, to: "ada@example.com" }).success).toBe(false);
  });

  it("requires the idempotency key that makes redelivery safe", () => {
    const { idempotencyKey, ...withoutKey } = emailJob;
    expect(idempotencyKey).toBeTruthy();
    expect(sendEmailJobSchema.safeParse(withoutKey).success).toBe(false);
  });

  it("rejects a template that is not one of the three emails", () => {
    expect(sendEmailJobSchema.safeParse({ ...emailJob, template: "reset-password" }).success).toBe(false);
  });
});

describe("processImportRowJobSchema", () => {
  it("accepts a CSV row with mixed scalar cells", () => {
    expect(processImportRowJobSchema.parse(importRow)).toEqual(importRow);
  });

  it("rejects rowNumber 0: rows are counted from 1", () => {
    expect(processImportRowJobSchema.safeParse({ ...importRow, rowNumber: 0 }).success).toBe(false);
  });

  it("rejects an unknown stock mode", () => {
    expect(processImportRowJobSchema.safeParse({ ...importRow, stockMode: "merge" }).success).toBe(false);
  });

  it("rejects a nested object in a row: cells are scalars", () => {
    expect(
      processImportRowJobSchema.safeParse({ ...importRow, row: { sku: "SKU-1", meta: { a: 1 } } }).success,
    ).toBe(false);
  });
});

describe("resizeImageJobSchema", () => {
  it("stays valid: 1.8.0 adds schemas, it does not change this one", () => {
    expect(
      resizeImageJobSchema.safeParse({
        mediaId: "0190c9f4-0000-7000-8000-000000000003",
        sourceKey: "media/2026/10/0190c9f4-0000-7000-8000-000000000003.png",
        formats: ["webp"],
        widths: [320],
      }).success,
    ).toBe(true);
  });
});

describe("TASK_QUEUES", () => {
  it("declares exactly the three task queues", () => {
    expect(TASK_QUEUE_NAMES).toEqual([
      "notify-send-email",
      "import-process-row",
      "media-resize-image",
    ]);
  });

  it("uses names SQS accepts: no dots anywhere", () => {
    for (const name of [...TASK_QUEUE_NAMES, ...TASK_DLQ_NAMES]) {
      expect(name).toMatch(/^[A-Za-z0-9_-]{1,80}$/);
    }
  });

  it("gives every queue a `<queue>-dlq` twin with maxReceiveCount 5", () => {
    for (const task of Object.values(TASK_QUEUES)) {
      expect(task.dlq).toBe(`${task.queue}-dlq`);
      expect(task.maxReceiveCount).toBe(5);
      expect(task.visibilityTimeoutSeconds).toBe(60);
      expect(task.retention).toBe("14d");
    }
  });

  it("keeps tasks off the event log", () => {
    for (const name of TASK_QUEUE_NAMES) {
      expect(EVENT_TOPIC_NAMES as readonly string[]).not.toContain(name);
    }
  });

  it("recognises its own names and nothing else", () => {
    expect(isTaskQueue("notify-send-email")).toBe(true);
    expect(isTaskQueue("reminder.dispatch")).toBe(false);
    expect(taskQueueNameSchema.safeParse("media-resize-image").success).toBe(true);
  });
});
