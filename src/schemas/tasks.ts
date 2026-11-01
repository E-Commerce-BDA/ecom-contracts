import { z } from "zod";
import { isoDateSchema, uuidSchema } from "./common.js";
import { taskQueueNameSchema } from "./queues.js";

/**
 * The envelope every SQS task travels in.
 *
 * `TASK_QUEUES` names the queues and `jobs.ts` types each payload, but neither
 * says *which* message a redelivery is. That role belongs here: `id` identifies
 * the enqueue, and `idempotencyKey` identifies the effect, so a worker that
 * receives the same job twice can drop the second attempt instead of repeating
 * it. An SQS `MessageDeduplicationId` cannot stand in: standard queues ignore
 * it, and a redrive to the DLQ would not carry it forward.
 *
 * The envelope is deliberately generic — `payload` is `unknown` because this
 * schema validates the *shape of the envelope*, not the job. Each worker parses
 * its own payload with the schema from `jobs.ts` afterwards, so a queue can
 * never be validated against another queue's job type.
 */
export const taskMessageSchema = z
  .object({
    id: uuidSchema,
    queue: taskQueueNameSchema,
    /** e.g. `media.resize-image` — dotted, unlike the queue name itself. */
    type: z.string().min(1).max(64),
    idempotencyKey: z.string().min(1).max(128),
    enqueuedAt: isoDateSchema,
    payload: z.unknown(),
  })
  .strict();

export type TaskMessage = z.infer<typeof taskMessageSchema>;

/**
 * The envelope narrowed to one job type.
 *
 * A worker validates the envelope first (so a malformed `queue` dead-letters
 * with `stage: 'envelope'`) and the payload second. Composing them here keeps
 * the pair in one place instead of repeating `taskMessageSchema.extend(...)` in
 * every service.
 */
export function taskMessageFor<P extends z.ZodType>(payload: P) {
  return taskMessageSchema.extend({ payload });
}
