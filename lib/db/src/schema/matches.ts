import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const matchesTable = pgTable("matches", {
  id: serial("id").primaryKey(),
  homeTeamId: integer("home_team_id").notNull(),
  awayTeamId: integer("away_team_id").notNull(),
  leagueId: integer("league_id").notNull(),
  status: text("status").notNull().default("upcoming"), // 'upcoming' | 'live' | 'finished'
  scheduledAt: timestamp("scheduled_at").notNull(),
  homeScore: integer("home_score"),
  awayScore: integer("away_score"),
  minute: integer("minute"),
  venue: text("venue"),
});

export const matchEventsTable = pgTable("match_events", {
  id: serial("id").primaryKey(),
  matchId: integer("match_id").notNull(),
  type: text("type").notNull(), // 'goal' | 'assist' | 'yellow_card' | 'red_card' | 'substitution' | 'penalty' | 'own_goal'
  minute: integer("minute").notNull(),
  playerId: integer("player_id"),
  playerName: text("player_name"),
  teamId: integer("team_id"),
  description: text("description"),
});

export const standingsTable = pgTable("standings", {
  id: serial("id").primaryKey(),
  leagueId: integer("league_id").notNull(),
  teamId: integer("team_id").notNull(),
  position: integer("position").notNull().default(1),
  played: integer("played").notNull().default(0),
  won: integer("won").notNull().default(0),
  drawn: integer("drawn").notNull().default(0),
  lost: integer("lost").notNull().default(0),
  goalsFor: integer("goals_for").notNull().default(0),
  goalsAgainst: integer("goals_against").notNull().default(0),
  points: integer("points").notNull().default(0),
  form: text("form"), // e.g. "WWDLW"
});

export const insertMatchSchema = createInsertSchema(matchesTable).omit({ id: true });
export type InsertMatch = z.infer<typeof insertMatchSchema>;
export type Match = typeof matchesTable.$inferSelect;
export type MatchEvent = typeof matchEventsTable.$inferSelect;
export type Standing = typeof standingsTable.$inferSelect;
