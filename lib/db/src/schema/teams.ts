import { pgTable, text, serial, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const teamsTable = pgTable("teams", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  shortName: text("short_name"),
  region: text("region").notNull(),
  country: text("country").notNull(),
  type: text("type").notNull().default("club"), // 'club' | 'national'
  logoUrl: text("logo_url"),
  stadiumName: text("stadium_name"),
  founded: integer("founded"),
  primaryColor: text("primary_color"),
  secondaryColor: text("secondary_color"),
  leagueId: integer("league_id"),
});

export const insertTeamSchema = createInsertSchema(teamsTable).omit({ id: true });
export type InsertTeam = z.infer<typeof insertTeamSchema>;
export type Team = typeof teamsTable.$inferSelect;
