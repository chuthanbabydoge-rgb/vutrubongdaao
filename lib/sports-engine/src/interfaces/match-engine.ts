import type { MatchContext, MatchResult, UserParticipant, UserPerformance } from "../types/common";

/**
 * MatchEngine
 *
 * Responsible for simulating the outcome of a match — scoring, events,
 * and (optionally) user participation. Each sport provides its own
 * implementation with sport-specific probability models and event types.
 *
 * Implementations: FootballMatchEngine
 * Planned:         BasketballMatchEngine, TennisMatchEngine, RacingMatchEngine, BoxingMatchEngine
 */
export interface MatchEngine {
  readonly sportId: string;

  /**
   * Simulate a match between two participants and return the full result.
   * Called by automated match runners (batch simulation, league progression).
   */
  simulate(context: MatchContext): Promise<MatchResult>;

  /**
   * Simulate a match where a Universe main user actively participates.
   * The user's attributes influence the outcome and generate personal stats.
   * Called by the /matches/:id/play route.
   */
  simulateWithUser(
    context: MatchContext,
    user: UserParticipant,
  ): Promise<{ result: MatchResult; performance: UserPerformance }>;
}
