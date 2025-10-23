
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Image as ImageIcon, Facebook, Instagram, Twitter, Youtube } from "lucide-react"
import { Badge } from "@/components/ui/badge"

// Función para verificar si un string es una imagen base64 válida
const isValidBase64Image = (str: string | null): boolean => {
  if (!str) return false;
  try {
    // Verificar que el string no esté vacío
    const trimmed = str.trim();
    if (!trimmed) return false;
    
    // Verificar si ya incluye el prefijo data:image
    if (trimmed.startsWith('data:image')) {
      return true;
    }
    
    // Verificar si es un base64 válido (versión más flexible)
    // Eliminar posibles espacios en blanco y saltos de línea
    const base64WithoutWhitespace = trimmed.replace(/\s/g, '');
    return /^[A-Za-z0-9+/=]+$/.test(base64WithoutWhitespace);
  } catch (e) {
    console.error('Error validando imagen base64:', e);
    return false;
  }
};

// Función para formatear correctamente la URL de la imagen
const formatImageUrl = (base64: string | null): string | null => {
  if (!base64) return null;
  const trimmed = base64.trim();
  
  // Si ya tiene el prefijo data:image, devolverlo tal cual
  if (trimmed.startsWith('data:image')) {
    return trimmed;
  }
  
  // Si no tiene el prefijo, asumir que es un base64 de imagen JPEG
  return `data:image/jpeg;base64,${trimmed}`;
};

export type Mention = {
  status: any
  id: number
  sourceName: string
  sourceUrl: string
  image_base64: string | null
  platform: string
  content: string
  mentionUrl: string
  razon_especifica: string | null
  comentario_principal: string | null
  publishedAt: string
  collectedAt: string
}

