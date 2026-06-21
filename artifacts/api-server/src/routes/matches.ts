import { Router } from "express";
import { db } from "@workspace/db";
import { matchesTable, matchEventsTable, teamsTable, leaguesTable, playersTable, standingsTable } from "@workspace/db";
import { eq, and, inArray, sql } from "drizzle-orm";
import { formatMatch } from "./leagues";

const router = Router();

async function getTeamAndLeagueMaps(teamIds: number[], leagueIds: number[]) {
  const teams = teamIds.length > 0
    ? await db.select().from(teamsTable).where(inArray(teamsTable.id, teamIds))
    : [];
  const leagues = leagueIds.length > 0
    ? await db.select().from(leaguesTable).where(inArray(leaguesTable.id, leagueIds))
    : [];
  return {
    teamMap: new Map(teams.map((t) => [t.id, t])),
    leagueMap: new Map(leagues.map((l) => [l.id, l])),
  };
}

router.get("/matches", async (req, res) => {
  const { status, teamId } = req.query as { status?: string; teamId?: string };

  let matches;
  if (teamId) {
    const tid = parseInt(teamId);
    const conditions = [sql`(${matchesTable.homeTeamId} = ${tid} OR ${matchesTable.awayTeamId} = ${tid})`];
    if (status) conditions.push(eq(matchesTable.status, status));
    matches = await db.select().from(matchesTable).where(and(...conditions)).orderBy(matchesTable.scheduledAt).limit(50);
  } else if (status) {
    matches = await db.select().from(matchesTable).where(eq(matchesTable.status, status)).orderBy(matchesTable.scheduledAt).limit(50);
  } else {
    matches = await db.select().from(matchesTable).orderBy(matchesTable.scheduledAt).limit(50);
  }

  const teamIds = [...new Set([...matches.map((m) => m.homeTeamId), ...matches.map((m) => m.awayTeamId)])];
  const leagueIds = [...new Set(matches.map((m) => m.leagueId))];
  const { teamMap, leagueMap } = await getTeamAndLeagueMaps(teamIds, leagueIds);

  return res.json(matches.map((m) => formatMatch(m, teamMap, leagueMap.get(m.leagueId)?.name ?? "")));
});

router.post("/matches", async (req, res) => {
  const { homeTeamId, awayTeamId, leagueId, scheduledAt } = req.body;
  if (!homeTeamId || !awayTeamId || !leagueId || !scheduledAt) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const [match] = await db.insert(matchesTable).values({
    homeTeamId,
    awayTeamId,
    leagueId,
    status: "upcoming",
    scheduledAt: new Date(scheduledAt),
  }).returning();

  const teamIds = [match.homeTeamId, match.awayTeamId];
  const { teamMap, leagueMap } = await getTeamAndLeagueMaps(teamIds, [match.leagueId]);
  return res.status(201).json(formatMatch(match, teamMap, leagueMap.get(match.leagueId)?.name ?? ""));
});

router.get("/matches/:matchId", async (req, res) => {
  const matchId = parseInt(req.params.matchId);
  if (isNaN(matchId)) return res.status(400).json({ error: "Invalid match ID" });

  const [match] = await db.select().from(matchesTable).where(eq(matchesTable.id, matchId)).limit(1);
  if (!match) return res.status(404).json({ error: "Match not found" });

  const events = await db.select().from(matchEventsTable).where(eq(matchEventsTable.matchId, matchId)).orderBy(matchEventsTable.minute);
  const { teamMap, leagueMap } = await getTeamAndLeagueMaps([match.homeTeamId, match.awayTeamId], [match.leagueId]);

  return res.json({
    ...formatMatch(match, teamMap, leagueMap.get(match.leagueId)?.name ?? ""),
    events: events.map((e) => ({
      id: e.id,
      matchId: e.matchId,
      type: e.type,
      minute: e.minute,
      playerId: e.playerId,
      playerName: e.playerName,
      teamId: e.teamId,
      description: e.description,
    })),
  });
});

