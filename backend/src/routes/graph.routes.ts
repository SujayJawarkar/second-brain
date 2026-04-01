import { Router, Response } from "express";
import { authenticate } from "../middleware/auth";
import { requirePro } from "../middleware/requirePro";
import { AuthRequest } from "../types";
import { graphService } from "../services/graph.service";

const router = Router();

router.use(authenticate);
router.use(requirePro);

// GET /api/v1/graph
router.get("/", async (req: AuthRequest, res: Response) => {
  const { userId } = req.user!;

  try {
    const start = Date.now();
    const graph = await graphService.getGraph(userId);
    const latency = Date.now() - start;

    res.json({ ...graph, latency_ms: latency });
  } catch (err: any) {
    console.error("Graph error:", err.message);
    console.error("Graph error stack:", err.stack);
    res
      .status(500)
      .json({ error: "Failed to fetch graph", detail: err.message });
  }
});

// GET /api/v1/graph/related/:id
router.get("/related/:id", async (req: AuthRequest, res: Response) => {
  const { userId } = req.user!;
  const itemId = req.params.id as string;

  try {
    const related = await graphService.getRelated(itemId, userId);
    res.json({ itemId, related, count: related.length });
  } catch (err: any) {
    console.error("Related error:", err.message);
    res.status(500).json({ error: "Failed to fetch related items" });
  }
});

export default router;
