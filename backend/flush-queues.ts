// save as flush-queues.ts in root
import Redis from "ioredis";
import dotenv from "dotenv";
dotenv.config();

const redis = new Redis(process.env.REDIS_URL!);

async function flush() {
  await redis.del("ingest");
  await redis.del("embed");
  await redis.del("tag");
  await redis.del("link");
  console.log("✅ All queues flushed");
  await redis.quit();
}

flush();
