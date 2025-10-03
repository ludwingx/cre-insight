import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const departamento = (searchParams.get('departamento') || '').toUpperCase();
  const desde = searchParams.get('desde');
  const hasta = searchParams.get('hasta');

  let fechaInicio: Date | undefined = undefined;
  let fechaFin: Date | undefined = undefined;

  // Ajuste: convertir fechas locales (zona -04:00) a UTC para el filtro
  const LOCAL_OFFSET_MINUTES = 4 * 60; // Bolivia -04:00
  // Helper: yesterday end in La Paz (used as safe upper bound and default end)
  const yesterdayEndLaPaz = () => {
    const now = new Date();
    const laPazNow = new Date(now.getTime() - LOCAL_OFFSET_MINUTES * 60 * 1000);
    const y = laPazNow.getUTCFullYear();
    const m = laPazNow.getUTCMonth();
    const d = laPazNow.getUTCDate();
    // today start at La Paz in UTC
    const todayStartUTC = Date.UTC(y, m, d, 0, 0, 0, 0);
    const yesterday = new Date(todayStartUTC - 24 * 60 * 60 * 1000);
    const yyyy = yesterday.getUTCFullYear();
    const mm = String(yesterday.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(yesterday.getUTCDate()).padStart(2, '0');
    return new Date(`${yyyy}-${mm}-${dd}T23:59:59.999-04:00`);
  };
  const daysAgoStartLaPaz = (days: number) => {
    const end = yesterdayEndLaPaz();
    // move back N-1 days to include N days window
    const startCandidate = new Date(end.getTime() - (days - 1) * 24 * 60 * 60 * 1000);
    const yyyy = startCandidate.getUTCFullYear();
    const mm = String(startCandidate.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(startCandidate.getUTCDate()).padStart(2, '0');
    return new Date(`${yyyy}-${mm}-${dd}T00:00:00.000-04:00`);
  };
  if (desde) {
    const localDesde = new Date(desde + 'T00:00:00-04:00');
    fechaInicio = new Date(localDesde.toISOString()); // UTC
  }
  if (hasta) {
    const localHasta = new Date(hasta + 'T23:59:59.999-04:00');
    fechaFin = new Date(localHasta.toISOString()); // UTC
  }

  // Default a una ventana acotada si no se especifica rango: últimos 30 días (hasta ayer)
  if (!fechaInicio || !fechaFin) {
    const defFin = yesterdayEndLaPaz();
    const defIni = daysAgoStartLaPaz(30);
    if (!fechaInicio) fechaInicio = new Date(defIni.toISOString());
    if (!fechaFin) fechaFin = new Date(defFin.toISOString());
  }

  // Filtro base
  const baseWhere: any = {
    departamento: {
      equals: departamento,
      mode: 'insensitive',
    },
  };
  if (fechaInicio && fechaFin) {
    baseWhere.created_at = {
      gte: fechaInicio,
      lte: fechaFin,
    };
  } else if (fechaInicio) {
    baseWhere.created_at = { gte: fechaInicio };
  } else if (fechaFin) {
    baseWhere.created_at = { lte: fechaFin };
  }

  // Obtener todos los posts
  const allPostsRaw = await prisma.scrap_post.findMany({
    where: baseWhere,
    orderBy: { created_at: 'desc' },
    take: 300,
  });
  const allPosts = allPostsRaw.map(post => ({
    ...post,
    fechapublicacion: post.fechapublicacion || '',
  }));

  // Obtener posts nacionales PRESIDENTE y VICEPRESIDENTE
  const postsNacionalesRaw = await prisma.scrap_post.findMany({
    where: {
      departamento: { equals: 'PAIS', mode: 'insensitive' },
      titularidad: { in: ['PRESIDENTE', 'VICEPRESIDENTE'] },
      ...(baseWhere.created_at ? { created_at: baseWhere.created_at } : {}),
    },
    orderBy: { created_at: 'desc' },
    take: 300,
  });
  const postsNacionales = postsNacionalesRaw.map(post => ({
    ...post,
    fechapublicacion: post.fechapublicacion || '',
  }));

  // Sin actividad en RRSS
  // Ajuste: usar el campo correcto de fecha para sin_publicacion (ej: fecha_scrap)
  let sinActividadWhere: any = {
    OR: [
      {
        departamento: {
          equals: departamento,
          mode: 'insensitive',
        }
      },
      {
        departamento: {
          equals: 'PAIS',
          mode: 'insensitive',
        }
      }
    ]
  };

  // Eliminado el bloque de sinActividadRegistros y toda referencia a sin_publicacion
  return NextResponse.json({
    allPosts,
    postsNacionales,
  });
}
