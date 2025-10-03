import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const desde = searchParams.get("desde");
    const hasta = searchParams.get("hasta");

    let fechaInicio: Date | undefined = undefined;
    let fechaFin: Date | undefined = undefined;
    if (desde) {
      // Calcular inicio UTC del día visual Bolivia
      fechaInicio = new Date(desde + 'T04:00:00.000Z');
    }
    if (hasta) {
      // Calcular fin UTC del día visual Bolivia (fin del día seleccionado)
      const hastaUTC = new Date(new Date(hasta + 'T00:00:00-04:00').getTime() + 24*60*60*1000 - 1);
      fechaFin = new Date(hastaUTC.toISOString());
    }
    const baseWhere: any = {};
    if (fechaInicio && fechaFin) {
      baseWhere.fechapublicacion = {
        gte: fechaInicio,
        lte: fechaFin,
      };
    } else if (fechaInicio) {
      baseWhere.fechapublicacion = { gte: fechaInicio };
    } else if (fechaFin) {
      baseWhere.fechapublicacion = { lte: fechaFin };
    }
    const allPostsRaw = await prisma.scrap_post.findMany({
      where: baseWhere,
      orderBy: { fechapublicacion: "desc" },
      take: 800,
    });
    const allPosts = allPostsRaw.map(post => ({
      ...post,
      fechapublicacion: post.fechapublicacion || '',
    }));

    const postsNacionalesRaw = await prisma.scrap_post.findMany({
      where: {
        departamento: { equals: 'PAIS', mode: 'insensitive' },
        titularidad: { in: ['PRESIDENTE', 'VICEPRESIDENTE'] },
        ...(fechaInicio && fechaFin ? { fechapublicacion: { gte: fechaInicio, lte: fechaFin } } :
           fechaInicio ? { fechapublicacion: { gte: fechaInicio } } :
           fechaFin ? { fechapublicacion: { lte: fechaFin } } : {}),
      },
      orderBy: { fechapublicacion: 'desc' },
    });
    const postsNacionales = postsNacionalesRaw.map(post => ({
      ...post,
      fechapublicacion: post.fechapublicacion || '',
    }));

    let fechaFiltroSin: { gte?: Date; lte?: Date } = {};
    if (fechaInicio) {
      const inicioLocal = new Date(fechaInicio);
      inicioLocal.setHours(0,0,0,0);
      fechaFiltroSin.gte = inicioLocal;
    }
    if (fechaFin) {
      const finLocal = new Date(fechaFin);
      finLocal.setHours(23,59,59,999);
      fechaFiltroSin.lte = finLocal;
    }

    let sinActividadRegistrosRaw: any[] = [];
    if (fechaFiltroSin.gte && fechaFiltroSin.lte) {
      sinActividadRegistrosRaw = await prisma.$queryRaw`SELECT * FROM "sin_publicacion" WHERE "fecha_scrap" >= ${fechaFiltroSin.gte} AND "fecha_scrap" <= ${fechaFiltroSin.lte} AND "departamento" IS NOT NULL AND "departamento" <> '' ORDER BY "fecha_scrap" DESC LIMIT 500`;
    } else if (fechaFiltroSin.gte) {
      sinActividadRegistrosRaw = await prisma.$queryRaw`SELECT * FROM "sin_publicacion" WHERE "fecha_scrap" >= ${fechaFiltroSin.gte} AND "departamento" IS NOT NULL AND "departamento" <> '' ORDER BY "fecha_scrap" DESC LIMIT 500`;
    } else if (fechaFiltroSin.lte) {
      sinActividadRegistrosRaw = await prisma.$queryRaw`SELECT * FROM "sin_publicacion" WHERE "fecha_scrap" <= ${fechaFiltroSin.lte} AND "departamento" IS NOT NULL AND "departamento" <> '' ORDER BY "fecha_scrap" DESC LIMIT 500`;
    } else {
      sinActividadRegistrosRaw = await prisma.$queryRaw`SELECT * FROM "sin_publicacion" WHERE "departamento" IS NOT NULL AND "departamento" <> '' ORDER BY "fecha_scrap" DESC LIMIT 500`;
    }
    const sinActividadRegistros = sinActividadRegistrosRaw;

    return NextResponse.json({ allPosts, postsNacionales, sinActividadRegistros });
  } catch (error) {
    console.error("[API/general-posts] Error:", error);
    return NextResponse.json({ allPosts: [], postsNacionales: [], sinActividadRegistros: [] });
  }
}
