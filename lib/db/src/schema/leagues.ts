import { pgTable, text, serial, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const leaguesTable = pgTable("leagues", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  shortName: text("short_name"),
  region: text("region").notNull(),
  country: text("country"),
  type: text("type").notNull().default("club"), // 'club' | 'national'
  season: text("season").notNull().default("2025/26"),
  logoUrl: text("logo_url"),
  description: text("description"),
  teamCount: integer("team_count").notNull().default(0),
});

export const insertLeagueSchema = createInsertSchema(leaguesTable).omit({ id: true });
export type InsertLeague = z.infer<typeof insertLeagueSchema>;
export type League = typeof leaguesTable.$inferSelect;
