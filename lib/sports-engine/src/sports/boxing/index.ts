import type { SportMetadata } from "../../types/common";

/**
 * Boxing — Coming Soon
 *
 * Planned specifications:
 *   - Individual fighters (1v1)
 *   - Up to 12 rounds × 3 minutes professional / 3 rounds amateur
 *   - Win by KO, TKO, points decision, or disqualification
 *   - No draws in professional (split/majority decision still has winner)
 *   - Key attributes: power, speed, reach, chin, stamina, technique, footwork
 *   - Events: jab, cross, hook, uppercut, knockdown, corner_stop
 *
 * To implement: create BoxingMatchEngine, BoxingRuleEngine,
 * BoxingScoringEngine, BoxingModule and register with SportRegistry.
 */
export const BOXING_METADATA: SportMetadata = {
  sportId: "boxing",
  displayName: "Boxing",
  displayNameVi: "Quyền Anh",
  icon: "🥊",
  status: "coming_soon",
  maxParticipants: 1,
  hasTeams: false,
  hasDraw: false,
  scoringUnit: "rounds",
  matchDurationUnit: "rounds",
};
