"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type Post = {
  id: number
  perfil: string
  redsocial: string
  texto: string
  fechapublicacion: string
  likes: number
  comentarios: number
  compartidos: number
  url_publicacion?: string
  url_imagen?: string
  seguimiento: boolean
}

export function PostTable({ posts }: { posts: Post[] }) {
  
  const handleSeguimientoChange = async (postId: number, newValue: boolean) => {
    try {
      // Aquí puedes hacer la llamada a tu API para actualizar el estado de seguimiento
      const response = await fetch(`/api/posts/extracted/${postId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          seguimiento: newValue
        })
      });

      if (!response.ok) {
        throw new Error('Error al actualizar el seguimiento');
      }

      // Opcional: Mostrar un toast de éxito
      console.log(`Seguimiento del post ${postId} actualizado a: ${newValue}`);
      
    } catch (error) {
      console.error('Error:', error);
      // Opcional: Mostrar un toast de error
    }
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Imagen</TableHead>
            <TableHead>ID Post</TableHead>
            <TableHead>Red Social</TableHead>
            <TableHead>Texto</TableHead>
            <TableHead className="text-center">Fecha</TableHead>
            <TableHead className="text-center">Likes</TableHead>
            <TableHead className="text-center">Comentarios</TableHead>
            <TableHead className="text-center">Compartidos</TableHead>
            <TableHead className="text-center">Seguimiento</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {posts.map((post) => {
            const imageCell = post.url_imagen ? (
              <img 
                src={post.url_imagen} 
                alt="Miniatura"
                className="w-16 h-16 object-cover rounded-md hover:scale-105 transition-transform"
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
            ) : (
              <div className="w-16 h-16 flex items-center justify-center bg-gray-50 rounded-md text-gray-400">
                <span className="text-xs text-center">Sin imagen</span>
              </div>
            );

            // 🔹 Acciones: Ver publicación y Ver seguimiento
            const actionCell = (
              <div className="flex justify-end gap-2">
                {post.url_publicacion ? (
                  <Link
                    href={post.url_publicacion}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      variant="link"
                      className="text-blue-500 hover:text-blue-600 cursor-pointer"
                      size="sm"
                    >
                      Ver publicación
                    </Button>
                  </Link>
                ) : (
                  <Button variant="ghost" size="sm" disabled>
                    Sin enlace
                  </Button>
                )}

                {/* Nuevo botón: Ver seguimiento */}
                <Link href={`/dashboard/posts/extracted/${post.id}/tracking`}>
                  <Button
                    variant="link"
                    size="sm"
                    className="text-blue-500 hover:text-blue-600 cursor-pointer"
                  >
                    Ver seguimiento
                  </Button>
                </Link>
              </div>
            );

            return (
              <TableRow key={post.id}>
                <TableCell>{imageCell}</TableCell>
                <TableCell className="font-medium">{post.perfil}</TableCell>
                <TableCell>{post.redsocial}</TableCell>
                <TableCell className="max-w-[300px] truncate">{post.texto}</TableCell>
                <TableCell className="text-center">
                  {new Date(post.fechapublicacion).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-center">{post.likes}</TableCell>
                <TableCell className="text-center">{post.comentarios}</TableCell>
                <TableCell className="text-center">{post.compartidos}</TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center">
                    <Switch
                      checked={post.seguimiento}
                      onCheckedChange={(checked) => handleSeguimientoChange(post.id, checked)}
                      className="data-[state=checked]:bg-blue-500"
                    />
                  </div>
                </TableCell>
                <TableCell className="text-right">{actionCell}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  )
}