import type { SportMetadata } from "../../types/common";

/**
 * Basketball — Coming Soon
 *
 * Planned specifications:
 *   - 5 players per team
 *   - 4 quarters × 12 minutes (NBA) or 10 minutes (FIBA)
 *   - No draws; overtime if tied
 *   - Scoring: 2pt field goals, 3pt shots, 1pt free throws
 *   - Points system: Win=2, Loss=0 (no draws)
 *   - Key attributes: height, speed, shooting_2pt, shooting_3pt, defense, rebounding, iq
 *
 * To implement: create BasketballMatchEngine, BasketballRuleEngine,
 * BasketballScoringEngine, BasketballModule and register with SportRegistry.
 */
export const BASKETBALL_METADATA: SportMetadata = {
  sportId: "basketball",
  displayName: "Basketball",
  displayNameVi: "Bóng Rổ",
  icon: "🏀",
  status: "coming_soon",
  maxParticipants: 5,
  hasTeams: true,
  hasDraw: false,
  scoringUnit: "points",
  matchDurationUnit: "quarters",
};
