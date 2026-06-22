import type { SportMetadata } from "../../types/common";

/**
 * Racing — Coming Soon
 *
 * Planned specifications:
 *   - Individual drivers (with optional constructor/team affiliation)
 *   - Variable lap counts per circuit
 *   - No draws; position-based finishing
 *   - Scoring: F1-style points (25-18-15-12-10-8-6-4-2-1) or custom
 *   - Key attributes: acceleration, top_speed, cornering, stamina, car_control, strategy_iq
 *   - Pit stops, safety cars, weather as event modifiers
 *
 * To implement: create RacingMatchEngine, RacingRuleEngine,
 * RacingScoringEngine, RacingModule and register with SportRegistry.
 */
export const RACING_METADATA: SportMetadata = {
  sportId: "racing",
  displayName: "Racing",
  displayNameVi: "Đua Xe",
  icon: "🏎️",
  status: "coming_soon",
  maxParticipants: 1,
  hasTeams: false,
  hasDraw: false,
  scoringUnit: "position",
  matchDurationUnit: "laps",
};
