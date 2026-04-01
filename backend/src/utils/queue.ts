import { redis } from "../config/redis";

export type QueueName = "ingest" | "embed" | "tag" | "link";

export async function enqueue(queue: QueueName, data: Record<string, string>) {
  await redis.xadd(queue, "*", ...Object.entries(data).flat());
}
