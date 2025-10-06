"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
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
  url?: string // 👈 opcional: enlace original del post
  url_imagen?: string // 👈 opcional: enlace original del post
}

export function PostTable({ posts }: { posts: Post[] }) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Imagen</TableHead>
            <TableHead>Perfil</TableHead>
            <TableHead>Red Social</TableHead>
            <TableHead>Texto</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Likes</TableHead>
            <TableHead>Comentarios</TableHead>
            <TableHead>Compartidos</TableHead>
            <TableHead className="text-right">Acciones</TableHead> {/* 👈 nueva columna */}
          </TableRow>
        </TableHeader>
        <TableBody>
          {posts.map((post) => (
            <TableRow key={post.id}>
              <TableCell>
                {post.url_imagen ? (
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
                )}
              </TableCell>
              <TableCell className="font-medium">{post.perfil}</TableCell>
              <TableCell>{post.redsocial}</TableCell>
              <TableCell className="max-w-[300px] truncate">
                {post.texto}
              </TableCell>
              <TableCell>
                {new Date(post.fechapublicacion).toLocaleDateString()}
              </TableCell>
              <TableCell>{post.likes}</TableCell>
              <TableCell>{post.comentarios}</TableCell>
              <TableCell>{post.compartidos}</TableCell>
              <TableCell className="text-right">
                {post.url ? (
                  <Link href={post.url} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm">
                      Ver publicación
                    </Button>
                  </Link>
                ) : (
                  <Button variant="ghost" size="sm" disabled>
                    Sin enlace
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
