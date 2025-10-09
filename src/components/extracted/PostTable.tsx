"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Play, Image as ImageIcon, Facebook, Instagram } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

type Post = {
  id: number
  perfil: string
  redsocial: string
  texto: string
  fechapublicacion: string
  likes: number
  comentarios: number
  compartidos: number
  vistas: number
  tipoContenido: string
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
      <Table className="[&_tr]:h-auto [&_td]:align-top">
        <TableHeader>
          <TableRow>
          <TableHead className="text-center">Red Social</TableHead>
          <TableHead className="text-center">Tipo</TableHead>
          <TableHead className="text-center">Fecha</TableHead>
            <TableHead>Imagen</TableHead>
            {/* <TableHead>ID Post</TableHead> */}
            <TableHead className="min-w-[300px]">Texto</TableHead>
            <TableHead className="text-center">Likes</TableHead>
            <TableHead className="text-center">Comentarios</TableHead>
            <TableHead className="text-center">Compartidos</TableHead>
            <TableHead className="text-center">Vistas</TableHead>
            <TableHead className="text-center">Seguimiento</TableHead>
            <TableHead className="text-center">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {postList.map((post) => (
            <TableRow key={post.id}>
            <TableCell className="text-center">
              <div className="flex justify-center">
                <Badge variant="outline" className="gap-1">
                  {post.redsocial.toLowerCase() === 'facebook' ? (
                    <Facebook className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                  ) : post.redsocial.toLowerCase() === 'instagram' ? (
                    <Instagram className="h-3 w-3 text-pink-600 dark:text-pink-400" />
                  ) : (
                    <span className="h-3 w-3 rounded-full bg-gray-300" />
                  )}
                  {post.redsocial}
                </Badge>
              </div>
            </TableCell>
            <TableCell className="text-center">
              <div className="flex justify-center">
                {post.tipoContenido === 'video' ? (
                  <Badge variant="destructive" className="gap-1">
                    <Play className="h-3 w-3" />
                    Video
                  </Badge>
                ) : (
                  <Badge variant="outline" className="gap-1">
                    <ImageIcon className="h-3 w-3" />
                    Imagen
                  </Badge>
                )}
              </div>
            </TableCell>
            
            <TableCell className="text-center">
                <div className="flex flex-col">
                  <span className="whitespace-nowrap">
                    {new Date(post.fechapublicacion).toLocaleDateString('es-BO', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit'
                    })}
                  </span>
                  <span className="text-sm text-muted-foreground whitespace-nowrap">
                    {new Date(post.fechapublicacion).toLocaleTimeString('es-BO', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true
                    })}
                  </span>
                </div>
              </TableCell>
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
              {/* <TableCell className="font-medium">{post.perfil}</TableCell> */}
              <TableCell className="whitespace-normal py-4">
                <div className="pr-2">
                  {post.texto}
                </div>
              </TableCell>
              <TableCell className="text-center">{post.likes}</TableCell>
              <TableCell className="text-center">{post.comentarios}</TableCell>
              <TableCell className="text-center">{post.compartidos}</TableCell>
              <TableCell className="text-center">
                {post.vistas > 0 ? (
                  <span className="font-medium">
                    {post.vistas.toLocaleString()}
                  </span>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>

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
