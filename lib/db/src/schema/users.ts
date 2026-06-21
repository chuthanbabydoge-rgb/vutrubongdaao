import { pgTable, text, serial, integer, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  displayName: text("display_name"),
  avatarUrl: text("avatar_url"),
  favoriteTeamId: integer("favorite_team_id"),
  position: text("position"),
  rating: real("rating").notNull().default(50),
  matchesPlayed: integer("matches_played").notNull().default(0),
  goals: integer("goals").notNull().default(0),
  assists: integer("assists").notNull().default(0),
  // Phase 3.2 — Player Stats
  pace: integer("pace").notNull().default(50),
  shooting: integer("shooting").notNull().default(50),
  passing: integer("passing").notNull().default(50),
  dribbling: integer("dribbling").notNull().default(50),
  defending: integer("defending").notNull().default(50),
  physical: integer("physical").notNull().default(50),
  stamina: integer("stamina").notNull().default(100),
  xp: integer("xp").notNull().default(0),
  level: integer("level").notNull().default(1),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true, createdAt: true, passwordHash: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
