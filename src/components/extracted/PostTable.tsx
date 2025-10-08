"use client"

import { useState } from "react"
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
  const [postList, setPostList] = useState(posts)
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set())
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set())

  const handleImageError = (postId: number) => {
    console.log(`Error loading image for post ${postId}`)
    setImageErrors(prev => new Set(prev).add(postId))
  }

  const handleImageLoad = (postId: number) => {
    console.log(`Image loaded for post ${postId}`)
    setLoadedImages(prev => new Set(prev).add(postId))
    setImageErrors(prev => {
      const newSet = new Set(prev)
      newSet.delete(postId)
      return newSet
    })
  }

  function handleSeguimientoChange(id: number, checked: boolean): void {
    setPostList((prev) =>
      prev.map((post) =>
        post.id === id ? { ...post, seguimiento: checked } : post
      )
    )
  }

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
          {postList.map((post) => (
            <TableRow key={post.id}>
            <TableCell className="w-20">
              <div className="relative w-16 h-16">
                {post.url_imagen && !imageErrors.has(post.id) ? (
                  <>
                    <img
                      src={post.url_imagen}
                      alt="Miniatura"
                      className={`w-full h-full object-cover rounded-md transition-opacity duration-300 ${
                        loadedImages.has(post.id) ? 'opacity-100' : 'opacity-0'
                      }`}
                      onError={() => handleImageError(post.id)}
                      onLoad={() => handleImageLoad(post.id)}
                      loading="lazy"
                      crossOrigin="anonymous"
                      referrerPolicy="no-referrer"
                    />
                    {!loadedImages.has(post.id) && !imageErrors.has(post.id) && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-md">
                        <div className="animate-pulse w-full h-full bg-gray-200 rounded-md"></div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-md text-gray-400">
                    <span className="text-xs text-center">
                      {post.url_imagen ? 'Error' : 'Sin imagen'}
                    </span>
                  </div>
                )}
              </div>
              </TableCell>

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
                    onCheckedChange={(checked) =>
                      handleSeguimientoChange(post.id, checked)
                    }
                    className="data-[state=checked]:bg-blue-500"
                  />
                </div>
              </TableCell>

              <TableCell className="text-right">
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
