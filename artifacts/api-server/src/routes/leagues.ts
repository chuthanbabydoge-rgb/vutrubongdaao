import { Router } from "express";
import { db } from "@workspace/db";
import { leaguesTable, teamsTable, standingsTable, playersTable, matchesTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";

const router = Router();

router.get("/leagues", async (req, res) => {
  const { region, type } = req.query as { region?: string; type?: string };

  let query = db.select().from(leaguesTable);
  const conditions = [];

  if (region) conditions.push(eq(leaguesTable.region, region));
  if (type) conditions.push(eq(leaguesTable.type, type));

  const leagues = conditions.length > 0
    ? await db.select().from(leaguesTable).where(and(...conditions))
    : await db.select().from(leaguesTable);

  // Get team counts
  const teamCounts = await db
    .select({ leagueId: teamsTable.leagueId, count: sql<number>`count(*)::int` })
    .from(teamsTable)
    .groupBy(teamsTable.leagueId);

  const countMap = new Map(teamCounts.map((r) => [r.leagueId, r.count]));

  return res.json(leagues.map((l) => ({
    ...l,
    teamCount: countMap.get(l.id) ?? 0,
  })));
});

router.get("/leagues/:leagueId", async (req, res) => {
  const leagueId = parseInt(req.params.leagueId);
  if (isNaN(leagueId)) return res.status(400).json({ error: "Invalid league ID" });

  const [league] = await db.select().from(leaguesTable).where(eq(leaguesTable.id, leagueId)).limit(1);
  if (!league) return res.status(404).json({ error: "League not found" });

  const [teamCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(teamsTable)
    .where(eq(teamsTable.leagueId, leagueId));

  return res.json({ ...league, teamCount: teamCount?.count ?? 0 });
});

router.get("/leagues/:leagueId/standings", async (req, res) => {
  const leagueId = parseInt(req.params.leagueId);
  if (isNaN(leagueId)) return res.status(400).json({ error: "Invalid league ID" });

  const standings = await db
    .select({
      standing: standingsTable,
      team: teamsTable,
    })
    .from(standingsTable)
    .innerJoin(teamsTable, eq(standingsTable.teamId, teamsTable.id))
    .where(eq(standingsTable.leagueId, leagueId))
    .orderBy(standingsTable.position);

  return res.json(standings.map(({ standing, team }) => ({
    position: standing.position,
    teamId: team.id,
    teamName: team.name,
    teamLogoUrl: team.logoUrl,
    played: standing.played,
    won: standing.won,
    drawn: standing.drawn,
    lost: standing.lost,
    goalsFor: standing.goalsFor,
    goalsAgainst: standing.goalsAgainst,
    goalDifference: standing.goalsFor - standing.goalsAgainst,
    points: standing.points,
    form: standing.form,
  })));
});

router.get("/leagues/:leagueId/top-scorers", async (req, res) => {
  const leagueId = parseInt(req.params.leagueId);
  if (isNaN(leagueId)) return res.status(400).json({ error: "Invalid league ID" });

  const players = await db
    .select({
      player: playersTable,
      team: teamsTable,
    })
    .from(playersTable)
    .innerJoin(teamsTable, eq(playersTable.teamId, teamsTable.id))
    .where(eq(teamsTable.leagueId, leagueId))
    .orderBy(sql`${playersTable.goals} DESC`)
    .limit(20);

  return res.json(players.map(({ player, team }) => ({
    playerId: player.id,
    playerName: player.name,
    teamId: team.id,
    teamName: team.name,
    nationality: player.nationality,
    position: player.position,
    goals: player.goals,
    assists: player.assists,
    matchesPlayed: player.matchesPlayed,
  })));
});

router.get("/leagues/:leagueId/matches", async (req, res) => {
  const leagueId = parseInt(req.params.leagueId);
  const { status } = req.query as { status?: string };
  if (isNaN(leagueId)) return res.status(400).json({ error: "Invalid league ID" });

  const conditions = [eq(matchesTable.leagueId, leagueId)];
  if (status) conditions.push(eq(matchesTable.status, status));

  const matches = await db.select().from(matchesTable).where(and(...conditions)).orderBy(matchesTable.scheduledAt);

  const teamIds = [...new Set([...matches.map((m) => m.homeTeamId), ...matches.map((m) => m.awayTeamId)])];
  const teams = teamIds.length > 0
    ? await db.select().from(teamsTable).where(sql`${teamsTable.id} = ANY(${teamIds})`)
    : [];
  const teamMap = new Map(teams.map((t) => [t.id, t]));

  const league = await db.select().from(leaguesTable).where(eq(leaguesTable.id, leagueId)).limit(1);

  return res.json(matches.map((m) => formatMatch(m, teamMap, league[0]?.name ?? "")));
});

function formatMatch(m: typeof matchesTable.$inferSelect, teamMap: Map<number, typeof teamsTable.$inferSelect>, leagueName: string) {
  const home = teamMap.get(m.homeTeamId);
  const away = teamMap.get(m.awayTeamId);
  return {
    id: m.id,
    homeTeamId: m.homeTeamId,
    homeTeamName: home?.name ?? "Unknown",
    homeTeamLogoUrl: home?.logoUrl ?? null,
    awayTeamId: m.awayTeamId,
    awayTeamName: away?.name ?? "Unknown",
    awayTeamLogoUrl: away?.logoUrl ?? null,
    leagueId: m.leagueId,
    leagueName,
    status: m.status,
    scheduledAt: m.scheduledAt?.toISOString() ?? "",
    homeScore: m.homeScore,
    awayScore: m.awayScore,
    minute: m.minute,
    venue: m.venue,
  };
}

export { formatMatch };
export default router;
