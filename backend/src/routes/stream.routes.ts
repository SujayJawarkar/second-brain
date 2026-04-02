import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { AuthPayload } from "../types";
import { sse } from "../utils/sse";

const router = Router();

router.get("/", (req: Request, res: Response) => {
  // Read token from query param (EventSource can't set headers)
  const token = req.query.token as string;

  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const user = jwt.verify(token, env.jwtSecret) as AuthPayload;

    // SSE headers — must set before any write
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.flushHeaders();

    // Send connected event
    res.write(
      `event: connected\ndata: ${JSON.stringify({ userId: user.userId })}\n\n`,
    );

    // Register connection
    sse.add(user.userId, res);

    // Keep alive ping every 30s
    const keepAlive = setInterval(() => {
      try {
        res.write(": ping\n\n");
      } catch {
        clearInterval(keepAlive);
      }
    }, 30000);

    // Cleanup on disconnect
    req.on("close", () => {
      clearInterval(keepAlive);
      sse.remove(user.userId, res);
      console.log(`SSE disconnected: ${user.userId}`);
    });
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
});

export default router;
