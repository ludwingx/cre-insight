import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Devuelve los candidatos que NO tienen publicaciones en el rango de fechas
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const desde = searchParams.get('desde');
    const hasta = searchParams.get('hasta');

    let fechaInicio: Date | undefined = undefined;
    let fechaFin: Date | undefined = undefined;
    if (desde) {
      const localDesde = new Date(desde + 'T00:00:00-04:00');
      fechaInicio = new Date(localDesde.toISOString());
    }
    if (hasta) {
      const localHasta = new Date(hasta + 'T23:59:59.999-04:00');
      fechaFin = new Date(localHasta.toISOString());
    }

    const departamento = searchParams.get('departamento');
    const sinActividadRegistros = await prisma.candidatos.findMany({
      where: {
        status: 'activo',
        ...(departamento
          ? {
              OR: [
                { departamento: departamento.toUpperCase() },
                { departamento: 'PAIS' }
              ]
            }
          : {}),
        scrap_posts: {
          none: {
            ...(fechaInicio && fechaFin
              ? { fechapublicacion: { gte: fechaInicio, lte: fechaFin } }
              : fechaInicio
              ? { fechapublicacion: { gte: fechaInicio } }
              : fechaFin
              ? { fechapublicacion: { lte: fechaFin } }
              : {})
          }
        }
      },
      orderBy: [
        { titularidad: 'asc' },
        { departamento: 'asc' },
        { id: 'asc' }
      ],
      select: {
        id: true,
        nombre_completo: true,
        titularidad: true,
        departamento: true
      }
    });
    // Orden personalizado de titularidad
    const titularidadOrden = [
      'PRESIDENTE',
      'VICEPRESIDENTE',
      'SENADOR',
      'DIPUTADO PLURINOMINAL',
      'DIPUTADO UNINOMINAL URBANO',
      'DIPUTADO UNINOMINAL RURAL',
      'DIPUTADO SUPRAESTATAL',
      'DIPUTADO CIRCUNSCRIPCIÓN ESPECIAL',
      'OTRO'
    ];
    sinActividadRegistros.sort((a, b) => {
      // Primero, los departamentos que no son 'PAIS', luego 'PAIS'
      const depA = (a.departamento || '').toUpperCase() === 'PAIS' ? 1 : 0;
      const depB = (b.departamento || '').toUpperCase() === 'PAIS' ? 1 : 0;
      if (depA !== depB) return depA - depB;
      // Si mismo tipo de departamento, ordenar alfabéticamente por departamento
      const cmpDep = (a.departamento || '').localeCompare(b.departamento || '');
      if (cmpDep !== 0) return cmpDep;
      // Dentro del departamento, ordenar por titularidad personalizada
      const titA = titularidadOrden.indexOf((a.titularidad || '').toUpperCase());
      const titB = titularidadOrden.indexOf((b.titularidad || '').toUpperCase());
      return (titA === -1 ? 999 : titA) - (titB === -1 ? 999 : titB);
    });
    return NextResponse.json({ sinActividadRegistros });
  } catch (error) {
    console.error('[API/candidatos-sin-posts] Error:', error);
    return NextResponse.json({ sinActividadRegistros: [] }, { status: 500 });
  }
}
