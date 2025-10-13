import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const mentions = await prisma.mention.findMany({
      orderBy: {
        publishedAt: 'desc',
      },
      // Seleccionar solo los campos necesarios
      select: {
        id: true,
        sourceName: true,
        sourceUrl: true,
        image_base64: true,
        platform: true,
        content: true,
        mentionUrl: true,
        razon_especifica:  true,
        comentario_principal: true,
        publishedAt: true,
        collectedAt: true,
      },
    });

    // Agregar información de depuración
    if (mentions.length > 0) {
      console.log('Primera mención en la API:', {
        id: mentions[0].id,
        hasImage: !!mentions[0].image_base64,
        imageLength: mentions[0].image_base64?.length || 0,
        imageStartsWith: mentions[0].image_base64?.substring(0, 30) || 'N/A',
      });
    }

    return NextResponse.json(mentions);
  } catch (error) {
    console.error('Error fetching mentions:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch mentions',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
