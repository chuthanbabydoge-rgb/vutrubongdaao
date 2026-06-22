import type { ScoringEngine } from "../../interfaces/scoring-engine";
import type {
  MatchEvent,
  Score,
  StandingRow,
  MatchResult,
  MatchOutcome,
  Participant,
} from "../../types/common";

/**
 * FootballScoringEngine
 * Computes football scores from events, updates standings, and applies
 * the standard 3-point system (W=3, D=1, L=0).
 */
export class FootballScoringEngine implements ScoringEngine {
  readonly sportId = "football";

  calculateScores(events: MatchEvent[], participants: Participant[]): Score[] {
    return participants.map((p) => ({
      participantId: p.id,
      value: events.filter(
        (e) => e.type === "goal" && e.participantId === p.id,
      ).length,
      unit: "goals",
    }));
  }

  updateStandings(standings: StandingRow[], result: MatchResult): StandingRow[] {
    const [homeScore, awayScore] = [result.homeScore, result.awayScore];
    const homeId = result.scores[0]?.participantId;
    const awayId = result.scores[1]?.participantId;
    const homeWon = homeScore > awayScore;
    const draw = homeScore === awayScore;

    return standings.map((row) => {
      const isHome = row.participantId === homeId;
      const isAway = row.participantId === awayId;
      if (!isHome && !isAway) return row;

      const scored = isHome ? homeScore : awayScore;
      const conceded = isHome ? awayScore : homeScore;
      const won = isHome ? homeWon : !homeWon && !draw;
      const lost = isHome ? !homeWon && !draw : homeWon;
      const outcome: MatchOutcome = won ? "win" : draw ? "draw" : "loss";

      return {
        ...row,
        played: row.played + 1,
        won: row.won + (won ? 1 : 0),
        drawn: row.drawn + (draw ? 1 : 0),
        lost: row.lost + (lost ? 1 : 0),
        pointsFor: row.pointsFor + scored,
        pointsAgainst: row.pointsAgainst + conceded,
        points: row.points + this.getPointsForResult(outcome),
      };
    });
  }

  /** Standard football points: Win=3, Draw=1, Loss=0 */
  getPointsForResult(outcome: MatchOutcome): number {
    return outcome === "win" ? 3 : outcome === "draw" ? 1 : 0;
  }

  determineWinner(scores: Score[]): number | undefined {
    if (scores.length < 2) return undefined;
    const [a, b] = scores;
    if (a.value === b.value) return undefined;
    return a.value > b.value ? a.participantId : b.participantId;
  }
}
