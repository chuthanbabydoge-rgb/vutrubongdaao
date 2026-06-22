/**
 * @workspace/sports-engine
 *
 * Sports Universe engine layer — interfaces, types, implementations, and registry.
 *
 * Import paths:
 *   '@workspace/sports-engine'            → all public exports (this file)
 *   '@workspace/sports-engine/interfaces' → SportModule, MatchEngine, RuleEngine, ScoringEngine
 *   '@workspace/sports-engine/types'      → common types (MatchContext, MatchResult, ...)
 *   '@workspace/sports-engine/registry'   → sportRegistry singleton
 *   '@workspace/sports-engine/sports/football'    → FootballModule + engines
 *   '@workspace/sports-engine/sports/basketball'  → BASKETBALL_METADATA (coming soon)
 *   '@workspace/sports-engine/sports/tennis'      → TENNIS_METADATA     (coming soon)
 *   '@workspace/sports-engine/sports/racing'      → RACING_METADATA     (coming soon)
 *   '@workspace/sports-engine/sports/boxing'      → BOXING_METADATA     (coming soon)
 */

// ── Interfaces ────────────────────────────────────────────────────────────────
export type { SportModule } from "./interfaces/sport-module";
export type { MatchEngine } from "./interfaces/match-engine";
export type { RuleEngine } from "./interfaces/rule-engine";
export type { ScoringEngine } from "./interfaces/scoring-engine";

// ── Common types ──────────────────────────────────────────────────────────────
export type {
  SportId,
  SportStatus,
  AchievementTier,
  MatchOutcome,
  Participant,
  UserParticipant,
  MatchContext,
  MatchEvent,
  Score,
  MatchResult,
  UserPerformance,
  StandingRow,
  ValidationResult,
  SportMetadata,
} from "./types/common";

// ── Registry ──────────────────────────────────────────────────────────────────
export { sportRegistry } from "./registry/sport-registry";

// ── Football (active) ─────────────────────────────────────────────────────────
export { FootballModule } from "./sports/football/football-module";
export { FootballMatchEngine } from "./sports/football/football-match-engine";
export { FootballRuleEngine, FOOTBALL_EVENT_TYPES } from "./sports/football/football-rule-engine";
export { FootballScoringEngine } from "./sports/football/football-scoring-engine";
export type { FootballEventType } from "./sports/football/football-rule-engine";

// ── Coming soon (metadata stubs) ──────────────────────────────────────────────
export { BASKETBALL_METADATA } from "./sports/basketball";
export { TENNIS_METADATA } from "./sports/tennis";
export { RACING_METADATA } from "./sports/racing";
export { BOXING_METADATA } from "./sports/boxing";
