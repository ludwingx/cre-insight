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
          url_imagen: true,
          url_publicacion: true,
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
              collectedAt: true
            }
          }
        },
      });

      if (!post) {
        return NextResponse.json({ error: 'Post no encontrado' }, { status: 404 });
      }

      const { metrics, ...postData } = post;

      const formattedTracking = metrics.map(metric => ({
        date: metric.collectedAt.toISOString().split('T')[0],
        likes: metric.likes,
        comentarios: metric.comments,
        compartidos: metric.shares,
        vistas: metric.views || 0
      }));

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
          url_imagen: postData.url_imagen || null,
          url_publicacion: postData.url_publicacion,
          creado: postData.created_at,
          actualizado: postData.updated_at
        },
        tracking: formattedTracking
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
          url_imagen: true,
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
