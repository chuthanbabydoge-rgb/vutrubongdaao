import type { SportMetadata, SportStatus } from "../types/common";
import type { MatchEngine } from "./match-engine";
import type { RuleEngine } from "./rule-engine";
import type { ScoringEngine } from "./scoring-engine";

/**
 * SportModule
 *
 * Top-level registration point for a sport within Sports Universe.
 * Each sport (football, basketball, tennis, racing, boxing) exports a singleton
 * implementing this interface and registers it with the SportRegistry.
 *
 * Active implementations:  FootballModule
 * Coming soon:             BasketballModule, TennisModule, RacingModule, BoxingModule
 *
 * Usage:
 *   import { sportRegistry } from '@workspace/sports-engine/registry';
 *   const football = sportRegistry.getOrThrow('football');
 *   const result   = await football.matchEngine.simulate(context);
 */
export interface SportModule {
  /** Stable identifier. Matches SportId union ('football', 'basketball', ...) */
  readonly sportId: string;

  /** English display name shown in UI sport selectors */
  readonly displayName: string;

  /** Vietnamese display name for the primary locale */
  readonly displayNameVi: string;

  /** SemVer implementation version of this sport module */
  readonly version: string;

  /** Lifecycle status — gates access in the UI and API */
  readonly status: SportStatus;

  /** Simulates match outcomes and user participation */
  readonly matchEngine: MatchEngine;

  /** Encodes sport rules and validates match contexts */
  readonly ruleEngine: RuleEngine;

  /** Computes scores, standings, and outcome points */
  readonly scoringEngine: ScoringEngine;

  /** Returns static, human-readable metadata for this sport */
  getMetadata(): SportMetadata;

  /**
   * Returns true when this sport is enabled and can accept new matches.
   * coming_soon modules always return false.
   */
  isAvailable(): boolean;
}
