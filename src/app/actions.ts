"use server";

import { db } from "@/utils/db";
import { drawing, members } from "@/utils/schemas";
import { eq, or } from "drizzle-orm";
import { headers } from "next/headers";

export async function getDraws() {
  const draws = await db.query.drawing.findMany({
    columns: { ranking: true, prize: true, clientUid: true },
  });

  return draws;
}

export async function getMyDrawing(clientUid: string) {
  const forwardedFor = (await headers()).get("x-forwarded-for");
  const ip = forwardedFor ? forwardedFor.split(",")[0] : null;
  console.log({ clientUid, ip });

  const [myDrawing] = await db
    .select()
    .from(drawing)
    .where(eq(drawing.clientUid, clientUid))
    .leftJoin(members, eq(drawing.studentNumber, members.studentNumber));

  if (!myDrawing) return null;

  return {
    ...myDrawing["2025-1-drawing"],
    member: myDrawing.members,
  };
}

/** @return null if no draw item remaining */
export async function drawItem(clientUid: string, studentNumber: string) {
  const forwardedFor = (await headers()).get("x-forwarded-for");
  const ip = forwardedFor ? forwardedFor.split(",")[0] : null;

  console.log({ clientUid, ip, studentNumber });

  // check exist drawing
  const [existDrawing] = await db
    .select()
    .from(drawing)
    .where(
      or(
        eq(drawing.studentNumber, studentNumber),
        eq(drawing.clientUid, clientUid),
        ip ? eq(drawing.ip, ip) : undefined
      )
    )
    .leftJoin(members, eq(drawing.studentNumber, members.studentNumber));

  if (existDrawing)
    return {
      ...existDrawing["2025-1-drawing"],
      member: existDrawing.members,
    };

  const drawRemains = await db.query.drawing.findMany({
    where: (tb, op) => op.isNull(tb.clientUid),
  });
  if (drawRemains.length === 0) return null;

  const randomDraw =
    drawRemains[Math.floor(Math.random() * drawRemains.length)];

  const [updatedDrawing] = await db
    .update(drawing)
    .set({ clientUid, studentNumber, ip })
    .where(eq(drawing.id, randomDraw.id))
    .returning();

  const existMember = await db.query.members.findFirst({
    where: (tb, op) => op.eq(tb.studentNumber, studentNumber),
  });

  return { ...updatedDrawing, member: existMember ?? null };
}

export async function registerStudentNumber(
  clientUid: string,
  studentNumber: string
) {
  const updatedDrawing = await db
    .update(drawing)
    .set({ studentNumber })
    .where(eq(drawing.clientUid, clientUid));

  return updatedDrawing;
}
