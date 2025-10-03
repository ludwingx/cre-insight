import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Timezone: America/La_Paz (UTC-4, no DST)
const TZ_OFFSET_MIN = 4 * 60; // minutes

function parseDateYMD(d: string) {
  // Expect YYYY-MM-DD
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return null;
  return d;
}

function localStartUTC(ymd: string): Date {
  // 00:00:00.000 at -04:00 converted to UTC
  return new Date(`${ymd}T00:00:00.000-04:00`);
}
function localEndUTC(ymd: string): Date {
  // 23:59:59.999 at -04:00 converted to UTC
  return new Date(`${ymd}T23:59:59.999-04:00`);
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function ymdInLaPaz(dateUTC: Date): string {
  // Convertir UTC a La Paz (-04:00) y extraer YYYY-MM-DD del día calendario en La Paz
  const laPaz = new Date(dateUTC.getTime() - 4 * 60 * 60 * 1000);
  return laPaz.toISOString().slice(0, 10);
}

// Normaliza URLs para reducir duplicados: quita protocolo, www, query, fragmento, slash final
function normalizeUrl(url?: string | null): string {
  if (!url) return "";
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./i, "").toLowerCase();
    const path = u.pathname.replace(/\/+$/g, ""); // quitar slashes finales
    return `${host}${path}`;
  } catch {
    // fallback simple si no es una URL válida
    return String(url).toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").split(/[?#]/)[0].replace(/\/+$/g, "");
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const desde = parseDateYMD(searchParams.get("desde") || "");
  const hasta = parseDateYMD(searchParams.get("hasta") || "");

  if (!desde || !hasta) {
    return NextResponse.json(
      { error: "Parámetros inválidos. Use desde=YYYY-MM-DD&hasta=YYYY-MM-DD" },
      { status: 400 }
    );
  }

  // Safety cap: limitar el rango máximo a 120 días para evitar OOM
  const startUTC = localStartUTC(desde);
  const endUTC = localEndUTC(hasta);
  const MAX_DAYS = 120;
  const diffDays = Math.floor((endUTC.getTime() - startUTC.getTime()) / (24 * 60 * 60 * 1000)) + 1;
  if (diffDays > MAX_DAYS) {
    return NextResponse.json(
      { error: `Rango demasiado amplio (${diffDays} días). Máximo permitido: ${MAX_DAYS} días.` },
      { status: 400 }
    );
  }

  try {
    // Calcular rango UTC exacto del día calendario en La Paz (-04:00)

    const posts = await prisma.scrap_post.findMany({
      where: {
        fechapublicacion: {
          gte: startUTC,
          lte: endUTC,
        },
        // Evita filas con candidatoid nulo/0 que inflan conteos y causan errores en prod
        candidatoid: { gt: 0 },
      },
      select: { id: true, fechapublicacion: true, posturl: true, redsocial: true },
      orderBy: { fechapublicacion: "asc" },
    });

    // Construir el mapa de fechas usando día calendario en America/La_Paz
    const result: { date: string; facebook: number; instagram: number; tiktok: number }[] = [];
    // Helper para avanzar un día en La Paz y obtener YYYY-MM-DD
    const nextYmd = (ymd: string) => ymdInLaPaz(addDays(localStartUTC(ymd), 1));
    let cursor = desde;
    while (true) {
      result.push({ date: cursor, facebook: 0, instagram: 0, tiktok: 0 });
      if (cursor === hasta) break;
      cursor = nextYmd(cursor);
    }

    // Aggregate con deduplicación por URL de post dentro del mismo día (La Paz) y red
    const indexByDate = new Map(result.map((r, i) => [r.date, i]));
    const seen = new Set<string>(); // clave = `${date}::${normalizedUrl}::${redsocial}`
    for (const p of posts) {
      // Usar fechapublicacion como referencia de fecha visual
      const day = ymdInLaPaz(p.fechapublicacion as Date);
      const idx = indexByDate.get(day);
      if (idx === undefined) continue;
      const normalized = normalizeUrl((p as any).posturl);
      const red = (p as any).redsocial?.toLowerCase() || "otros";
      const k = `${day}::${normalized}::${red}`;
      if (seen.has(k)) continue;
      seen.add(k);
      if (red === "facebook") result[idx].facebook += 1;
      else if (red === "instagram") result[idx].instagram += 1;
      else if (red === "tiktok") result[idx].tiktok += 1;
    }

    return NextResponse.json({ data: result });
  } catch (e) {
    console.error("/api/posts-daily error", e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
