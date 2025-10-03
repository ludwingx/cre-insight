import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/activity-counts?start=2025-08-01T00:00:00.000Z&end=2025-08-07T23:59:59.999Z
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const startStr = searchParams.get("start");
  const endStr = searchParams.get("end");
  if (!startStr || !endStr) {
    return NextResponse.json({ error: "Missing start or end" }, { status: 400 });
  }
  const start = new Date(startStr);
  const end = new Date(endStr);
  const days: { label: string; value: number; date: string }[] = [];
  // Permitir hasta 90 días y devolver siempre todos los días del rango
  const msPerDay = 24 * 60 * 60 * 1000;
  const totalDays = Math.min(90, Math.ceil((end.getTime() - start.getTime()) / msPerDay) + 1);
  for (let i = 0; i < totalDays; ++i) {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    if (day > end) break;
    const label = `${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;
    const isoDate = day.toISOString().slice(0, 10); // YYYY-MM-DD
    const dayStart = new Date(day);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(day);
    dayEnd.setHours(23, 59, 59, 999);
    const value = await prisma.scrap_post.count({
      where: {
        fechapublicacion: { gte: dayStart, lte: dayEnd },
        candidatoid: { gt: 0 },
      },
    });
    days.push({ label, date: isoDate, value });
  }
  return NextResponse.json({ data: days });
}
