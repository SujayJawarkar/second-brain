import { Router, Response } from "express";
import { authenticate } from "../middleware/auth";
import { AuthRequest } from "../types";
import { resurfaceService } from "../services/resurface.service";
import { itemService } from "../services/item.service";

const router = Router();
router.use(authenticate);

// GET /api/v1/resurface — today's picks
router.get("/", async (req: AuthRequest, res: Response) => {
  const { userId } = req.user!;
  try {
    const picks = await resurfaceService.getTodaysPicks(userId);
    res.json({ picks, count: picks.length, date: new Date().toISOString().split("T")[0] });
  } catch (err: any) {
    console.error("Resurface error:", err.message);
    res.status(500).json({ error: "Failed to compute resurface picks" });
  }
});

// POST /api/v1/resurface/:id/viewed — mark item as reviewed today
router.post("/:id/viewed", async (req: AuthRequest, res: Response) => {
  const { userId } = req.user!;
  const itemId = req.params.id as string;

  try {
    await itemService.markViewed(itemId);
    await resurfaceService.markSurfaced(itemId, userId);
    res.json({ ok: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
