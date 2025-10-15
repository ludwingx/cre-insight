import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const keywords = await prisma.keyword.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(keywords);
  } catch (error) {
    console.error('Error fetching keywords:', error);
    return NextResponse.json(
      { error: 'Error al obtener las palabras clave' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { palabra, activa } = await request.json();
    
    if (!palabra) {
      return NextResponse.json(
        { error: 'La palabra es requerida' },
        { status: 400 }
      );
    }

    const keyword = await prisma.keyword.create({
      data: {
        palabra: palabra.trim(),
        activa: activa ?? true,
      },
    });

    return NextResponse.json(keyword, { status: 201 });
  } catch (error) {
    console.error('Error creating keyword:', error);
    return NextResponse.json(
      { error: 'Error al crear la palabra clave' },
      { status: 500 }
    );
  }
}
