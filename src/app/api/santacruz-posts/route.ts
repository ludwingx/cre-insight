import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const departamento = 'SANTA CRUZ';
  const desde = searchParams.get('desde');
  const hasta = searchParams.get('hasta');

  let fechaInicio: Date | undefined = undefined;
  let fechaFin: Date | undefined = undefined;

  if (desde) fechaInicio = new Date(desde);
  if (hasta) {
    fechaFin = new Date(hasta);
    fechaFin.setHours(23, 59, 59, 999); // incluir todo el día hasta
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
  });
  const postsNacionales = postsNacionalesRaw.map(post => ({
    ...post,
    fechapublicacion: post.fechapublicacion || '',
  }));

  // Obtener lista de sin actividad en RRSS desde la tabla sin_publicacion
  // Filtro de fechas correcto para sin_publicacion
  let fechaFiltro: any = undefined;
  if (fechaInicio && fechaFin) {
    fechaFiltro = { gte: fechaInicio, lte: fechaFin };
  } else if (fechaInicio) {
    fechaFiltro = { gte: fechaInicio };
  } else if (fechaFin) {
    fechaFiltro = { lte: fechaFin };
  }

  const sinActividadRegistros = await prisma.sin_publicacion.findMany({
    where: {
      departamento: {
        equals: departamento,
        mode: 'insensitive',
      },
      ...(fechaFiltro ? { fecha_scrap: fechaFiltro } : {}),
    },
    orderBy: { fecha_scrap: 'desc' },
    take: 100,
  });

  return NextResponse.json({
    allPosts,
    postsNacionales,
    sinActividadRegistros,
  });
}
