/**
 * Sports Universe — Common Types
 *
 * Shared type definitions used by all sport modules.
 * These types are generic across football, basketball, tennis, racing, boxing, etc.
 *
 * Design principle: no sport-specific fields here. Each sport module may extend
 * these types for its own domain via generics or intersection types.
 */

// ─── Sport Identifiers ───────────────────────────────────────────────────────

/** Known sport IDs. Extend this union as new sports are added to Sports Universe. */
export type SportId =
  | "football"
  | "basketball"
  | "tennis"
  | "racing"
  | "boxing";

/** Lifecycle status of a sport module. */
export type SportStatus = "active" | "beta" | "coming_soon";

/** Achievement rarity tier. */
export type AchievementTier = "bronze" | "silver" | "gold" | "platinum";

/** Outcome of a match from one participant's perspective. */
export type MatchOutcome = "win" | "draw" | "loss";

// ─── Participants ────────────────────────────────────────────────────────────

/**
 * Generic match participant — a team or individual athlete.
 * `attributes` holds sport-specific numeric values (e.g. pace, shooting for
 * football; height, shooting_3pt for basketball).
 */
export interface Participant {
  id: number;
  name: string;
  rating: number;
  attributes: Record<string, number>;
}

/**
 * A Universe main user acting as a participant in a match.
 * `userId`     → Universe main User (external)
 * `teamId`     → which side the user plays for (optional — some sports are individual)
 * `attributes` → sport-specific player attributes from FootballProfile, etc.
 */
export interface UserParticipant {
  userId: number;
  displayName: string;
  position?: string;
  teamId?: number;
  attributes: Record<string, number>;
}

// ─── Match Context ────────────────────────────────────────────────────────────

/**
 * All inputs required to simulate a match.
 * Passed to MatchEngine.simulate() and MatchEngine.simulateWithUser().
 */
export interface MatchContext {
  matchId: number;
  sportId: string;
  homeParticipant: Participant;
  awayParticipant: Participant;
  homeAdvantage: boolean;
  metadata: Record<string, unknown>;
}

// ─── Match Events ─────────────────────────────────────────────────────────────

/**
 * A discrete event that occurred during a match.
 * `timestamp`     → sport-specific time unit (minute for football, quarter for basketball, etc.)
 * `participantId` → which team/fighter/driver the event belongs to
 * `actorId`       → specific player/athlete who triggered the event (optional)
 */
export interface MatchEvent {
  type: string;
  timestamp: number;
  participantId?: number;
  actorId?: number;
  actorName?: string;
  description: string;
  metadata?: Record<string, unknown>;
}

// ─── Scores & Results ────────────────────────────────────────────────────────

/** Score for one participant in a match. */
export interface Score {
  participantId: number;
  value: number;
  /** Scoring unit: 'goals' | 'points' | 'games' | 'rounds' | 'position' */
  unit: string;
}

/** Full result of a simulated match. */
export interface MatchResult {
  matchId: number;
  homeScore: number;
  awayScore: number;
  scores: Score[];
  events: MatchEvent[];
  /** winning participantId; undefined means draw */
  winner?: number;
  /** match duration in sport-specific units (90 for football, 4 for basketball quarters) */
  duration: number;
  metadata: Record<string, unknown>;
}

// ─── User Performance ────────────────────────────────────────────────────────

/**
 * A user's personal statistics from a single match participation.
 * Returned by MatchEngine.simulateWithUser().
 */
export interface UserPerformance {
  userId: number;
  /** Generic score contribution (goals for football, points for basketball, etc.) */
  scoreContribution?: number;
  assists?: number;
  rating: number;
  minutesPlayed?: number;
  staminaUsed: number;
  xpEarned: number;
  levelUp: boolean;
  newLevel: number;
  newXp: number;
  newStamina: number;
  keyMoments: string[];
  metadata: Record<string, unknown>;
}

// ─── Standings ───────────────────────────────────────────────────────────────

/** One row in a league/competition standings table. */
export interface StandingRow {
  participantId: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  pointsFor: number;
  pointsAgainst: number;
  points: number;
}

// ─── Validation ──────────────────────────────────────────────────────────────

/** Output of RuleEngine.validateMatchContext(). */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings?: string[];
}

// ─── Sport Metadata ──────────────────────────────────────────────────────────

/** Static, human-readable metadata describing a sport. */
export interface SportMetadata {
  sportId: string;
  displayName: string;
  displayNameVi: string;
  icon: string;
  status: SportStatus;
  /** Max participants per side (11 football, 5 basketball, 1 tennis/boxing) */
  maxParticipants: number;
  hasTeams: boolean;
  hasDraw: boolean;
  /** e.g. 'goals' | 'points' | 'games' | 'position' */
  scoringUnit: string;
  /** e.g. 'minutes' | 'quarters' | 'sets' | 'laps' | 'rounds' */
  matchDurationUnit: string;
}
