import type { MatchEngine } from "../../interfaces/match-engine";
import type {
  MatchContext,
  MatchResult,
  MatchEvent,
  UserParticipant,
  UserPerformance,
} from "../../types/common";

/**
 * Poisson-distributed random integer.
 * Same algorithm as the legacy API route — kept consistent for reproducibility.
 */
function poissonRandom(lambda: number): number {
  if (lambda <= 0) return 0;
  const L = Math.exp(-lambda);
  let k = 0;
  let p = 1;
  do {
    k++;
    p *= Math.random();
  } while (p > L);
  return k - 1;
}

/**
 * FootballMatchEngine
 *
 * Implements the Sports Universe MatchEngine interface for football.
 * Uses a Poisson distribution over team ratings to determine scorelines,
 * mirrors the algorithm in the legacy /matches/:id/simulate API route.
 *
 * Does NOT write to the database — that remains the route's responsibility.
 * This class is the pure simulation kernel.
 */
export class FootballMatchEngine implements MatchEngine {
  readonly sportId = "football";

  async simulate(context: MatchContext): Promise<MatchResult> {
    const { homeParticipant, awayParticipant, homeAdvantage, matchId } = context;

    const homeBonus = homeAdvantage ? 5 : 0;
    const homeStrength = homeParticipant.rating + homeBonus;
    const awayStrength = awayParticipant.rating;
    const total = homeStrength + awayStrength;

    const homeScore = poissonRandom(1.5 * (homeStrength / total));
    const awayScore = poissonRandom(1.5 * (awayStrength / total));

    const goalEvents = this._generateGoalEvents(
      homeParticipant.id,
      awayParticipant.id,
      homeScore,
      awayScore,
    );
    const cardEvents = this._generateCardEvents([
      homeParticipant.id,
      awayParticipant.id,
    ]);
    const events = [...goalEvents, ...cardEvents].sort(
      (a, b) => a.timestamp - b.timestamp,
    );

    return {
      matchId,
      homeScore,
      awayScore,
      scores: [
        { participantId: homeParticipant.id, value: homeScore, unit: "goals" },
        { participantId: awayParticipant.id, value: awayScore, unit: "goals" },
      ],
      events,
      winner:
        homeScore > awayScore
          ? homeParticipant.id
          : awayScore > homeScore
            ? awayParticipant.id
            : undefined,
      duration: 90,
      metadata: {},
    };
  }

