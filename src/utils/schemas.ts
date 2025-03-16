import { sql } from "drizzle-orm";
import { pgTable } from "drizzle-orm/pg-core";

export const drawing = pgTable("2025-1-drawing", (col) => ({
  id: col.uuid().primaryKey().defaultRandom(),
  ranking: col.smallint().notNull(),
  prize: col.text().notNull(),
  studentNumber: col.varchar({ length: 256 }),
  client_uid: col.uuid(),
  createdAt: col.timestamp().default(sql`now()`),
}));

export type Drawing = typeof drawing.$inferSelect;
