import type {
  MatchEvent,
  Score,
  StandingRow,
  MatchResult,
  MatchOutcome,
  Participant,
} from "../types/common";

/**
 * ScoringEngine
 *
 * Responsible for computing scores from events, updating standings tables,
 * and converting match outcomes to competition points.
 *
 * Implementations: FootballScoringEngine
 * Planned:         BasketballScoringEngine, TennisScoringEngine, RacingScoringEngine, BoxingScoringEngine
 */
export interface ScoringEngine {
  readonly sportId: string;

  /**
   * Compute the score for each participant from a list of match events.
   * e.g. counts 'goal' events per team in football,
   *      sums '2pt' and '3pt' events per team in basketball.
   */
  calculateScores(events: MatchEvent[], participants: Participant[]): Score[];

  /**
   * Apply a finished match result to a set of standing rows.
   * Returns updated rows (immutable — does not mutate inputs).
   */
  updateStandings(standings: StandingRow[], result: MatchResult): StandingRow[];

  /**
   * Points awarded in the competition table for a given match outcome.
   * e.g. 3/1/0 (win/draw/loss) for football, 2/0/0 for basketball (no draws).
   */
  getPointsForResult(outcome: MatchOutcome): number;

  /**
   * Determine the winning participant from a set of scores.
   * Returns undefined when the match is a draw.
   */
  determineWinner(scores: Score[]): number | undefined;
}
