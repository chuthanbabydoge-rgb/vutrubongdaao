import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable, teamsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { parseToken, formatUser } from "./auth";

const router = Router();

async function requireAuth(req: any, res: any): Promise<number | null> {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) { res.status(401).json({ error: "Not authenticated" }); return null; }
  const payload = parseToken(token);
  if (!payload) { res.status(401).json({ error: "Invalid token" }); return null; }
  return payload.userId;
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

export default router;
