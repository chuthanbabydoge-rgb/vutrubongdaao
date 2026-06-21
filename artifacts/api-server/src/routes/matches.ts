import { Router } from "express";
import { db } from "@workspace/db";
import { matchesTable, matchEventsTable, teamsTable, leaguesTable, playersTable, standingsTable, usersTable } from "@workspace/db";
import { eq, and, inArray, sql } from "drizzle-orm";
import { formatMatch } from "./leagues";
import { parseToken } from "./auth";

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

router.post("/matches/:matchId/play", async (req, res) => {
  // Auth
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Not authenticated" });
  const payload = parseToken(token);
  if (!payload) return res.status(401).json({ error: "Invalid token" });
  const userId = payload.userId;

  const matchId = parseInt(req.params.matchId);
  if (isNaN(matchId)) return res.status(400).json({ error: "Invalid match ID" });

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  if (!user) return res.status(404).json({ error: "User not found" });
  if (!user.position) return res.status(400).json({ error: "Setup your player first at /play/setup" });
  if (user.stamina < 20) return res.status(400).json({ error: "Thể lực quá thấp! Hãy nghỉ ngơi trước khi thi đấu.", code: "LOW_STAMINA" });

  const [match] = await db.select().from(matchesTable).where(eq(matchesTable.id, matchId)).limit(1);
  if (!match) return res.status(404).json({ error: "Match not found" });
  if (match.status === "finished") return res.status(400).json({ error: "Trận đấu đã kết thúc." });

  // Determine which team user plays for (prefer favoriteTeamId, else home)
  const userTeamId = user.favoriteTeamId === match.awayTeamId ? match.awayTeamId : match.homeTeamId;
  const isHomePlayer = userTeamId === match.homeTeamId;

  const homePlayers = await db.select().from(playersTable).where(eq(playersTable.teamId, match.homeTeamId)).limit(11);
  const awayPlayers = await db.select().from(playersTable).where(eq(playersTable.teamId, match.awayTeamId)).limit(11);

  const homeRating = (homePlayers.reduce((s, p) => s + p.rating, 0) / (homePlayers.length || 1));
  const awayRating = (awayPlayers.reduce((s, p) => s + p.rating, 0) / (awayPlayers.length || 1));
  const userOverall = Math.round((user.pace + user.shooting + user.passing + user.dribbling + user.defending + user.physical) / 6);

  // Boost user's team rating slightly
  const boostedHomeRating = isHomePlayer ? homeRating * 0.9 + userOverall * 0.1 + 5 : homeRating + 5;
  const boostedAwayRating = !isHomePlayer ? awayRating * 0.9 + userOverall * 0.1 : awayRating;
  const totalStrength = boostedHomeRating + boostedAwayRating;

  const homeScore = poissonRandom(1.5 * boostedHomeRating / totalStrength);
  const awayScore = poissonRandom(1.5 * boostedAwayRating / totalStrength);

  // --- User performance calculation ---
  const pos = user.position ?? "CM";
  const isAttacker = ["ST", "CF", "CAM", "LW", "RW"].includes(pos);
  const isMidfielder = ["CM", "CDM", "LB", "RB"].includes(pos);
  const isDefender = ["CB", "GK"].includes(pos);

  const shootingFactor = user.shooting / 100;
  const passingFactor = user.passing / 100;

  const userGoalLambda = isAttacker ? 0.8 * shootingFactor : isMidfielder ? 0.35 * shootingFactor : 0.05;
  const userAssistLambda = isAttacker ? 0.4 * passingFactor : isMidfielder ? 0.55 * passingFactor : 0.15 * passingFactor;

  const userGoals = poissonRandom(userGoalLambda);
  const userAssists = Math.min(poissonRandom(userAssistLambda), (isHomePlayer ? homeScore : awayScore) - userGoals);
  const cappedAssists = Math.max(0, userAssists);
  const yellowCard = Math.random() < (user.physical < 55 ? 0.15 : 0.07);
  const minutesPlayed = 90;

  const baseRating = isDefender
    ? 5.5 + (user.defending - 50) / 50 + Math.random() * 0.8
    : isAttacker
    ? 5.5 + userGoals * 0.9 + cappedAssists * 0.5 + Math.random() * 0.8
    : 5.5 + userGoals * 0.8 + cappedAssists * 0.6 + Math.random() * 0.7;
  const matchRating = Math.min(10, Math.max(4.0, parseFloat(baseRating.toFixed(1))));

  // Generate events
  const events: { type: string; minute: number; playerId?: number; playerName?: string; teamId: number; description: string }[] = [];

  // User goal events
  const userName = user.displayName ?? user.username;
  const userGoalMinutes: number[] = [];
  for (let i = 0; i < userGoals; i++) {
    const min = Math.floor(Math.random() * 88) + 1;
    userGoalMinutes.push(min);
    events.push({ type: "goal", minute: min, playerName: userName, teamId: userTeamId, description: `Bàn thắng của ${userName}` });
  }

  // User assist events
  for (let i = 0; i < cappedAssists; i++) {
    const min = Math.floor(Math.random() * 88) + 1;
    events.push({ type: "assist", minute: min, playerName: userName, teamId: userTeamId, description: `Kiến tạo của ${userName}` });
  }

  // Yellow card
  if (yellowCard) {
    events.push({ type: "yellow_card", minute: Math.floor(Math.random() * 88) + 1, playerName: userName, teamId: userTeamId, description: `Thẻ vàng cho ${userName}` });
  }

  // Other player goals
  const teamScored = isHomePlayer ? homeScore : awayScore;
  const otherGoals = Math.max(0, teamScored - userGoals);
  const opponentGoals = isHomePlayer ? awayScore : homeScore;
  const teamPlayers = isHomePlayer ? homePlayers : awayPlayers;
  const oppPlayers = isHomePlayer ? awayPlayers : homePlayers;

  for (let i = 0; i < otherGoals; i++) {
    const p = teamPlayers.filter(x => x.position !== "GK")[Math.floor(Math.random() * teamPlayers.length)];
    if (p) { events.push({ type: "goal", minute: Math.floor(Math.random() * 88) + 1, playerId: p.id, playerName: p.name, teamId: userTeamId, description: `Bàn thắng của ${p.name}` }); }
  }
  for (let i = 0; i < opponentGoals; i++) {
    const p = oppPlayers.filter(x => x.position !== "GK")[Math.floor(Math.random() * oppPlayers.length)];
    if (p) { events.push({ type: "goal", minute: Math.floor(Math.random() * 88) + 1, playerId: p.id, playerName: p.name, teamId: isHomePlayer ? match.awayTeamId : match.homeTeamId, description: `Bàn thắng của ${p.name}` }); }
  }

  // Yellow cards for others (2-4 random)
  const cardCount = Math.floor(Math.random() * 3);
  const allP = [...homePlayers, ...awayPlayers].filter(p => p.position !== "GK");
  for (let i = 0; i < cardCount; i++) {
    const p = allP[Math.floor(Math.random() * allP.length)];
    if (p) { events.push({ type: "yellow_card", minute: Math.floor(Math.random() * 88) + 1, playerId: p.id, playerName: p.name, teamId: homePlayers.includes(p) ? match.homeTeamId : match.awayTeamId, description: `Thẻ vàng cho ${p.name}` }); }
  }

  events.sort((a, b) => a.minute - b.minute);
  if (events.length > 0) await db.insert(matchEventsTable).values(events.map(e => ({ matchId, ...e })));
  await db.update(matchesTable).set({ status: "finished", homeScore, awayScore, minute: 90 }).where(eq(matchesTable.id, matchId));
  await updateStandings(match.leagueId, match.homeTeamId, match.awayTeamId, homeScore, awayScore);

  // --- Commentary key moments ---
  const keyMoments: string[] = [];
  if (userGoals > 0) {
    userGoalMinutes.forEach(min => {
      const lines = [
        `Phút ${min}': ${userName} nhận bóng trong vòng cấm — dứt điểm chính xác! ⚽ GÀN THẮNG!`,
        `Phút ${min}': ${userName} vào bóng sắc bén, bật tường qua trung vệ rồi đệm bóng vào lưới! ⚽`,
        `Phút ${min}': Cú sút của ${userName} làm thủ môn đứng hình — bàn thắng đẹp mắt! ⚽`,
      ];
      keyMoments.push(lines[Math.floor(Math.random() * lines.length)]);
    });
  }
  if (cappedAssists > 0) keyMoments.push(`${userName} có đường kiến tạo hoàn hảo cho đồng đội lập công! 🎯`);
  if (yellowCard) keyMoments.push(`Trọng tài rút thẻ vàng cảnh cáo ${userName} sau tình huống vào bóng mạnh. 🟨`);
  if (userGoals === 0 && cappedAssists === 0 && !isDefender) keyMoments.push(`${userName} cố gắng nhưng chưa tìm được cơ hội tốt hôm nay.`);
  if (isDefender && homeScore + awayScore <= 2) keyMoments.push(`${userName} có màn trình diễn rắn chắc ở hàng thủ, chặn nhiều đợt tấn công nguy hiểm. 🛡️`);
  if (matchRating >= 8.0) keyMoments.push(`Đây là một trong những trận đấu xuất sắc nhất của ${userName} từ trước đến nay! ⭐`);

  // --- Update user stats ---
  const staminaUsed = Math.floor(20 + Math.random() * 15);
  const newStamina = Math.max(0, user.stamina - staminaUsed);
  const xpEarned = 100 + userGoals * 60 + cappedAssists * 35 + Math.round(matchRating * 8);
  const newXp = user.xp + xpEarned;
  const xpPerLevel = 1000;
  const newLevel = Math.floor(newXp / xpPerLevel) + 1;
  const levelUp = newLevel > user.level;

  // Recalculate career rating (rolling average)
  const totalMatches = user.matchesPlayed + 1;
  const newRating = parseFloat(((user.rating * user.matchesPlayed + matchRating) / totalMatches).toFixed(2));

  await db.update(usersTable).set({
    goals: user.goals + userGoals,
    assists: user.assists + cappedAssists,
    matchesPlayed: totalMatches,
    rating: newRating,
    stamina: newStamina,
    xp: newXp,
    level: newLevel,
  }).where(eq(usersTable.id, userId));

  // Return match + performance
  const updatedMatch = await db.select().from(matchesTable).where(eq(matchesTable.id, matchId)).limit(1);
  const insertedEvents = await db.select().from(matchEventsTable).where(eq(matchEventsTable.matchId, matchId)).orderBy(matchEventsTable.minute);
  const { teamMap, leagueMap } = await getTeamAndLeagueMaps([match.homeTeamId, match.awayTeamId], [match.leagueId]);

  return res.json({
    match: {
      ...formatMatch(updatedMatch[0], teamMap, leagueMap.get(match.leagueId)?.name ?? ""),
      events: insertedEvents.map(e => ({ id: e.id, matchId: e.matchId, type: e.type, minute: e.minute, playerId: e.playerId, playerName: e.playerName, teamId: e.teamId, description: e.description })),
    },
    userPerformance: {
      goals: userGoals,
      assists: cappedAssists,
      rating: matchRating,
      minutesPlayed,
      yellowCard,
      xpEarned,
      levelUp,
      staminaUsed,
      newStamina,
      newXp,
      newLevel,
      keyMoments,
    },
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
