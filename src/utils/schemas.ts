import { sql } from "drizzle-orm";
import { pgTable } from "drizzle-orm/pg-core";

export const drawing = pgTable("2025-1-drawing", (col) => ({
  id: col.uuid().primaryKey().defaultRandom(),
  ranking: col.smallint().notNull(),
  prize: col.text().notNull(),
  studentNumber: col.varchar({ length: 256 }),
  client_uid: col.uuid(),
  createdAt: col
    .timestamp()
    .notNull()
    .default(sql`now()`),
}));

export type Drawing = typeof drawing.$inferSelect;

export const members = pgTable("members", (col) => ({
  id: col.uuid().primaryKey().defaultRandom(),
  name: col.varchar({ length: 256 }).notNull(),
  studentNumber: col.varchar({ length: 256 }).notNull(),
  department: col.varchar({ length: 256 }).notNull(),
  phone: col.varchar({ length: 256 }),
  email: col.text(),
  registered_semester: col
    .timestamp()
    .array()
    .notNull()
    .default(sql`[now()]`),
  createdAt: col
    .timestamp()
    .notNull()
    .default(sql`now()`),
}));

export type Members = typeof members.$inferSelect;
