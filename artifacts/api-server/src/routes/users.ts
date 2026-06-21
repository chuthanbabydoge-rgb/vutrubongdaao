import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable, teamsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { parseToken, formatUser } from "./auth";
import { z } from "zod";

const router = Router();

async function requireAuth(req: any, res: any): Promise<number | null> {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) { res.status(401).json({ error: "Not authenticated" }); return null; }
  const payload = parseToken(token);
  if (!payload) { res.status(401).json({ error: "Invalid token" }); return null; }
  return payload.userId;
}

function formatPlayerCard(user: typeof usersTable.$inferSelect, teamName?: string | null) {
  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    position: user.position,
    pace: user.pace,
    shooting: user.shooting,
    passing: user.passing,
    dribbling: user.dribbling,
    defending: user.defending,
    physical: user.physical,
    stamina: user.stamina,
    xp: user.xp,
    level: user.level,
    goals: user.goals,
    assists: user.assists,
    matchesPlayed: user.matchesPlayed,
    rating: user.rating,
    favoriteTeamId: user.favoriteTeamId,
    favoriteTeamName: teamName ?? null,
  };
}

router.patch("/users/me", async (req, res) => {
  const userId = await requireAuth(req, res);
  if (!userId) return;

  const { displayName, avatarUrl, position } = req.body;
  const updates: Record<string, unknown> = {};
  if (displayName !== undefined) updates.displayName = displayName;
  if (avatarUrl !== undefined) updates.avatarUrl = avatarUrl;
  if (position !== undefined) updates.position = position;

  const [updated] = await db.update(usersTable).set(updates).where(eq(usersTable.id, userId)).returning();
  if (!updated) return res.status(404).json({ error: "User not found" });

  let favoriteTeamName: string | null = null;
  if (updated.favoriteTeamId) {
    const [team] = await db.select().from(teamsTable).where(eq(teamsTable.id, updated.favoriteTeamId)).limit(1);
    favoriteTeamName = team?.name ?? null;
  }

  return res.json({ ...formatUser(updated), favoriteTeamName });
});

router.post("/users/me/join-team", async (req, res) => {
  const userId = await requireAuth(req, res);
  if (!userId) return;

  const { teamId, position } = req.body;
  if (!teamId) return res.status(400).json({ error: "teamId is required" });

  const [team] = await db.select().from(teamsTable).where(eq(teamsTable.id, teamId)).limit(1);
  if (!team) return res.status(404).json({ error: "Team not found" });

  const updates: Record<string, unknown> = { favoriteTeamId: teamId };
  if (position) updates.position = position;

  const [updated] = await db.update(usersTable).set(updates).where(eq(usersTable.id, userId)).returning();
  return res.json({ ...formatUser(updated), favoriteTeamName: team.name });
});

// GET /users/me/player-card
router.get("/users/me/player-card", async (req, res) => {
  const userId = await requireAuth(req, res);
  if (!userId) return;

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  if (!user) return res.status(404).json({ error: "User not found" });

  let teamName: string | null = null;
  if (user.favoriteTeamId) {
    const [team] = await db.select().from(teamsTable).where(eq(teamsTable.id, user.favoriteTeamId)).limit(1);
    teamName = team?.name ?? null;
  }

  return res.json(formatPlayerCard(user, teamName));
});

const POSITION_DEFAULTS: Record<string, { pace: number; shooting: number; passing: number; dribbling: number; defending: number; physical: number }> = {
  GK:  { pace: 45, shooting: 30, passing: 50, dribbling: 35, defending: 72, physical: 68 },
  CB:  { pace: 50, shooting: 40, passing: 52, dribbling: 42, defending: 73, physical: 68 },
  LB:  { pace: 68, shooting: 45, passing: 62, dribbling: 58, defending: 65, physical: 60 },
  RB:  { pace: 68, shooting: 45, passing: 62, dribbling: 58, defending: 65, physical: 60 },
  CDM: { pace: 55, shooting: 48, passing: 65, dribbling: 55, defending: 67, physical: 62 },
  CM:  { pace: 60, shooting: 58, passing: 70, dribbling: 65, defending: 52, physical: 58 },
  CAM: { pace: 65, shooting: 68, passing: 72, dribbling: 72, defending: 40, physical: 52 },
  LW:  { pace: 75, shooting: 68, passing: 65, dribbling: 75, defending: 38, physical: 55 },
  RW:  { pace: 75, shooting: 68, passing: 65, dribbling: 75, defending: 38, physical: 55 },
  ST:  { pace: 72, shooting: 78, passing: 58, dribbling: 68, defending: 35, physical: 65 },
  CF:  { pace: 70, shooting: 75, passing: 62, dribbling: 70, defending: 38, physical: 60 },
};

const setupSchema = z.object({
  position: z.enum(["GK", "CB", "LB", "RB", "CDM", "CM", "CAM", "LW", "RW", "ST", "CF"]),
  pace: z.number().int().min(0).max(20).optional(),
  shooting: z.number().int().min(0).max(20).optional(),
  passing: z.number().int().min(0).max(20).optional(),
  dribbling: z.number().int().min(0).max(20).optional(),
  defending: z.number().int().min(0).max(20).optional(),
  physical: z.number().int().min(0).max(20).optional(),
});

// POST /users/me/setup
router.post("/users/me/setup", async (req, res) => {
  const userId = await requireAuth(req, res);
  if (!userId) return;

  const parsed = setupSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input", details: parsed.error });

  const { position, pace = 0, shooting = 0, passing = 0, dribbling = 0, defending = 0, physical = 0 } = parsed.data;

  // Validate total bonus points ≤ 20
  const total = pace + shooting + passing + dribbling + defending + physical;
  if (total > 20) return res.status(400).json({ error: "Total bonus points cannot exceed 20" });

  const defaults = POSITION_DEFAULTS[position] ?? POSITION_DEFAULTS.CM;

  const [updated] = await db.update(usersTable).set({
    position,
    pace: Math.min(99, defaults.pace + pace),
    shooting: Math.min(99, defaults.shooting + shooting),
    passing: Math.min(99, defaults.passing + passing),
    dribbling: Math.min(99, defaults.dribbling + dribbling),
    defending: Math.min(99, defaults.defending + defending),
    physical: Math.min(99, defaults.physical + physical),
    stamina: 100,
    xp: 0,
    level: 1,
  }).where(eq(usersTable.id, userId)).returning();

  if (!updated) return res.status(404).json({ error: "User not found" });

  let teamName: string | null = null;
  if (updated.favoriteTeamId) {
    const [team] = await db.select().from(teamsTable).where(eq(teamsTable.id, updated.favoriteTeamId)).limit(1);
    teamName = team?.name ?? null;
  }

  return res.json(formatPlayerCard(updated, teamName));
});

export { formatPlayerCard };
export default router;
