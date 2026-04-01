import { Router, Response } from "express";
import { authenticate } from "../middleware/auth";
import { AuthRequest } from "../types";
import { sse } from "../utils/sse";

const router = Router();

// GET /api/v1/stream
router.get("/", authenticate, (req: AuthRequest, res: Response) => {
  const { userId } = req.user!;

  // Set SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no"); // disable Nginx buffering
  res.flushHeaders();

  // Send initial connected event
  res.write(`event: connected\ndata: ${JSON.stringify({ userId })}\n\n`);

  // Register connection
  sse.add(userId, res);

  // Keep alive ping every 30 seconds
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
    sse.remove(userId, res);
    console.log(`SSE disconnected: ${userId}`);
  });
});

export default router;
