import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface PatchRequest {
  seguimiento: boolean;
}

export async function GET() {
  try {
    const postsRaw = await prisma.post.findMany({
      orderBy: { fecha: 'desc' },
      select: {
        id: true,
        id_publicacion: true,
        plataforma: true,
        texto: true,
        fecha: true,
        me_gusta: true,
        comentarios: true,
        compartidos: true,
        image_base64: true,
        url_publicacion: true,
        seguimiento: true,
        tipoContenido: true,
        vistas: true,
      },
    });
    // Mapeo para PostTable
    const posts = postsRaw.map(post => ({
      id: post.id,
      perfil: post.id_publicacion, // O ajusta según lo que quieras mostrar
      redsocial: post.plataforma,
      texto: post.texto,
      fechapublicacion: post.fecha,
      likes: post.me_gusta,
      comentarios: post.comentarios,
      compartidos: post.compartidos,
      url_imagen: post.image_base64,
      url_publicacion: post.url_publicacion,
      seguimiento: post.seguimiento,
      tipoContenido: post.tipoContenido,
      vistas: post.vistas
    }));
    return NextResponse.json({ posts });
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching posts' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Get the post ID from the URL
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('id');
    
    if (!postId) {
      return NextResponse.json(
        { error: 'ID de post no proporcionado' },
        { status: 400 }
      );
    }

    // Parse the request body to get the new seguimiento value
    const body: PatchRequest = await request.json();
    
    if (typeof body.seguimiento !== 'boolean') {
      return NextResponse.json(
        { error: 'El campo seguimiento es requerido y debe ser un valor booleano' },
        { status: 400 }
      );
    }

    // Update the post in the database
    const updatedPost = await prisma.post.update({
      where: { id: parseInt(postId) },
      data: {
        seguimiento: body.seguimiento,
        updated_at: new Date()
      },
      select: {
        id: true,
        seguimiento: true
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Estado de seguimiento actualizado correctamente',
      data: updatedPost
    });

  } catch (error) {
    return NextResponse.json(
      { 
        success: false,
        error: 'Error al actualizar el seguimiento del post',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
