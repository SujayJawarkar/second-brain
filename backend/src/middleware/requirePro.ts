import { Response, NextFunction } from "express";
import { AuthRequest } from "../types";

export function requirePro(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  if (req.user?.plan !== "pro") {
    res.status(403).json({
      error: "Pro plan required",
      message: "Upgrade to Pro to access this feature",
      upgrade_url: "/billing/subscribe",
    });
    return;
  }
  next();
}
