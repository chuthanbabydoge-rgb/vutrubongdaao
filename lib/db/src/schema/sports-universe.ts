/**
 * Sports Universe — Module Schema
 *
 * Sports Universe is a MODULE within the larger AI Universe platform.
 *
 * GLOBAL ENTITIES (owned by Universe main — never duplicated here):
 *   User        → referenced by `user_id: integer` (no FK — external system)
 *   Avatar      → referenced by `avatar_id: text` (UUID from Universe main Avatar service)
 *   Wallet      → referenced by `wallet_id: text` (UUID from Universe main Wallet service)
 *   Inventory   → referenced by `inventory_id: text` (UUID from Universe main Inventory service)
 *   SocialGraph → referenced implicitly via `user_id`
 *
 * SPORTS UNIVERSE ENTITIES (owned here):
 *   SportsProfile       — universal sports identity per user
 *   SportStatistics     — aggregate per-sport stats per user
 *   SportAchievements   — unlocked achievements per user per sport
 *   FootballProfile     — football-specific player profile (refs userId + avatarId)
 *   FootballLeague      — football competition (clean, future-ready)
 *   FootballTeam        — football club or national team (clean, future-ready)
 *   FootballMatch       — football match record (clean, future-ready)
 */

import {
  pgTable,
  text,
  serial,
  integer,
  real,
  timestamp,
  jsonb,
  unique,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

// ═══════════════════════════════════════════════════════════════════════════════
// LAYER 1 — UNIVERSAL SPORTS MODULE
// Sport-agnostic tables. Tie any Universe main user to their Sports Universe
// identity. These tables know NOTHING about football, basketball, etc.
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * SportsProfile
 * One row per Universe main user who has activated Sports Universe.
 * `user_id`   → Universe main User  (no FK — external system)
 * `avatar_id` → Universe main Avatar (no FK — external UUID)
 */
export const sportsProfilesTable = pgTable("sports_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  avatarId: text("avatar_id"),
  displayName: text("display_name"),
  bio: text("bio"),
  country: text("country"),
  activeSports: jsonb("active_sports").$type<string[]>(),
  totalXp: integer("total_xp").notNull().default(0),
  totalLevel: integer("total_level").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * SportStatistics
 * Aggregate performance statistics per user per sport.
 * sport_id values: 'football' | 'basketball' | 'tennis' | 'racing' | 'boxing'
 * Unique on (user_id, sport_id) — one row per user per sport.
 */
export const sportStatisticsTable = pgTable(
  "sport_statistics",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull(),
    sportId: text("sport_id").notNull(),
    matchesPlayed: integer("matches_played").notNull().default(0),
    wins: integer("wins").notNull().default(0),
    losses: integer("losses").notNull().default(0),
    draws: integer("draws").notNull().default(0),
    totalXp: integer("total_xp").notNull().default(0),
    rating: real("rating").notNull().default(5.0),
    level: integer("level").notNull().default(1),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    userSportUnique: unique("sport_stats_user_sport_uq").on(t.userId, t.sportId),
  }),
);

/**
 * SportAchievements
 * Unlockable achievements. Each key is unique per user (cross-sport key space).
 * tier: 'bronze' | 'silver' | 'gold' | 'platinum'
 */
export const sportAchievementsTable = pgTable(
  "sport_achievements",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull(),
    sportId: text("sport_id").notNull(),
    achievementKey: text("achievement_key").notNull(),
    achievementName: text("achievement_name").notNull(),
    description: text("description"),
    tier: text("tier").notNull().default("bronze"),
    xpReward: integer("xp_reward").notNull().default(0),
    unlockedAt: timestamp("unlocked_at").defaultNow().notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  },
  (t) => ({
    userAchievementUnique: unique("sport_achievements_user_key_uq").on(
      t.userId,
      t.achievementKey,
    ),
  }),
);

// ═══════════════════════════════════════════════════════════════════════════════
// LAYER 2 — FOOTBALL MODULE
// Football-specific tables. All reference userId (Universe main user).
// These are the CLEAN future-ready equivalents of the legacy tables.
// Legacy tables (leagues, teams, players, matches) remain untouched for
// backward compatibility with all existing API routes.
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * FootballProfile
 * Football-specific player identity and attributes.
 * `user_id`   → Universe main User  (no FK — external system)
 * `avatar_id` → Universe main Avatar (no FK — external UUID)
 */
