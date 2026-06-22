import type { SportModule } from "../../interfaces/sport-module";
import type { SportMetadata } from "../../types/common";
import { FootballMatchEngine } from "./football-match-engine";
import { FootballRuleEngine } from "./football-rule-engine";
import { FootballScoringEngine } from "./football-scoring-engine";

/**
 * FootballModule
 *
 * The active implementation of SportModule for football.
 * Registered with SportRegistry as the first sport in Sports Universe.
 *
 * Engines are instantiated once and shared (stateless — safe as singletons).
 */
export class FootballModule implements SportModule {
  readonly sportId = "football";
  readonly displayName = "Football";
  readonly displayNameVi = "Bóng Đá";
  readonly version = "1.0.0";
  readonly status = "active" as const;

  readonly matchEngine = new FootballMatchEngine();
  readonly ruleEngine = new FootballRuleEngine();
  readonly scoringEngine = new FootballScoringEngine();

  getMetadata(): SportMetadata {
    return {
      sportId: "football",
      displayName: "Football",
      displayNameVi: "Bóng Đá",
      icon: "⚽",
      status: "active",
      maxParticipants: 11,
      hasTeams: true,
      hasDraw: true,
      scoringUnit: "goals",
      matchDurationUnit: "minutes",
    };
  }

  isAvailable(): boolean {
    return true;
  }
}
