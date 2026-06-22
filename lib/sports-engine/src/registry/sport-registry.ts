import type { SportModule } from "../interfaces/sport-module";
import type { SportMetadata } from "../types/common";
import { FootballModule } from "../sports/football/football-module";
import { BASKETBALL_METADATA } from "../sports/basketball";
import { TENNIS_METADATA } from "../sports/tennis";
import { RACING_METADATA } from "../sports/racing";
import { BOXING_METADATA } from "../sports/boxing";

/**
 * SportRegistry
 *
 * Central registry for all sports in Sports Universe.
 * Active sport modules are fully registered (engines available).
 * Coming-soon sports are registered as metadata-only stubs.
 *
 * Usage:
 *   import { sportRegistry } from '@workspace/sports-engine/registry';
 *
 *   // Run a simulation
 *   const football = sportRegistry.getOrThrow('football');
 *   const result = await football.matchEngine.simulate(context);
 *
 *   // List all sports for UI sport-picker
 *   const all = sportRegistry.listAll();
 *   // → [{ sportId: 'football', status: 'active', ... }, { sportId: 'basketball', status: 'coming_soon', ... }, ...]
 *
 *   // Add a new sport (call during startup)
 *   sportRegistry.register(new BasketballModule());
 */
class SportRegistry {
  private readonly _modules = new Map<string, SportModule>();
  private readonly _comingSoon = new Map<string, SportMetadata>();

  constructor() {
    // ── Active sports ────────────────────────────────────────────────────────
    this.register(new FootballModule());

    // ── Coming soon (metadata-only stubs) ───────────────────────────────────
    this._comingSoon.set("basketball", BASKETBALL_METADATA);
    this._comingSoon.set("tennis", TENNIS_METADATA);
    this._comingSoon.set("racing", RACING_METADATA);
    this._comingSoon.set("boxing", BOXING_METADATA);
  }

  /**
   * Register an active SportModule.
   * Overwrites any existing registration for the same sportId.
   */
  register(module: SportModule): void {
    this._modules.set(module.sportId, module);
  }

  /**
   * Get an active SportModule by sportId.
   * Returns undefined if the sport is not registered or is coming_soon.
   */
  get(sportId: string): SportModule | undefined {
    return this._modules.get(sportId);
  }

  /**
   * Get an active SportModule by sportId, or throw if not found.
   * Use when you need the module and want an early failure on missing sport.
   */
  getOrThrow(sportId: string): SportModule {
    const module = this._modules.get(sportId);
    if (!module) {
      const isSoon = this._comingSoon.has(sportId);
      throw new Error(
        isSoon
          ? `Sport "${sportId}" is registered but not yet available (coming_soon).`
          : `Sport "${sportId}" is not registered in Sports Universe.`,
      );
    }
    return module;
  }

  /**
   * List all active (available) sport modules.
   */
  listActive(): SportModule[] {
    return [...this._modules.values()].filter((m) => m.isAvailable());
  }

  /**
   * List metadata for ALL sports — active and coming-soon.
   * Use for UI sport-pickers, landing pages, roadmap displays.
   */
  listAll(): SportMetadata[] {
    const active = [...this._modules.values()].map((m) => m.getMetadata());
    const coming = [...this._comingSoon.values()];
    return [...active, ...coming];
  }

  /**
   * Returns true if the sport is registered and available.
   */
  isAvailable(sportId: string): boolean {
    return this._modules.get(sportId)?.isAvailable() ?? false;
  }
}

/** Singleton registry — import this throughout Sports Universe */
export const sportRegistry = new SportRegistry();
