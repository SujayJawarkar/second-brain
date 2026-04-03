import { Router, Request, Response } from "express";
import { authService } from "../services/auth.service";
import { authenticate } from "../middleware/auth";
import { AuthRequest } from "../types";

const router = Router();

// POST /api/v1/auth/register
router.post("/register", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }

  if (password.length < 8) {
    res.status(400).json({ error: "Password must be at least 8 characters" });
    return;
  }

  try {
    const result = await authService.register(email, password);
    res.status(201).json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/v1/auth/login
router.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }

  try {
    const result = await authService.login(email, password);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(401).json({ error: err.message });
  }
});

// POST /api/v1/auth/upgrade — simulate payment & flip plan to pro
router.post("/upgrade", authenticate, async (req: AuthRequest, res: Response) => {
  const { userId } = req.user!;
  try {
    const result = await authService.upgradeToPro(userId);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/v1/auth/password — change password (authenticated)
router.put("/password", authenticate, async (req: AuthRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  const { userId } = req.user!;

  if (!currentPassword || !newPassword) {
    res.status(400).json({ error: "currentPassword and newPassword are required" });
    return;
  }

  try {
    await authService.changePassword(userId, currentPassword, newPassword);
    res.json({ message: "Password updated successfully" });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/v1/auth/account — delete account + all data (authenticated)
router.delete("/account", authenticate, async (req: AuthRequest, res: Response) => {
  const { userId } = req.user!;

  try {
    await authService.deleteAccount(userId);
    res.json({ message: "Account deleted" });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
