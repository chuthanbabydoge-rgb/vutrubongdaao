import { Router } from "express";
import { db } from "@workspace/db";
import { playersTable, teamsTable } from "@workspace/db";
import { eq, and, ilike, sql } from "drizzle-orm";
import { formatPlayer } from "./teams";

const router = Router();

router.get("/players", async (req, res) => {
  const { teamId, position, nationality, search } = req.query as {
    teamId?: string; position?: string; nationality?: string; search?: string;
  };

  const conditions = [];
  if (teamId) conditions.push(eq(playersTable.teamId, parseInt(teamId)));
  if (position) conditions.push(eq(playersTable.position, position));
  if (nationality) conditions.push(eq(playersTable.nationality, nationality));
  if (search) conditions.push(ilike(playersTable.name, `%${search}%`));

  const players = conditions.length > 0
    ? await db.select({ player: playersTable, team: teamsTable })
        .from(playersTable)
        .innerJoin(teamsTable, eq(playersTable.teamId, teamsTable.id))
        .where(and(...conditions))
        .orderBy(sql`${playersTable.rating} DESC`)
    : await db.select({ player: playersTable, team: teamsTable })
        .from(playersTable)
        .innerJoin(teamsTable, eq(playersTable.teamId, teamsTable.id))
        .orderBy(sql`${playersTable.rating} DESC`)
        .limit(100);

  return res.json(players.map(({ player, team }) => formatPlayer(player, team.name)));
});

router.get("/players/:playerId", async (req, res) => {
  const playerId = parseInt(req.params.playerId);
  if (isNaN(playerId)) return res.status(400).json({ error: "Invalid player ID" });

  const [row] = await db
    .select({ player: playersTable, team: teamsTable })
    .from(playersTable)
    .innerJoin(teamsTable, eq(playersTable.teamId, teamsTable.id))
    .where(eq(playersTable.id, playerId))
    .limit(1);

  if (!row) return res.status(404).json({ error: "Player not found" });
  return res.json(formatPlayer(row.player, row.team.name));
});

export default router;
