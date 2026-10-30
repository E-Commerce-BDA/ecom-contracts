import { z } from "zod";

/**
 * The task-queue registry.
 *
 * Tasks are SQS-only: they are commands for one worker, not facts for many
 * consumers, so they never appear on Kafka. `EVENT_TOPICS` answers the same
 * question for the event log.
 *
 * The names are hyphenated because SQS accepts only alphanumerics, hyphens and
 * underscores — a dot is legal only as the trailing `.fifo`. The same three
 * names are created by `ecom-infra/localstack/init/ready.d/10-sqs-queues.sh`
 * locally and by `ecom-infra/aws/sqs.tf` in AWS, so a rename has to land in all
 * three places; the tests here pin the values the other two use.
 */

export const TASK_QUEUES = {
  notifySendEmail: {
    queue: "notify-send-email",
    dlq: "notify-send-email-dlq",
    producer: "notify-svc",
    consumer: "notify-svc",
    maxReceiveCount: 5,
    visibilityTimeoutSeconds: 60,
    retention: "14d",
  },
  importProcessRow: {
    queue: "import-process-row",
    dlq: "import-process-row-dlq",
    producer: "import-svc",
    consumer: "import-svc",
    maxReceiveCount: 5,
    visibilityTimeoutSeconds: 60,
    retention: "14d",
  },
  mediaResizeImage: {
    queue: "media-resize-image",
    dlq: "media-resize-image-dlq",
    producer: "cms-svc",
    consumer: "cms-svc",
    maxReceiveCount: 5,
    visibilityTimeoutSeconds: 60,
    retention: "14d",
  },
} as const satisfies Record<
  string,
  {
    readonly queue: string;
    readonly dlq: string;
    readonly producer: string;
    readonly consumer: string;
    readonly maxReceiveCount: number;
    readonly visibilityTimeoutSeconds: number;
    readonly retention: string;
  }
>;

export type TaskQueueKey = keyof typeof TASK_QUEUES;

export const TASK_QUEUE_NAMES = Object.values(TASK_QUEUES).map(
  (task) => task.queue,
) as [
  (typeof TASK_QUEUES)[TaskQueueKey]["queue"],
  ...(typeof TASK_QUEUES)[TaskQueueKey]["queue"][],
];

export const TASK_DLQ_NAMES = Object.values(TASK_QUEUES).map(
  (task) => task.dlq,
) as [(typeof TASK_QUEUES)[TaskQueueKey]["dlq"], ...(typeof TASK_QUEUES)[TaskQueueKey]["dlq"][]];

export const taskQueueNameSchema = z.enum(TASK_QUEUE_NAMES);

export type TaskQueueName = z.infer<typeof taskQueueNameSchema>;

export function isTaskQueue(value: string): value is TaskQueueName {
  return (TASK_QUEUE_NAMES as readonly string[]).includes(value);
}
