import { Router } from "express";
import { db } from "@workspace/db";
import { leaguesTable, teamsTable, playersTable, matchesTable, usersTable } from "@workspace/db";
import { eq, inArray, sql } from "drizzle-orm";
import { formatMatch } from "./leagues";

const router = Router();

router.get("/stats/overview", async (req, res) => {
  const [leagueCount] = await db.select({ count: sql<number>`count(*)::int` }).from(leaguesTable);
  const [teamCount] = await db.select({ count: sql<number>`count(*)::int` }).from(teamsTable);
  const [playerCount] = await db.select({ count: sql<number>`count(*)::int` }).from(playersTable);
  const [matchCount] = await db.select({ count: sql<number>`count(*)::int` }).from(matchesTable);
  const [liveCount] = await db.select({ count: sql<number>`count(*)::int` }).from(matchesTable).where(eq(matchesTable.status, "live"));
  const [userCount] = await db.select({ count: sql<number>`count(*)::int` }).from(usersTable);

  const topLeague = await db.select({ name: leaguesTable.name }).from(leaguesTable).limit(1);
  const topTeam = await db.select({ name: teamsTable.name }).from(teamsTable)
    .orderBy(sql`(SELECT sum(p.rating) FROM players p WHERE p.team_id = teams.id) DESC`)
    .limit(1);

  return res.json({
    totalLeagues: leagueCount?.count ?? 0,
    totalTeams: teamCount?.count ?? 0,
    totalPlayers: playerCount?.count ?? 0,
    totalMatches: matchCount?.count ?? 0,
    liveMatches: liveCount?.count ?? 0,
    registeredUsers: userCount?.count ?? 0,
    topLeague: topLeague[0]?.name ?? null,
    topTeam: topTeam[0]?.name ?? null,
  });
});

router.get("/stats/recent-matches", async (req, res) => {
  const matches = await db.select().from(matchesTable)
    .where(eq(matchesTable.status, "finished"))
    .orderBy(sql`${matchesTable.scheduledAt} DESC`)
    .limit(10);

  const teamIds = [...new Set([...matches.map((m) => m.homeTeamId), ...matches.map((m) => m.awayTeamId)])];
  const leagueIds = [...new Set(matches.map((m) => m.leagueId))];

  const teams = teamIds.length > 0 ? await db.select().from(teamsTable).where(inArray(teamsTable.id, teamIds)) : [];
  const leagues = leagueIds.length > 0 ? await db.select().from(leaguesTable).where(inArray(leaguesTable.id, leagueIds)) : [];

  const teamMap = new Map(teams.map((t) => [t.id, t]));
  const leagueMap = new Map(leagues.map((l) => [l.id, l]));

  return res.json(matches.map((m) => formatMatch(m, teamMap, leagueMap.get(m.leagueId)?.name ?? "")));
});

router.get("/stats/live-matches", async (req, res) => {
  const matches = await db.select().from(matchesTable)
    .where(eq(matchesTable.status, "live"))
    .orderBy(matchesTable.scheduledAt)
    .limit(20);

  const teamIds = [...new Set([...matches.map((m) => m.homeTeamId), ...matches.map((m) => m.awayTeamId)])];
  const leagueIds = [...new Set(matches.map((m) => m.leagueId))];

  const teams = teamIds.length > 0 ? await db.select().from(teamsTable).where(inArray(teamsTable.id, teamIds)) : [];
  const leagues = leagueIds.length > 0 ? await db.select().from(leaguesTable).where(inArray(leaguesTable.id, leagueIds)) : [];

  const teamMap = new Map(teams.map((t) => [t.id, t]));
  const leagueMap = new Map(leagues.map((l) => [l.id, l]));

  return res.json(matches.map((m) => formatMatch(m, teamMap, leagueMap.get(m.leagueId)?.name ?? "")));
});

export default router;