export const footballProfilesTable = pgTable("football_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  avatarId: text("avatar_id"),
  position: text("position"),
  preferredFoot: text("preferred_foot").default("right"),
  nationality: text("nationality"),
  favoriteTeamId: integer("favorite_team_id"),
  pace: integer("pace").notNull().default(60),
  shooting: integer("shooting").notNull().default(60),
  passing: integer("passing").notNull().default(60),
  dribbling: integer("dribbling").notNull().default(60),
  defending: integer("defending").notNull().default(60),
  physical: integer("physical").notNull().default(60),
  overallRating: real("overall_rating").notNull().default(60),
  stamina: integer("stamina").notNull().default(100),
  goals: integer("goals").notNull().default(0),
  assists: integer("assists").notNull().default(0),
  matchesPlayed: integer("matches_played").notNull().default(0),
  yellowCards: integer("yellow_cards").notNull().default(0),
  redCards: integer("red_cards").notNull().default(0),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * FootballLeague
 * Clean football competition table (future-ready, separate from legacy `leagues`).
 * status: 'active' | 'completed' | 'upcoming'
 * type:   'club'  | 'national'  | 'cup'
 */
export const footballLeaguesTable = pgTable("football_leagues", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  shortName: text("short_name"),
  region: text("region").notNull(),
  country: text("country"),
  type: text("type").notNull().default("club"),
  season: text("season").notNull().default("2025/26"),
  logoUrl: text("logo_url"),
  description: text("description"),
  teamCount: integer("team_count").notNull().default(0),
  status: text("status").notNull().default("active"),
});

/**
 * FootballTeam
 * Clean football club / national team table (future-ready, separate from legacy `teams`).
 */
export const footballTeamsTable = pgTable("football_teams", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  shortName: text("short_name"),
  region: text("region").notNull(),
  country: text("country").notNull(),
  type: text("type").notNull().default("club"),
  logoUrl: text("logo_url"),
  stadiumName: text("stadium_name"),
  stadiumCapacity: integer("stadium_capacity"),
  founded: integer("founded"),
  primaryColor: text("primary_color"),
  secondaryColor: text("secondary_color"),
  leagueId: integer("league_id"),
  managerName: text("manager_name"),
  description: text("description"),
});

/**
 * FootballMatch
 * Clean football match record (future-ready, separate from legacy `matches`).
 * status: 'upcoming' | 'live' | 'finished' | 'postponed' | 'cancelled'
 */
export const footballMatchesTable = pgTable("football_matches", {
  id: serial("id").primaryKey(),
  homeTeamId: integer("home_team_id").notNull(),
  awayTeamId: integer("away_team_id").notNull(),
  leagueId: integer("league_id").notNull(),
  status: text("status").notNull().default("upcoming"),
  scheduledAt: timestamp("scheduled_at").notNull(),
  homeScore: integer("home_score"),
  awayScore: integer("away_score"),
  minute: integer("minute"),
  venue: text("venue"),
  attendance: integer("attendance"),
  referee: text("referee"),
  season: text("season").default("2025/26"),
});

// ═══════════════════════════════════════════════════════════════════════════════
// INFERRED TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export const insertSportsProfileSchema = createInsertSchema(sportsProfilesTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertSportsProfile = z.infer<typeof insertSportsProfileSchema>;
export type SportsProfile = typeof sportsProfilesTable.$inferSelect;

export const insertSportStatisticsSchema = createInsertSchema(sportStatisticsTable).omit({
  id: true,
  updatedAt: true,
});
export type InsertSportStatistics = z.infer<typeof insertSportStatisticsSchema>;
export type SportStatistics = typeof sportStatisticsTable.$inferSelect;

export const insertSportAchievementSchema = createInsertSchema(sportAchievementsTable).omit({
  id: true,
  unlockedAt: true,
});
export type InsertSportAchievement = z.infer<typeof insertSportAchievementSchema>;
export type SportAchievement = typeof sportAchievementsTable.$inferSelect;

export const insertFootballProfileSchema = createInsertSchema(footballProfilesTable).omit({
  id: true,
  updatedAt: true,
});
export type InsertFootballProfile = z.infer<typeof insertFootballProfileSchema>;
export type FootballProfile = typeof footballProfilesTable.$inferSelect;

export const insertFootballLeagueSchema = createInsertSchema(footballLeaguesTable).omit({
  id: true,
});
export type InsertFootballLeague = z.infer<typeof insertFootballLeagueSchema>;
export type FootballLeague = typeof footballLeaguesTable.$inferSelect;

export const insertFootballTeamSchema = createInsertSchema(footballTeamsTable).omit({
  id: true,
});
export type InsertFootballTeam = z.infer<typeof insertFootballTeamSchema>;
export type FootballTeam = typeof footballTeamsTable.$inferSelect;

export const insertFootballMatchSchema = createInsertSchema(footballMatchesTable).omit({
  id: true,
});
export type InsertFootballMatch = z.infer<typeof insertFootballMatchSchema>;
export type FootballMatch = typeof footballMatchesTable.$inferSelect;
