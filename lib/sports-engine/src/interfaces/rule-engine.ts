import type { MatchContext, MatchEvent, ValidationResult } from "../types/common";

/**
 * RuleEngine
 *
 * Encodes the official rules of a sport: what constitutes a valid match,
 * which event types are legal, match duration, and participation requirements.
 *
 * Implementations: FootballRuleEngine
 * Planned:         BasketballRuleEngine, TennisRuleEngine, RacingRuleEngine, BoxingRuleEngine
 */
export interface RuleEngine {
  readonly sportId: string;

  /**
   * Validate that a MatchContext is legal for this sport before simulation.
   * Returns a ValidationResult with all errors and warnings found.
   */
  validateMatchContext(context: MatchContext): ValidationResult;

  /**
   * Check whether a given event type is valid for this sport.
   * Used to filter/reject events from external sources or user input.
   */
  isValidEvent(event: MatchEvent): boolean;

  /**
   * Standard match duration in sport-specific units.
   * e.g. 90 (minutes) for football, 4 (quarters) for basketball,
   *      3 (sets) for tennis, 60 (laps) for racing, 12 (rounds) for boxing.
   */
  getMatchDuration(): number;

  /**
   * All valid event type keys for this sport.
   * e.g. ['goal', 'yellow_card', 'red_card', ...] for football.
   */
  getEventTypes(): readonly string[];

  /**
   * Minimum number of participants required per side to start a match.
   * e.g. 7 for football, 5 for basketball, 1 for tennis/boxing.
   */
  getMinParticipantsRequired(): number;
}
