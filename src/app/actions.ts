"use server";

import { db } from "@/utils/db";
import { drawing, members } from "@/utils/schemas";
import { eq } from "drizzle-orm";

export async function getDraws() {
  const draws = await db.query.drawing.findMany({
    columns: { ranking: true, prize: true, client_uid: true },
  });

  return draws;
}

export async function getMyDrawing(uuid: string) {
  const [myDrawing] = await db
    .select()
    .from(drawing)
    .where(eq(drawing.client_uid, uuid))
    .leftJoin(members, eq(drawing.studentNumber, members.studentNumber));

  if (!myDrawing) return null;

  return {
    ...myDrawing["2025-1-drawing"],
    member: myDrawing.members,
  };
}

/** @return null if no draw item remaining */
export async function drawItem(uuid: string, studentNumber: string) {
  // check exist drawing
  const [existDrawing] = await db
    .select()
    .from(drawing)
    .where(eq(drawing.studentNumber, studentNumber))
    .leftJoin(members, eq(drawing.studentNumber, members.studentNumber));

  if (existDrawing)
    return {
      ...existDrawing["2025-1-drawing"],
      member: existDrawing.members,
    };

  const drawRemains = await db.query.drawing.findMany({
    where: (tb, op) => op.isNull(tb.client_uid),
  });

  if (drawRemains.length === 0) return null;

  const randomDraw =
    drawRemains[Math.floor(Math.random() * drawRemains.length)];

  const [updatedDrawing] = await db
    .update(drawing)
    .set({ client_uid: uuid, studentNumber })
    .where(eq(drawing.id, randomDraw.id))
    .returning();

  const existMember = await db.query.members.findFirst({
    where: (tb, op) => op.eq(tb.studentNumber, studentNumber),
  });

  return { ...updatedDrawing, member: existMember ?? null };
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
