import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { z } from "zod";
import crypto from "crypto";

const router = Router();

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + process.env.SESSION_SECRET).digest("hex");
}

function generateToken(userId: number): string {
  return Buffer.from(JSON.stringify({ userId, ts: Date.now() })).toString("base64");
}

function parseToken(token: string): { userId: number } | null {
  try {
    return JSON.parse(Buffer.from(token, "base64").toString("utf8"));
  } catch {
    return null;
  }
}

const registerSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
  displayName: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string(),
  password: z.string(),
});

router.post("/auth/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Validation failed", details: parsed.error });
  }
  const { username, email, password, displayName } = parsed.data;

  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (existing.length > 0) {
    return res.status(400).json({ error: "Email already registered" });
  }

  const existingUsername = await db.select().from(usersTable).where(eq(usersTable.username, username)).limit(1);
  if (existingUsername.length > 0) {
    return res.status(400).json({ error: "Username already taken" });
  }

  const [user] = await db.insert(usersTable).values({
    username,
    email,
    passwordHash: hashPassword(password),
    displayName: displayName ?? username,
  }).returning();

  const token = generateToken(user.id);
  return res.status(201).json({
    user: formatUser(user),
    token,
  });
});

router.post("/auth/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Validation failed" });
  }
  const { email, password } = parsed.data;

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (!user || user.passwordHash !== hashPassword(password)) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const token = generateToken(user.id);
  return res.json({ user: formatUser(user), token });
});

router.post("/auth/logout", (_req, res) => {
  return res.json({ success: true });
});

router.get("/auth/me", async (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Not authenticated" });

  const payload = parseToken(token);
  if (!payload) return res.status(401).json({ error: "Invalid token" });

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, payload.userId)).limit(1);
  if (!user) return res.status(401).json({ error: "User not found" });

  return res.json(formatUser(user));
});

function formatUser(user: typeof usersTable.$inferSelect) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    favoriteTeamId: user.favoriteTeamId,
    position: user.position,
    rating: user.rating,
    matchesPlayed: user.matchesPlayed,
    goals: user.goals,
    assists: user.assists,
    pace: user.pace,
    shooting: user.shooting,
    passing: user.passing,
    dribbling: user.dribbling,
    defending: user.defending,
    physical: user.physical,
    stamina: user.stamina,
    xp: user.xp,
    level: user.level,
    createdAt: user.createdAt?.toISOString() ?? new Date().toISOString(),
  };
}

export { parseToken, formatUser };
export default router;
