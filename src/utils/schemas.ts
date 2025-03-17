import { sql } from "drizzle-orm";
import { pgTable } from "drizzle-orm/pg-core";

export const drawing = pgTable("2025-1-drawing", (col) => ({
  id: col.uuid().primaryKey().defaultRandom(),
  ranking: col.smallint().notNull(),
  prize: col.text().notNull(),
  studentNumber: col.varchar({ length: 256 }),
  phone: col.text(),
  clientUid: col.uuid(),
  ip: col.text(),
  createdAt: col
    .timestamp({ withTimezone: true })
    .notNull()
    .default(sql`now()`),
  updatedAt: col
    .timestamp({ withTimezone: true, mode: "string" })
    .$onUpdateFn(() => sql`now()`)
    .notNull(),
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
    .timestamp({ withTimezone: true })
    .array()
    .notNull()
    .$default(() => sql`[now()]`),
  createdAt: col
    .timestamp({ withTimezone: true })
    .notNull()
    .default(sql`now()`),
  updatedAt: col
    .timestamp({ withTimezone: true, mode: "string" })
    .$onUpdateFn(() => sql`now()`)
    .notNull(),
}));

export type Members = typeof members.$inferSelect;