export function MentionsTable({ initialMentions }: { initialMentions: Mention[] }) {
  const [mentions, setMentions] = useState<Mention[]>(initialMentions)
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set())
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set())

  const handleImageError = (mentionId: number) => {
    setImageErrors(prev => new Set(prev).add(mentionId))
  }

  const handleImageLoad = (mentionId: number) => {
    setLoadedImages(prev => new Set(prev).add(mentionId))
    setImageErrors(prev => {
      const newSet = new Set(prev)
      newSet.delete(mentionId)
      return newSet
    })
  }

  const getPlatformIcon = (platform: string) => {
    const platformLower = platform.toLowerCase()
    if (platformLower.includes('facebook')) return <Facebook className="h-4 w-4 text-blue-600 dark:text-blue-400" />
    if (platformLower.includes('instagram')) return <Instagram className="h-4 w-4 text-pink-600 dark:text-pink-400" />
    if (platformLower.includes('twitter') || platformLower.includes('x')) return <Twitter className="h-4 w-4 text-blue-400 dark:text-blue-300" />
    if (platformLower.includes('youtube')) return <Youtube className="h-4 w-4 text-red-600 dark:text-red-400" />
    return <span className="h-4 w-4 rounded-full bg-gray-300" />
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-BO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Depuración: Mostrar el primer elemento para ver su estructura
  if (mentions.length > 0) {
    console.log('Primera mención:', {
      id: mentions[0].id,
      hasImage: !!mentions[0].image_base64,
      imageType: mentions[0].image_base64 ? typeof mentions[0].image_base64 : 'none',
      first50Chars: mentions[0].image_base64 ? mentions[0].image_base64.substring(0, 50) + '...' : 'none'
    })
  }

  // Depuración: Mostrar información sobre las menciones
  useEffect(() => {
    if (mentions.length > 0) {
      console.log('Menciones cargadas:', {
        total: mentions.length,
        withImages: mentions.filter(m => m.image_base64).length,
        firstMention: {
          id: mentions[0].id,
          hasImage: !!mentions[0].image_base64,
          imageLength: mentions[0].image_base64?.length || 0,
          imageType: mentions[0].image_base64 ? typeof mentions[0].image_base64 : 'none',
          imageStartsWith: mentions[0].image_base64?.substring(0, 30) || 'N/A'
        }
      });
    }
  }, [mentions]);

  return (
    <div className="rounded-md border overflow-hidden">
      <div className="min-w-[800px] md:min-w-0 overflow-x-auto">
        <Table className="[&_tr]:h-auto">
          <TableHeader>
            <TableRow>
              <TableHead className="text-center align-middle">Plataforma</TableHead>
              <TableHead className="text-center align-middle">Fuente</TableHead>
              <TableHead className="text-center align-middle">Fecha</TableHead>
              <TableHead className="text-center align-middle">Imagen</TableHead>
              <TableHead className="text-center align-middle min-w-[200px]">Contenido</TableHead>
              <TableHead className="text-center align-middle min-w-[150px]">Razón Específica</TableHead>
              <TableHead className="text-center align-middle min-w-[150px]">Comentario Principal</TableHead>
              <TableHead className="text-center align-middle">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mentions.map((mention) => (
              <TableRow key={mention.id}>
                <TableCell className="text-center align-middle">
                  <div className="flex justify-center">
                    {getPlatformIcon(mention.platform)}
                  </div>
                </TableCell>
                <TableCell className="text-center align-middle">
                  <div className="flex flex-col items-center justify-center h-full">
                    <span className="text-sm font-medium">{mention.sourceName}</span>
                    {mention.sourceUrl && (
                      <Link 
                        href={mention.sourceUrl} 
                        target="_blank"
                        className="text-xs text-blue-500 hover:underline mt-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Ver perfil
                      </Link>
                    )}
                  </div>
                </TableCell>
            
                <TableCell className="text-center align-middle">
                  <div className="flex flex-col items-center justify-center h-full">
                    <span className="whitespace-nowrap">
                      {new Date(mention.publishedAt).toLocaleDateString('es-BO', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit'
                      })}
                    </span>
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                      {new Date(mention.publishedAt).toLocaleTimeString('es-BO', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="w-20 align-middle">
                  <div className="relative w-16 h-16 mx-auto">
                    {isValidBase64Image(mention.image_base64) ? (
                      <div className="relative w-full h-full">
                        <img
                          src={formatImageUrl(mention.image_base64) || ''}
                          alt={`Mencion de ${mention.sourceName}`}
                          className="w-full h-full object-cover rounded-md"
                          onError={(e) => {
                            console.error('Error cargando imagen para mención:', mention.id, e);
                            handleImageError(mention.id);
                          }}
                          onLoad={() => handleImageLoad(mention.id)}
                        />
                        {!loadedImages.has(mention.id) && !imageErrors.has(mention.id) && (
                          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-md">
                            <div className="animate-pulse w-full h-full bg-gray-200 rounded-md"></div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-md text-gray-400">
                        {mention.image_base64 ? (
                          <span className="text-xs text-center p-2">
                            Formato de imagen no válido
                          </span>
                        ) : (
                          <ImageIcon className="h-5 w-5" />
                        )}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="whitespace-normal align-middle">
                  <div className="px-2 line-clamp-3 text-center">
                    {mention.content}
                  </div>
                </TableCell>
                <TableCell className="whitespace-normal align-middle">
                  <div className="text-sm font-medium text-center">
                    {mention.razon_especifica || '-'}
                  </div>
                </TableCell>
                <TableCell className="whitespace-normal align-middle">
                  <div className="px-2">
                    {mention.comentario_principal ? (
                      <div className="text-sm text-gray-600 italic text-center">
                        "{mention.comentario_principal}"
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400 text-center block">-</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="align-middle">
                  <div className="flex justify-center gap-2">
                    <Link 
                      href={mention.mentionUrl} 
                      target="_blank"  
                      className="text-blue-500 hover:underline whitespace-nowrap" 
                      rel="noopener noreferrer"
                    >
                      Ver post
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
