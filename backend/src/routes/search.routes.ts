import { Router, Response } from "express";
import { authenticate } from "../middleware/auth";
import { AuthRequest } from "../types";
import { searchService } from "../services/search.service";

const router = Router();

router.use(authenticate);

// GET /api/v1/search?q=...&source_type=url&limit=20
router.get("/", async (req: AuthRequest, res: Response) => {
  const { userId, plan } = req.user!;
  const query = req.query.q as string;
  const sourceType = req.query.source_type as
    | "url"
    | "pdf"
    | "note"
    | undefined;
  const limit = parseInt(req.query.limit as string) || 20;

  if (!query || query.trim().length === 0) {
    res.status(400).json({ error: "Query parameter q is required" });
    return;
  }

  try {
    const start = Date.now();
    const results = await searchService.search(
      userId,
      query,
      plan,
      limit,
      sourceType,
    );
    const latency = Date.now() - start;

    res.json({
      query,
      results,
      count: results.length,
      latency_ms: latency,
      mode: plan === "pro" ? "hybrid" : "keyword",
    });
  } catch (err: any) {
    console.error("Search error:", err.message);
    res.status(500).json({ error: "Search failed" });
  }
});

export default router;
