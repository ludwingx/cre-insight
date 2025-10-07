import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const postsRaw = await prisma.post.findMany({
      orderBy: { fecha: 'desc' },
      take: 50,
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
        // Si tienes comentarios en metrics, puedes agregarlos aquí
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
      url_imagen: post.url_imagen,
      url_publicacion: post.url_publicacion,
    }));
    console.log("POSTS RAW:", postsRaw); // <--- Aquí el log
    return NextResponse.json({ posts });
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching posts' }, { status: 500 });
  }
}
