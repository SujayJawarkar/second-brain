import { Response } from "express";
import { redis } from "../config/redis";
import Redis from "ioredis";

// Separate subscriber connection — ioredis requires dedicated client for pub/sub
const subscriber = new Redis(process.env.REDIS_URL!);

const connections = new Map<string, Set<Response>>();

export const sse = {
  add(userId: string, res: Response) {
    if (!connections.has(userId)) {
      connections.set(userId, new Set());
    }
    connections.get(userId)!.add(res);
  },

  remove(userId: string, res: Response) {
    connections.get(userId)?.delete(res);
    if (connections.get(userId)?.size === 0) {
      connections.delete(userId);
    }
  },

  // Called by workers — publishes to Redis channel
  async publish(userId: string, event: string, data: unknown) {
    await redis.publish(`sse:${userId}`, JSON.stringify({ event, data }));
  },

  // Forward to connected clients — called internally by subscriber
  deliver(userId: string, event: string, data: unknown) {
    const userConnections = connections.get(userId);
    if (!userConnections || userConnections.size === 0) return;

    const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;

    for (const res of userConnections) {
      try {
        res.write(payload);
      } catch {
        userConnections.delete(res);
      }
    }
  },

  // Start listening for Redis pub/sub messages
  startSubscriber() {
    subscriber.psubscribe("sse:*", (err) => {
      if (err) console.error("SSE subscriber error:", err.message);
      else console.log("✅ SSE subscriber ready");
    });

    subscriber.on("pmessage", (_pattern, channel, message) => {
      const userId = channel.replace("sse:", "");
      try {
        const { event, data } = JSON.parse(message);
        sse.deliver(userId, event, data);
      } catch {
        console.error("SSE parse error:", message);
      }
    });
  },
};
