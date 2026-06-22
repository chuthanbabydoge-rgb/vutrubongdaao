import type { SportMetadata } from "../../types/common";

/**
 * Tennis — Coming Soon
 *
 * Planned specifications:
 *   - Individual sport (1v1 or doubles 2v2)
 *   - Best of 3 or best of 5 sets
 *   - No draws; tiebreak at 6-6
 *   - Scoring: games → sets → match
 *   - Points system: ranking points per round (no traditional standings)
 *   - Key attributes: serve_speed, forehand, backhand, stamina, mental, net_play
 *
 * To implement: create TennisMatchEngine, TennisRuleEngine,
 * TennisScoringEngine, TennisModule and register with SportRegistry.
 */
export const TENNIS_METADATA: SportMetadata = {
  sportId: "tennis",
  displayName: "Tennis",
  displayNameVi: "Quần Vợt",
  icon: "🎾",
  status: "coming_soon",
  maxParticipants: 1,
  hasTeams: false,
  hasDraw: false,
  scoringUnit: "games",
  matchDurationUnit: "sets",
};
