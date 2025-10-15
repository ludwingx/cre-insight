import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const keyword = await prisma.keyword.findUnique({
      where: { id: parseInt(params.id) },
    });

    if (!keyword) {
      return NextResponse.json(
        { error: 'Palabra clave no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(keyword);
  } catch (error) {
    console.error('Error fetching keyword:', error);
    return NextResponse.json(
      { error: 'Error al obtener la palabra clave' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { palabra, activa } = await request.json();
    
    const keyword = await prisma.keyword.update({
      where: { id: parseInt(params.id) },
      data: {
        ...(palabra && { palabra: palabra.trim() }),
        ...(activa !== undefined && { activa }),
      },
    });

    return NextResponse.json(keyword);
  } catch (error) {
    console.error('Error updating keyword:', error);
    return NextResponse.json(
      { error: 'Error al actualizar la palabra clave' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Get current keyword to determine current status
    const keyword = await prisma.keyword.findUnique({
      where: { id: parseInt(params.id) },
    });

    if (!keyword) {
      return NextResponse.json(
        { error: 'Palabra clave no encontrada' },
        { status: 404 }
      );
    }

    // Toggle the 'activa' status (soft delete)
    const updatedKeyword = await prisma.keyword.update({
      where: { id: parseInt(params.id) },
      data: { 
        activa: !keyword.activa,
        updatedAt: new Date()
      },
    });

    return NextResponse.json({ 
      success: true, 
      activa: updatedKeyword.activa 
    });
  } catch (error) {
    console.error('Error al cambiar el estado de la palabra clave:', error);
    return NextResponse.json(
      { error: 'Error al actualizar el estado de la palabra clave' },
      { status: 500 }
    );
  }
}