  async simulateWithUser(
    context: MatchContext,
    user: UserParticipant,
  ): Promise<{ result: MatchResult; performance: UserPerformance }> {
    const { homeParticipant, awayParticipant, matchId } = context;
    const isHomePlayer =
      !user.teamId || user.teamId === homeParticipant.id;

    const attrs = user.attributes;
    const userOverall = Math.round(
      Object.values(attrs).reduce((s, v) => s + v, 0) /
        (Object.keys(attrs).length || 1),
    );

    // Boost the user's team rating slightly
    const homeBase = homeParticipant.rating;
    const awayBase = awayParticipant.rating;
    const boostedHome = isHomePlayer
      ? homeBase * 0.9 + userOverall * 0.1 + 5
      : homeBase + 5;
    const boostedAway = !isHomePlayer
      ? awayBase * 0.9 + userOverall * 0.1
      : awayBase;
    const total = boostedHome + boostedAway;

    const homeScore = poissonRandom(1.5 * (boostedHome / total));
    const awayScore = poissonRandom(1.5 * (boostedAway / total));

    // User's personal performance
    const pos = user.position ?? "CM";
    const isAttacker = ["ST", "CF", "CAM", "LW", "RW"].includes(pos);
    const isMidfielder = ["CM", "CDM", "LB", "RB"].includes(pos);
    const isDefender = ["CB", "GK"].includes(pos);

    const shooting = (attrs.shooting ?? 60) / 100;
    const passing = (attrs.passing ?? 60) / 100;

    const goalLambda = isAttacker
      ? 0.8 * shooting
      : isMidfielder
        ? 0.35 * shooting
        : 0.05;
    const assistLambda = isAttacker
      ? 0.4 * passing
      : isMidfielder
        ? 0.55 * passing
        : 0.15 * passing;

    const userGoals = poissonRandom(goalLambda);
    const rawAssists = poissonRandom(assistLambda);
    const teamGoals = isHomePlayer ? homeScore : awayScore;
    const userAssists = Math.max(0, Math.min(rawAssists, teamGoals - userGoals));
    const yellowCard =
      Math.random() < ((attrs.physical ?? 60) < 55 ? 0.15 : 0.07);

    const baseRating = isDefender
      ? 5.5 + ((attrs.defending ?? 60) - 50) / 50 + Math.random() * 0.8
      : isAttacker
        ? 5.5 + userGoals * 0.9 + userAssists * 0.5 + Math.random() * 0.8
        : 5.5 + userGoals * 0.8 + userAssists * 0.6 + Math.random() * 0.7;
    const matchRating = Math.min(10, Math.max(4.0, parseFloat(baseRating.toFixed(1))));

    const staminaUsed = Math.floor(20 + Math.random() * 15);
    const xpEarned =
      100 + userGoals * 60 + userAssists * 35 + Math.round(matchRating * 8);

    const keyMoments: string[] = [];
    const name = user.displayName;
    if (userGoals > 0) {
      keyMoments.push(
        `⚽ ${name} ghi ${userGoals} bàn thắng — màn trình diễn xuất sắc!`,
      );
    }
    if (userAssists > 0) {
      keyMoments.push(`🎯 ${name} có ${userAssists} đường kiến tạo hoàn hảo!`);
    }
    if (yellowCard) {
      keyMoments.push(`🟨 Thẻ vàng cho ${name} sau pha vào bóng mạnh.`);
    }
    if (userGoals === 0 && userAssists === 0 && !isDefender) {
      keyMoments.push(`${name} cố gắng nhưng chưa tìm được cơ hội tốt hôm nay.`);
    }
    if (isDefender && homeScore + awayScore <= 2) {
      keyMoments.push(`🛡️ ${name} có màn trình diễn rắn chắc ở hàng thủ.`);
    }
    if (matchRating >= 8.0) {
      keyMoments.push(`⭐ Đây là một trong những trận đấu xuất sắc nhất của ${name}!`);
    }

    const result: MatchResult = {
      matchId,
      homeScore,
      awayScore,
      scores: [
        { participantId: homeParticipant.id, value: homeScore, unit: "goals" },
        { participantId: awayParticipant.id, value: awayScore, unit: "goals" },
      ],
      events: [],
      winner:
        homeScore > awayScore
          ? homeParticipant.id
          : awayScore > homeScore
            ? awayParticipant.id
            : undefined,
      duration: 90,
      metadata: {},
    };

    const performance: UserPerformance = {
      userId: user.userId,
      scoreContribution: userGoals,
      assists: userAssists,
      rating: matchRating,
      minutesPlayed: 90,
      staminaUsed,
      xpEarned,
      levelUp: false,
      newLevel: 1,
      newXp: 0,
      newStamina: Math.max(0, (attrs.stamina ?? 100) - staminaUsed),
      keyMoments,
      metadata: { yellowCard },
    };

    return { result, performance };
  }

  private _generateGoalEvents(
    homeId: number,
    awayId: number,
    homeGoals: number,
    awayGoals: number,
  ): MatchEvent[] {
    const events: MatchEvent[] = [];
    for (let i = 0; i < homeGoals; i++) {
      events.push({
        type: "goal",
        timestamp: Math.floor(Math.random() * 90) + 1,
        participantId: homeId,
        description: "Goal",
      });
    }
    for (let i = 0; i < awayGoals; i++) {
      events.push({
        type: "goal",
        timestamp: Math.floor(Math.random() * 90) + 1,
        participantId: awayId,
        description: "Goal",
      });
    }
    return events;
  }

  private _generateCardEvents(participantIds: number[]): MatchEvent[] {
    const count = Math.floor(Math.random() * 4);
    return Array.from({ length: count }, () => {
      const pid =
        participantIds[Math.floor(Math.random() * participantIds.length)];
      return {
        type: "yellow_card",
        timestamp: Math.floor(Math.random() * 90) + 1,
        participantId: pid,
        description: "Yellow card",
      };
    });
  }
}
