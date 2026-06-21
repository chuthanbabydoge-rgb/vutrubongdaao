import { pgTable, text, serial, integer, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const playersTable = pgTable("players", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  displayName: text("display_name"),
  nationality: text("nationality").notNull(),
  position: text("position").notNull(), // GK, CB, LB, RB, CDM, CM, CAM, LW, RW, ST, CF
  number: integer("number"),
  age: integer("age"),
  teamId: integer("team_id").notNull(),
  rating: real("rating").notNull().default(70),
  pace: integer("pace").notNull().default(70),
  shooting: integer("shooting").notNull().default(70),
  passing: integer("passing").notNull().default(70),
  dribbling: integer("dribbling").notNull().default(70),
  defending: integer("defending").notNull().default(70),
  physical: integer("physical").notNull().default(70),
  goals: integer("goals").notNull().default(0),
  assists: integer("assists").notNull().default(0),
  matchesPlayed: integer("matches_played").notNull().default(0),
  avatarUrl: text("avatar_url"),
});

export const insertPlayerSchema = createInsertSchema(playersTable).omit({ id: true });
export type InsertPlayer = z.infer<typeof insertPlayerSchema>;
export type Player = typeof playersTable.$inferSelect;
