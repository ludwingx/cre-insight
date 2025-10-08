import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Interfaz para las métricas
interface PostMetric {
  id: number;
  postId: number;
  likes: number;
  comments: number;
  shares: number;
  views: number | null;
  collectedAt: Date;
}

export async function GET(
  request: Request,
  { params }: { params: { id: string; redsocial?: string } }
) {
  try {
    // Si el parámetro es un número => buscar por ID
    const postId = parseInt(params.id, 10);

    // Si el parámetro no es un número => puede ser una red social
    const redsocialParam = params.redsocial || (!isNaN(postId) ? null : params.id);

    // Si es por ID
    if (!isNaN(postId)) {
      const post = await prisma.post.findUnique({
        where: { id: postId },
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
          created_at: true,
          updated_at: true,
          metrics: {
            orderBy: { collectedAt: 'asc' },
            select: {
              id: true,
              likes: true,
              comments: true,
              shares: true,
              views: true,
              collectedAt: true,
              totalInteracciones: true,
              engagementRate: true,
              tipoContenido: true
            }
          }
        },
      });

      if (!post) {
        return NextResponse.json({ error: 'Post no encontrado' }, { status: 404 });
      }

      const { metrics, ...postData } = post;

      // Crear punto inicial con los datos del post
      const initialMetric = {
        id: 0, // ID 0 para indicar que es el punto inicial
        date: postData.created_at.toISOString(),
        likes: postData.me_gusta,
        comentarios: postData.comentarios,
        compartidos: postData.compartidos,
        vistas: postData.vistas || 0,
        totalInteracciones: postData.me_gusta + postData.comentarios + postData.compartidos,
        engagementRate: 0, // Se calculará después si hay métricas
        isInitial: true // Marcar como punto inicial
      };

      // Calcular métricas resumidas
      const latestMetric = metrics.length > 0 ? metrics[metrics.length - 1] : null;
      const firstTrackedMetric = metrics.length > 0 ? metrics[0] : null;
      
      // Formatear datos de seguimiento para el gráfico, comenzando con el punto inicial
      const formattedTracking = [
        initialMetric,
        ...metrics.map(metric => ({
          id: metric.id,
          date: metric.collectedAt.toISOString(),
          likes: metric.likes,
          comentarios: metric.comments,
          compartidos: metric.shares,
          vistas: metric.views || 0,
          totalInteracciones: metric.totalInteracciones || (metric.likes + metric.comments + metric.shares),
          engagementRate: metric.engagementRate || 0,
          isInitial: false
        }))
      ];

      // Calcular engagement rate para el punto inicial basado en la primera métrica o en los datos actuales
      if (firstTrackedMetric) {
        const initialEngagement = (initialMetric.totalInteracciones / (initialMetric.vistas || 1)) * 100;
        initialMetric.engagementRate = initialEngagement;
      } else if (latestMetric) {
        // Si solo hay un punto (el inicial), calcular el engagement con los datos actuales
        initialMetric.engagementRate = (initialMetric.totalInteracciones / (initialMetric.vistas || 1)) * 100;
      }

      // Calcular diferencias entre el punto inicial y la última métrica
      const diffMetrics = latestMetric ? {
        likesDiff: latestMetric.likes - initialMetric.likes,
        commentsDiff: latestMetric.comments - initialMetric.comentarios,
        sharesDiff: latestMetric.shares - initialMetric.compartidos,
        viewsDiff: (latestMetric.views || 0) - initialMetric.vistas
      } : null;

      return NextResponse.json({
        post: {
          id: postData.id,
          perfil: postData.id_publicacion,
          redsocial: capitalize(postData.plataforma),
          texto: postData.texto,
          fecha: postData.fecha,
          likes: postData.me_gusta,
          comentarios: postData.comentarios,
          compartidos: postData.compartidos,
          url_imagen: postData.image_base64 || null,
          url_publicacion: postData.url_publicacion,
          seguimiento: postData.seguimiento,
          tipoContenido: postData.tipoContenido,
          vistas: postData.vistas,
          creado: postData.created_at,
          actualizado: postData.updated_at,
          // Agregar métricas resumidas
          metricas: latestMetric ? {
            ...latestMetric,
            // Calcular engagement rate si no está definido
            engagementRate: latestMetric.engagementRate || 
              (latestMetric.likes + latestMetric.comments + latestMetric.shares) / (postData.vistas || 1) * 100
          } : null,
          // Agregar diferencias
          diferencias: diffMetrics
        },
        tracking: formattedTracking,
        totalMetrics: metrics.length
      });
    }

    // Si es por red social (por ejemplo /api/posts/redsocial/facebook)
    if (redsocialParam) {
      const redSocialFormatted = capitalize(redsocialParam);

      const posts = await prisma.post.findMany({
        where: { plataforma: { equals: redSocialFormatted, mode: 'insensitive' } },
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
          created_at: true,
          updated_at: true,
        },
        orderBy: { created_at: 'desc' }
      });

      if (!posts.length) {
        return NextResponse.json(
          { error: `No se encontraron posts para ${redSocialFormatted}` },
          { status: 404 }
        );
      }

      return NextResponse.json({
        redsocial: redSocialFormatted,
        total: posts.length,
        posts
      });
    }

    return NextResponse.json({ error: 'Parámetro inválido' }, { status: 400 });
  } catch (error) {
    console.error('Error fetching post tracking:', error);
    return NextResponse.json(
      { error: 'Error al obtener el seguimiento del post' },
      { status: 500 }
    );
  }
}

// 🔠 Función auxiliar para poner mayúscula inicial
function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

interface PatchRequest {
  seguimiento: boolean;
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const postId = parseInt(params.id, 10);
    
    if (isNaN(postId)) {
      return NextResponse.json(
        { error: 'ID de post inválido' },
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
      where: { id: postId },
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
    console.error('Error updating post seguimiento:', error);
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
