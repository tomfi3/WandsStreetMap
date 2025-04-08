import { pgTable, text, serial, json, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define the structure of a road highlight
export const roadHighlights = pgTable("road_highlights", {
  id: serial("id").primaryKey(),
  osmId: text("osm_id").notNull(),
  name: text("name").notNull(),
  roadType: text("road_type").notNull(),
  length: real("length").notNull(),
  coordinates: json("coordinates").notNull(),
  createdAt: text("created_at").notNull(),
});

// Schema for inserting a new road highlight
export const insertRoadHighlightSchema = createInsertSchema(roadHighlights).omit({
  id: true,
  createdAt: true,
});

// Schema for road coordinates (array of [lat, lng] points)
export const coordinatesSchema = z.array(
  z.tuple([z.number(), z.number()])
);

// Road type for frontend use
export type Road = {
  id: string;
  osmId: string;
  name: string;
  roadType: string;
  length: number;
  coordinates: [number, number][];
};

export type InsertRoadHighlight = z.infer<typeof insertRoadHighlightSchema>;
export type RoadHighlight = typeof roadHighlights.$inferSelect;
