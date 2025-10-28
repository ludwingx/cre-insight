import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface PatchRequest {
  seguimiento: boolean;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fromDate = searchParams.get('from');
    const toDate = searchParams.get('to');
    
    // First, get all posts without any filters
    const allPosts = await prisma.post.findMany({
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

    // Then filter in memory
    const filteredPosts = allPosts.filter(post => {
      // Skip posts with empty or null id_publicacion
      if (!post.id_publicacion || post.id_publicacion.trim() === '') {
        return false;
      }
      
      // Apply date filter if dates are provided
      if (fromDate && toDate) {
        const postDate = new Date(post.fecha);
        const startDate = new Date(fromDate);
        const endDate = new Date(toDate);
        
        if (postDate < startDate || postDate > endDate) {
          return false;
        }
      }
      
      return true;
    });
    
    // Map to the required format
    const posts = filteredPosts.map(post => ({
      id: post.id,
      perfil: post.id_publicacion,
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
    console.error('Error fetching posts:', error);
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