router.post("/matches/:matchId/simulate", async (req, res) => {
  const matchId = parseInt(req.params.matchId);
  if (isNaN(matchId)) return res.status(400).json({ error: "Invalid match ID" });

  const [match] = await db.select().from(matchesTable).where(eq(matchesTable.id, matchId)).limit(1);
  if (!match) return res.status(404).json({ error: "Match not found" });
  if (match.status === "finished") return res.status(400).json({ error: "Match already finished" });

  // Get teams and their players
  const homePlayers = await db.select().from(playersTable).where(eq(playersTable.teamId, match.homeTeamId)).limit(11);
  const awayPlayers = await db.select().from(playersTable).where(eq(playersTable.teamId, match.awayTeamId)).limit(11);

  // Simple simulation based on team strength
  const homeRating = homePlayers.reduce((sum, p) => sum + p.rating, 0) / (homePlayers.length || 1);
  const awayRating = awayPlayers.reduce((sum, p) => sum + p.rating, 0) / (awayPlayers.length || 1);

  const homeAdvantage = 5;
  const homeStrength = homeRating + homeAdvantage;
  const totalStrength = homeStrength + awayRating;

  const homeExpectedGoals = 1.5 * (homeStrength / totalStrength);
  const awayExpectedGoals = 1.5 * (awayRating / totalStrength);

  const homeScore = poissonRandom(homeExpectedGoals);
  const awayScore = poissonRandom(awayExpectedGoals);

  // Generate events
  const events: { type: string; minute: number; playerId?: number; playerName?: string; teamId: number; description: string }[] = [];
  const allGoals = homeScore + awayScore;

  for (let i = 0; i < allGoals; i++) {
    const minute = Math.floor(Math.random() * 90) + 1;
    const isHome = i < homeScore;
    const scorers = isHome ? homePlayers.filter((p) => p.position !== "GK") : awayPlayers.filter((p) => p.position !== "GK");
    const scorer = scorers[Math.floor(Math.random() * scorers.length)];
    if (scorer) {
      events.push({
        type: "goal",
        minute,
        playerId: scorer.id,
        playerName: scorer.name,
        teamId: isHome ? match.homeTeamId : match.awayTeamId,
        description: `Goal by ${scorer.name}`,
      });

      // Update player goals
      await db.update(playersTable).set({ goals: scorer.goals + 1, matchesPlayed: scorer.matchesPlayed + 1 }).where(eq(playersTable.id, scorer.id));
    }
  }

  // Yellow cards
  const cardCount = Math.floor(Math.random() * 4);
  const allPlayers = [...homePlayers, ...awayPlayers].filter((p) => p.position !== "GK");
  for (let i = 0; i < cardCount; i++) {
    const player = allPlayers[Math.floor(Math.random() * allPlayers.length)];
    if (player) {
      events.push({
        type: "yellow_card",
        minute: Math.floor(Math.random() * 90) + 1,
        playerId: player.id,
        playerName: player.name,
        teamId: homePlayers.includes(player) ? match.homeTeamId : match.awayTeamId,
        description: `Yellow card for ${player.name}`,
      });
    }
  }

  events.sort((a, b) => a.minute - b.minute);

  // Insert events
  if (events.length > 0) {
    await db.insert(matchEventsTable).values(events.map((e) => ({ matchId, ...e })));
  }

  // Update match
  await db.update(matchesTable).set({ status: "finished", homeScore, awayScore, minute: 90 }).where(eq(matchesTable.id, matchId));

  // Update standings
  await updateStandings(match.leagueId, match.homeTeamId, match.awayTeamId, homeScore, awayScore);

  const updatedMatch = await db.select().from(matchesTable).where(eq(matchesTable.id, matchId)).limit(1);
  const insertedEvents = await db.select().from(matchEventsTable).where(eq(matchEventsTable.matchId, matchId)).orderBy(matchEventsTable.minute);
  const { teamMap, leagueMap } = await getTeamAndLeagueMaps([match.homeTeamId, match.awayTeamId], [match.leagueId]);

  return res.json({
    ...formatMatch(updatedMatch[0], teamMap, leagueMap.get(match.leagueId)?.name ?? ""),
    events: insertedEvents.map((e) => ({
      id: e.id, matchId: e.matchId, type: e.type, minute: e.minute,
      playerId: e.playerId, playerName: e.playerName, teamId: e.teamId, description: e.description,
    })),
  });
});

async function updateStandings(leagueId: number, homeTeamId: number, awayTeamId: number, homeScore: number, awayScore: number) {
  const homeRow = await db.select().from(standingsTable)
    .where(and(eq(standingsTable.leagueId, leagueId), eq(standingsTable.teamId, homeTeamId))).limit(1);
  const awayRow = await db.select().from(standingsTable)
    .where(and(eq(standingsTable.leagueId, leagueId), eq(standingsTable.teamId, awayTeamId))).limit(1);

  if (homeRow.length && awayRow.length) {
    const h = homeRow[0];
    const a = awayRow[0];
    const homeWon = homeScore > awayScore;
    const draw = homeScore === awayScore;

    await db.update(standingsTable).set({
      played: h.played + 1,
      won: h.won + (homeWon ? 1 : 0),
      drawn: h.drawn + (draw ? 1 : 0),
      lost: h.lost + (!homeWon && !draw ? 1 : 0),
      goalsFor: h.goalsFor + homeScore,
      goalsAgainst: h.goalsAgainst + awayScore,
      points: h.points + (homeWon ? 3 : draw ? 1 : 0),
    }).where(eq(standingsTable.id, h.id));

    await db.update(standingsTable).set({
      played: a.played + 1,
      won: a.won + (!homeWon && !draw ? 1 : 0),
      drawn: a.drawn + (draw ? 1 : 0),
      lost: a.lost + (homeWon ? 1 : 0),
      goalsFor: a.goalsFor + awayScore,
      goalsAgainst: a.goalsAgainst + homeScore,
      points: a.points + (!homeWon && !draw ? 3 : draw ? 1 : 0),
    }).where(eq(standingsTable.id, a.id));
  }
}

function poissonRandom(lambda: number): number {
  const L = Math.exp(-lambda);
  let k = 0;
  let p = 1;
  do { k++; p *= Math.random(); } while (p > L);
  return k - 1;
}

export default router;
