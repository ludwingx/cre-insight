"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Play, ImageIcon, Facebook, Instagram, Share2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { X } from "lucide-react"
import React from "react"
import { toast } from "sonner"

export type Post = {
  id: string
  perfil: string
  redsocial: string
  texto: string
  fechapublicacion: string
  likes: number
  comentarios: number
  compartidos: number
  url_imagen: string | null
  url_publicacion: string
  seguimiento: boolean
  tipoContenido: string
  vistas: number
}

export function PostTable({ posts }: { posts: Post[] }) {
  const [postList, setPostList] = useState<Post[]>([])
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set())
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set())
  const [selectedImage, setSelectedImage] = useState<{ url: string; alt: string } | null>(null)
  const [updatingPosts, setUpdatingPosts] = useState<Set<string>>(new Set())

  // Update postList when posts prop changes
  React.useEffect(() => {
    setPostList(posts)
  }, [posts])

  const handleImageError = (postId: string) => {
    console.log(`Error loading image for post ${postId}`)
    setImageErrors(prev => new Set(prev).add(postId))
  }

  const handleImageLoad = (id: string) => {
    setLoadedImages((prev) => new Set(prev).add(id))
  }

  const openImageModal = (url: string, alt: string = '') => {
    setSelectedImage({ url, alt })
  }

  const closeImageModal = () => {
    setSelectedImage(null)
  }

  async function handleSeguimientoChange(id: string, checked: boolean): Promise<void> {
    // Prevent multiple clicks on the same post
    if (updatingPosts.has(id)) {
      toast.info('Actualización en progreso...');
      return;
    }

    // Add to updating set
    setUpdatingPosts(prev => new Set(prev).add(id));

    // Show loading toast
    const toastId = toast.loading(checked ? 'Activando seguimiento...' : 'Desactivando seguimiento...');

    try {
      // Add a small delay to prevent UI jank and rapid API calls
      await new Promise(resolve => setTimeout(resolve, 300));

      // Optimistic update
      setPostList(prev =>
        prev.map((post) =>
          post.id === id ? { ...post, seguimiento: checked } : post
        )
      );

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      try {
        const response = await fetch(`/api/posts/${id}/seguimiento`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ seguimiento: checked }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          // If we get a 409 Conflict, it means the post was already in the desired state
          if (response.status === 409) {
            // No need to show an error, just update the UI to match the server
            const serverState = await response.json();
            setPostList(prev =>
              prev.map((post) =>
                post.id === id ? { ...post, seguimiento: serverState.seguimiento } : post
              )
            );
            toast.success(serverState.seguimiento ? 'Seguimiento ya estaba activado' : 'Seguimiento ya estaba desactivado', {
              id: toastId
            });
            return;
          }

          let errorMessage = 'Error al actualizar el seguimiento';
          try {
            const errorData = await response.json().catch(() => ({}));
            console.error('API Error Response:', {
              status: response.status,
              statusText: response.statusText,
              error: errorData,
              url: response.url
            });
            errorMessage = errorData.message || errorData.error || errorMessage;
          } catch (e) {
            console.error('Error parsing error response:', e);
          }
          throw new Error(errorMessage);
        }

        const updatedPost = await response.json().catch(() => null);

        // If we couldn't parse the response, use the optimistic value
        if (!updatedPost) {
          console.warn('Empty or invalid response from server, using optimistic update');
          toast.success(checked ? 'Seguimiento actualizado (sin confirmación del servidor)' : 'Seguimiento desactivado (sin confirmación del servidor)', {
            id: toastId
          });
          return;
        }

        // Update with server response
        setPostList(prev => prev.map(post => 
          post.id === id ? { ...post, seguimiento: updatedPost.seguimiento } : post
        ));

        // Show success notification
        toast.success(updatedPost.seguimiento ? 'Seguimiento activado correctamente' : 'Seguimiento desactivado correctamente', {
          id: toastId
        });

      } catch (error) {
        clearTimeout(timeoutId);
        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            throw new Error('La solicitud tardó demasiado tiempo. Por favor, inténtalo de nuevo.');
          }
        }
        throw error; // Re-throw to be caught by the outer catch
      }

    } catch (error) {
      const errorDetails = error instanceof Error ? error.message : 'Error desconocido';
      console.error('Error updating seguimiento:', {
        error: errorDetails,
        id,
        checked
      });
      
      // Revert on error
      setPostList(prev =>
        prev.map((post) =>
          post.id === id ? { ...post, seguimiento: !checked } : post
        )
      );
      
      // Show error notification
      const errorMessage = error instanceof Error ? 
        (error.message.includes('timed out') ? error.message : 
         error.message.includes('Failed to fetch') ? 'Error de conexión. Verifica tu conexión a internet.' : 
         error.message) : 
        'Error desconocido';
      
      toast.error(
        `Error al ${checked ? 'activar' : 'desactivar'} el seguimiento: ${errorMessage}`, 
        { 
          id: toastId,
          duration: 5000 // Show error for 5 seconds
        }
      );
    } finally {
      // Remove from updating set with a small delay to prevent rapid toggles
      setTimeout(() => {
        setUpdatingPosts(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      }, 300);
    }
  }

  return (
    <div className="rounded-md border overflow-hidden">
      {/* Image Modal - Moved outside the table */}
      <Dialog open={!!selectedImage} onOpenChange={(open) => !open && closeImageModal()}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] p-0 bg-transparent border-none shadow-none">
          <DialogHeader className="sr-only">
            <DialogTitle>Vista previa de imagen</DialogTitle>
          </DialogHeader>
          <div className="relative w-full h-full flex items-center justify-center">
            <button
              onClick={closeImageModal}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 focus:outline-none z-10"
              aria-label="Cerrar"
            >
              <X className="w-6 h-6" />
            </button>
            {selectedImage && (
              <div className="max-w-full max-h-[80vh] flex items-center justify-center">
                <img
                  src={selectedImage.url}
                  alt={selectedImage.alt || 'Imagen ampliada'}
                  className="max-w-full max-h-[80vh] object-contain rounded-md"
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Scrollable Table */}
      <div className="relative overflow-auto max-h-[calc(80vh-200px)]">
        <Table className="w-full [&_tr]:h-auto [&_td]:align-middle text-xs sm:text-sm">
          <TableHeader className="sticky top-0 bg-background z-10">
            <TableRow>
              <TableHead className="text-center">Red Social</TableHead>
              <TableHead className="text-center">Tipo</TableHead>
              <TableHead className="text-center">Fecha</TableHead>
              <TableHead className="text-center">Imagen</TableHead>
              <TableHead className="min-w-[200px] md:min-w-[300px] text-center">Texto</TableHead>
              <TableHead className="text-center hidden sm:table-cell">Likes</TableHead>
              <TableHead className="text-center hidden md:table-cell">Comentarios</TableHead>
              <TableHead className="text-center hidden lg:table-cell">Compartidos</TableHead>
              <TableHead className="text-center hidden xl:table-cell">Vistas</TableHead>
              <TableHead className="text-center hidden sm:table-cell">Seguimiento</TableHead>
              <TableHead className="text-center">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {postList.map((post) => (
              <TableRow key={post.id}>
                {/* Red Social - Centrado */}
                <TableCell className="text-center align-middle">
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

                {/* Tipo - Centrado */}
                <TableCell className="text-center align-middle">
                  <div className="flex justify-center">
                    {post.tipoContenido === 'video' ? (
                      <Badge variant="outline" className="gap-1">
                        <Play className="h-3 w-3" />
                        Video
                      </Badge>
                    ) : post.tipoContenido === 'compartida' || post.tipoContenido === 'compartido' ? (
                      <Badge variant="outline" className="gap-1">
                        <Share2 className="h-3 w-3" />
                        Compartido
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="gap-1">
                        <ImageIcon className="h-3 w-3" />
                        Imagen
                      </Badge>
                    )}
                  </div>
                </TableCell>

                {/* Fecha - Centrado */}
                <TableCell className="text-center align-middle">
                  <div className="flex flex-col items-center justify-center">
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

                {/* Imagen - Centrado */}
                <TableCell className="text-center align-middle">
                  <div className="flex justify-center">
                    <div className="relative w-16 h-16">
                      {post.url_imagen && !imageErrors.has(post.id) ? (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              if (post.url_imagen) {
                                openImageModal(post.url_imagen, `Imagen de ${post.redsocial}`)
                              }
                            }}
                            className="w-full h-full hover:opacity-90 transition-opacity"
                            aria-label="Ver imagen en grande"
                            disabled={!post.url_imagen}
                          >
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
                          </button>
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
                  </div>
                </TableCell>

                {/* Texto - NO Centrado (mantiene alineación por defecto) */}
                <TableCell className="whitespace-normal py-4 align-top">
                  <div className="pr-2">
                    {post.texto}
                  </div>
                </TableCell>

                {/* Likes - Centrado */}
                <TableCell className="text-center align-middle">{post.likes}</TableCell>

                {/* Comentarios - Centrado */}
                <TableCell className="text-center align-middle">{post.comentarios}</TableCell>

                {/* Compartidos - Centrado */}
                <TableCell className="text-center align-middle">{post.compartidos}</TableCell>

                {/* Vistas - Centrado */}
                <TableCell className="text-center align-middle">
                  {post.vistas > 0 ? (
                    <span className="font-medium">
                      {post.vistas.toLocaleString()}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>

                {/* Seguimiento - Centrado */}
                <TableCell className="text-center align-middle">
                  <div className="flex justify-center">
                    <Switch
                      checked={post.seguimiento}
                      onCheckedChange={(checked) => handleSeguimientoChange(post.id, checked)}
                      disabled={updatingPosts.has(post.id)}
                      className="data-[state=checked]:bg-primary cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </TableCell>

                {/* Acciones - Centrado */}
                <TableCell className="text-center align-middle">
                  <div className="flex justify-center gap-2">
                    {post.url_publicacion ? (
                      <Link
                        href={post.url_publicacion}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button
                          variant="link"
                          className="text-primary hover:text-primary cursor-pointer"
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
                        className="text-primary hover:text-primary cursor-pointer"
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
    </div>
  )
}