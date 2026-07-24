import { relations } from "drizzle-orm";
import {
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

export const makes = sqliteTable("makes", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const vehicleTypes = sqliteTable(
  "vehicle_types",
  {
    id: integer("id").notNull(),

    makeId: integer("make_id")
      .notNull()
      .references(() => makes.id, {
        onDelete: "cascade",
      }),
    name: text("name").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.id, table.makeId] }),
    index("vehicle_types_make_id_idx").on(table.makeId),
  ],
);

export const ingestionRuns = sqliteTable("ingestion_runs", {
  id: integer("id").primaryKey({
    autoIncrement: true,
  }),

  ingestedAt: text("ingested_at").notNull(),
});

export const makesRelations = relations(makes, ({ many }) => ({
  vehicleTypes: many(vehicleTypes),
}));

export const vehicleTypesRelations = relations(vehicleTypes, ({ one }) => ({
  make: one(makes, {
    fields: [vehicleTypes.makeId],
    references: [makes.id],
  }),
}));

export type MakeRow = typeof makes.$inferSelect;

export type VehicleTypeRow = typeof vehicleTypes.$inferSelect;
