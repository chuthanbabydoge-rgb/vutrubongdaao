import type { RuleEngine } from "../../interfaces/rule-engine";
import type { MatchContext, MatchEvent, ValidationResult } from "../../types/common";

/** All legal event types in a football match. */
export const FOOTBALL_EVENT_TYPES = [
  "goal",
  "own_goal",
  "assist",
  "penalty",
  "penalty_miss",
  "yellow_card",
  "red_card",
  "substitution",
  "offside",
  "foul",
  "save",
  "var_review",
] as const;

export type FootballEventType = (typeof FOOTBALL_EVENT_TYPES)[number];

/**
 * FootballRuleEngine
 * Encodes official football rules for the Sports Universe simulation.
 */
export class FootballRuleEngine implements RuleEngine {
  readonly sportId = "football";

  validateMatchContext(context: MatchContext): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!context.homeParticipant) {
      errors.push("Home team participant is required.");
    }
    if (!context.awayParticipant) {
      errors.push("Away team participant is required.");
    }
    if (
      context.homeParticipant &&
      context.awayParticipant &&
      context.homeParticipant.id === context.awayParticipant.id
    ) {
      errors.push("Home and away teams must be different.");
    }
    if (context.homeParticipant?.rating < 40) {
      warnings.push("Home team rating is unusually low — result may be unreliable.");
    }
    if (context.awayParticipant?.rating < 40) {
      warnings.push("Away team rating is unusually low — result may be unreliable.");
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  isValidEvent(event: MatchEvent): boolean {
    return (FOOTBALL_EVENT_TYPES as readonly string[]).includes(event.type);
  }

  /** Standard match duration: 90 minutes */
  getMatchDuration(): number {
    return 90;
  }

  getEventTypes(): readonly string[] {
    return FOOTBALL_EVENT_TYPES;
  }

  /** Minimum 7 players per team to start a match (official FIFA rule) */
  getMinParticipantsRequired(): number {
    return 7;
  }
}
