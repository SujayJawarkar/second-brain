import { Request } from "express";

export interface AuthPayload {
  userId: string;
  email: string;
  plan: "free" | "pro";
}

export interface AuthRequest extends Request {
  user?: AuthPayload;
}
