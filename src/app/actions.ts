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

const getIp = async () => {
  const forwardedFor = (await headers()).get("x-forwarded-for");
  const ip = forwardedFor ? forwardedFor.split(",")[0] : null;

  return ip;
};

const whitelist = ["::1", "127.0.0.1"];
const isInWhitelist = (ip: string) => whitelist.includes(ip);

const trackIp = async (ip: string) => {
  const result = await fetch(`https://ipwho.is/${ip}`);
  const geolocation = await result.json();

  return geolocation;
};

export async function getMyDrawing(clientUid: string) {
  const ip = await getIp();
  console.log("getMyDrawing", { clientUid, ip });

  const [myDrawing] = await db
    .select()
    .from(drawing)
    .where(eq(drawing.clientUid, clientUid))
    .leftJoin(
      members,
      or(
        eq(drawing.studentNumber, members.studentNumber),
        eq(drawing.phone, members.phone)
      )
    );

  if (!myDrawing) return null;

  return {
    ...myDrawing["2025-1-drawing"],
    member: myDrawing.members,
  };
}

/** @return null if no draw item remaining */
export async function drawItem(
  clientUid: string,
  { phone, studentNumber }: { phone?: string; studentNumber?: string }
) {
  if (!phone && !studentNumber) return null;
  const ip = await getIp();
  if (ip && !isInWhitelist(ip)) {
    const geolocation = await trackIp(ip);

    console.log("drawItem", {
      clientUid,
      ip,
      phone,
      studentNumber,
      geolocation,
    });

    if (geolocation.success && geolocation.country_code !== "KR") return null;
  }

  // check exist drawing
  const [existDrawing] = await db
    .select()
    .from(drawing)
    .where(
      or(
        eq(drawing.clientUid, clientUid),
        studentNumber ? eq(drawing.studentNumber, studentNumber) : undefined,
        phone ? eq(drawing.phone, phone) : undefined
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
    .set({ clientUid, studentNumber, phone, ip })
    .where(eq(drawing.id, randomDraw.id))
    .returning();

  const existMember = await db.query.members.findFirst({
    where: (tb, op) =>
      op.or(
        studentNumber ? eq(drawing.studentNumber, studentNumber) : undefined,
        phone ? eq(drawing.phone, phone) : undefined
      ),
  });

  return { ...updatedDrawing, member: existMember ?? null };
}
