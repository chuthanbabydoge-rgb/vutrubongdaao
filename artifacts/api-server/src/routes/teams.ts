import { Router } from "express";
import { db } from "@workspace/db";
import { teamsTable, playersTable, leaguesTable, matchesTable } from "@workspace/db";
import { eq, and, ilike, sql } from "drizzle-orm";
import { formatMatch } from "./leagues";

const router = Router();

router.get("/teams", async (req, res) => {
  const { leagueId, region, type, search } = req.query as {
    leagueId?: string; region?: string; type?: string; search?: string;
  };

  const conditions = [];
  if (leagueId) conditions.push(eq(teamsTable.leagueId, parseInt(leagueId)));
  if (region) conditions.push(eq(teamsTable.region, region));
  if (type) conditions.push(eq(teamsTable.type, type));
  if (search) conditions.push(ilike(teamsTable.name, `%${search}%`));

  const teams = conditions.length > 0
    ? await db.select().from(teamsTable).where(and(...conditions))
    : await db.select().from(teamsTable);

  const playerCounts = await db
    .select({ teamId: playersTable.teamId, count: sql<number>`count(*)::int` })
    .from(playersTable)
    .groupBy(playersTable.teamId);
  const countMap = new Map(playerCounts.map((r) => [r.teamId, r.count]));

  const leagues = await db.select().from(leaguesTable);
  const leagueMap = new Map(leagues.map((l) => [l.id, l]));

  return res.json(teams.map((t) => ({
    ...t,
    playerCount: countMap.get(t.id) ?? 0,
    leagueName: t.leagueId ? (leagueMap.get(t.leagueId)?.name ?? null) : null,
  })));
});

router.get("/teams/:teamId", async (req, res) => {
  const teamId = parseInt(req.params.teamId);
  if (isNaN(teamId)) return res.status(400).json({ error: "Invalid team ID" });

  const [team] = await db.select().from(teamsTable).where(eq(teamsTable.id, teamId)).limit(1);
  if (!team) return res.status(404).json({ error: "Team not found" });

  const players = await db.select().from(playersTable).where(eq(playersTable.teamId, teamId)).orderBy(playersTable.rating);

  const recentMatchesRaw = await db.select().from(matchesTable)
    .where(sql`(${matchesTable.homeTeamId} = ${teamId} OR ${matchesTable.awayTeamId} = ${teamId}) AND ${matchesTable.status} = 'finished'`)
    .orderBy(sql`${matchesTable.scheduledAt} DESC`)
    .limit(5);

  const teamIds = [...new Set([...recentMatchesRaw.map((m) => m.homeTeamId), ...recentMatchesRaw.map((m) => m.awayTeamId)])];
  const relatedTeams = teamIds.length > 0
    ? await db.select().from(teamsTable).where(sql`${teamsTable.id} = ANY(${teamIds})`)
    : [];
  const teamMap = new Map(relatedTeams.map((t) => [t.id, t]));

  const leagues = team.leagueId
    ? await db.select().from(leaguesTable).where(eq(leaguesTable.id, team.leagueId)).limit(1)
    : [];

  return res.json({
    ...team,
    leagueName: leagues[0]?.name ?? null,
    players: players.map(formatPlayer),
    recentMatches: recentMatchesRaw.map((m) => formatMatch(m, teamMap, leagues[0]?.name ?? "")),
  });
});

router.get("/teams/:teamId/players", async (req, res) => {
  const teamId = parseInt(req.params.teamId);
  if (isNaN(teamId)) return res.status(400).json({ error: "Invalid team ID" });

  const [team] = await db.select().from(teamsTable).where(eq(teamsTable.id, teamId)).limit(1);
  if (!team) return res.status(404).json({ error: "Team not found" });

  const players = await db.select().from(playersTable)
    .where(eq(playersTable.teamId, teamId))
    .orderBy(sql`${playersTable.rating} DESC`);

  return res.json(players.map((p) => formatPlayer(p, team.name)));
});

function formatPlayer(p: typeof playersTable.$inferSelect, teamName?: string) {
  return {
    id: p.id,
    name: p.name,
    displayName: p.displayName,
    nationality: p.nationality,
    position: p.position,
    number: p.number,
    age: p.age,
    teamId: p.teamId,
    teamName: teamName ?? "",
    rating: p.rating,
    pace: p.pace,
    shooting: p.shooting,
    passing: p.passing,
    dribbling: p.dribbling,
    defending: p.defending,
    physical: p.physical,
    goals: p.goals,
    assists: p.assists,
    matchesPlayed: p.matchesPlayed,
    avatarUrl: p.avatarUrl,
  };
}

export { formatPlayer };
export default router;
