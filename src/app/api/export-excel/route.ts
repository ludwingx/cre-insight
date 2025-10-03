import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import * as XLSX from 'xlsx';

export async function GET(req: NextRequest) {
  // Leer parámetros de filtro
  const { searchParams } = new URL(req.url);
  const desde = searchParams.get('desde');
  const hasta = searchParams.get('hasta');
  const ciudad = searchParams.get('ciudad');
  const titularidad = searchParams.get('titularidad');

  const where: any = {};
  // Interpretar fechas como días completos en zona America/La_Paz (UTC-4)
  const startOfDayLaPaz = (ymd: string) => new Date(`${ymd}T00:00:00.000-04:00`);
  const endOfDayLaPaz = (ymd: string) => new Date(`${ymd}T23:59:59.999-04:00`);
  if (desde && hasta) {
    where.fechapublicacion = { gte: startOfDayLaPaz(desde), lte: endOfDayLaPaz(hasta) };
  } else if (desde) {
    where.fechapublicacion = { gte: startOfDayLaPaz(desde) };
  } else if (hasta) {
    where.fechapublicacion = { lte: endOfDayLaPaz(hasta) };
  }
  if (ciudad) {
    where.departamento = { equals: ciudad, mode: 'insensitive' };
  }
  if (titularidad) {
    where.titularidad = { equals: titularidad, mode: 'insensitive' };
  }

  const posts = await prisma.scrap_post.findMany({
    where,
    orderBy: { fechapublicacion: 'asc' }
  });
  // Crear workbook con una sola hoja basada en scrap_post
  const worksheetPosts = XLSX.utils.json_to_sheet(posts);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheetPosts, 'Publicaciones');
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="publicaciones.xlsx"',
    },
  });
}
