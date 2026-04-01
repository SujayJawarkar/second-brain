import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { users } from "../db/schema";
import { env } from "../config/env";
import { AuthPayload } from "../types";

export class AuthService {
  async register(email: string, password: string) {
    // Check if user already exists
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existing.length > 0) {
      throw new Error("Email already registered");
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 12);

    // Insert user
    const [user] = await db
      .insert(users)
      .values({ email, password: hashed })
      .returning({
        id: users.id,
        email: users.email,
        plan: users.plan,
      });

    const token = this.signToken(user);
    return { user, token };
  }

  async login(email: string, password: string) {
    // Find user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      throw new Error("Invalid email or password");
    }

    // Verify password
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new Error("Invalid email or password");
    }

    // Update last login
    await db
      .update(users)
      .set({ lastLogin: new Date() })
      .where(eq(users.id, user.id));

    const token = this.signToken(user);
    return {
      user: { id: user.id, email: user.email, plan: user.plan },
      token,
    };
  }

  private signToken(user: { id: string; email: string; plan: string }) {
    const payload: AuthPayload = {
      userId: user.id,
      email: user.email,
      plan: user.plan as "free" | "pro",
    };
    return jwt.sign(payload, env.jwtSecret, { expiresIn: "7d" });
  }
}

export const authService = new AuthService();
