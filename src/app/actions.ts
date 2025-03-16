"use server";

import { db } from "@/utils/db";
import { drawing } from "@/utils/schemas";
import { eq } from "drizzle-orm";

export async function getDraws() {
  const draws = await db.query.drawing.findMany({
    columns: { ranking: true, prize: true, client_uid: true },
  });

  return draws;
}

export async function getMyDrawing(uuid: string) {
  const myDrawing = await db.query.drawing.findFirst({
    where: (tb, op) => op.eq(tb.client_uid, uuid),
  });

  return myDrawing ?? null;
}

export async function drawItem(uuid: string) {
  const drawRemains = await db.query.drawing.findMany({
    where: (tb, op) => op.isNull(tb.client_uid),
  });

  if (drawRemains.length === 0) return null;

  const randomDraw =
    drawRemains[Math.floor(Math.random() * drawRemains.length)];

  const [updatedDrawing] = await db
    .update(drawing)
    .set({ client_uid: uuid })
    .where(eq(drawing.id, randomDraw.id))
    .returning();

  return updatedDrawing;
}

export async function registerStudentNumber(
  uuid: string,
  studentNumber: string
) {
  const updatedDrawing = await db
    .update(drawing)
    .set({ studentNumber })
    .where(eq(drawing.client_uid, uuid));

  return updatedDrawing;
}
