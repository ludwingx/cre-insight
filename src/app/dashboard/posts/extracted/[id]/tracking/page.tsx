"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

type TrackingPoint = {
  date: string
  likes: number
  comentarios: number
  compartidos: number
}

type PostDetail = {
  id: number
  perfil: string
  redsocial: string
  texto: string
  fecha: string
  likes: number
  comentarios: number
  compartidos: number
  url_publicacion?: string
  url_imagen?: string
}

export default function TrackingPage() {
  const { id } = useParams()
  const [post, setPost] = useState<PostDetail | null>(null)
  const [trackingData, setTrackingData] = useState<TrackingPoint[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const response = await fetch(`/api/posts/extracted/${id}`)
        if (!response.ok) throw new Error("Error al cargar los datos del post")
        const data = await response.json()
        
        console.log("Fecha desde BD:", data.post?.fecha)
        
        if (data.post) {
          setPost({
            id: data.post.id || 0,
            perfil: data.post.perfil || "",
            redsocial: data.post.redsocial || "",
            texto: data.post.texto || "",
            fecha: data.post.fecha,
            likes: data.post.likes || 0,
            comentarios: data.post.comentarios || 0,
            compartidos: data.post.compartidos || 0,
            url_publicacion: data.post.url_publicacion,
            url_imagen: data.post.url_imagen,
          })
        }

        if (data.tracking && Array.isArray(data.tracking)) {
          setTrackingData(
            data.tracking.map((item: any) => ({
              date: formatDateForDisplay(item.date || item.fecha),
              likes: item.likes || 0,
              comentarios: item.comentarios || 0,
              compartidos: item.compartidos || 0,
            }))
          )
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  // Función para formatear fechas como Facebook - CORREGIDA
  const formatDateLikeFacebook = (dateString: string) => {
    try {
      if (!dateString) {
        return 'Fecha no disponible'
      }
      
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        return 'Fecha no disponible'
      }
      
      // Usar la zona horaria de Bolivia directamente
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'America/La_Paz' // Zona horaria de Bolivia
      }
      
      const dateTimeString = date.toLocaleDateString('es-ES', options)
      return dateTimeString.replace(',', ' a las') 
    } catch (error) {
      console.error("Error formateando fecha:", error)
      return 'Fecha no disponible'
    }
  }

  // Función para formatear fechas para el gráfico
  const formatDateForDisplay = (dateString: string | undefined) => {
    try {
      if (!dateString) return 'Sin fecha'
      
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return 'Inválida'
      
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'America/La_Paz'
      })
    } catch {
      return 'Inválida'
    }
  }

  // Función para formatear solo la fecha (sin hora)
  const formatDateOnly = (dateString: string) => {
    try {
      if (!dateString) return 'Fecha no disponible'
      
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return 'Fecha no disponible'
      
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        timeZone: 'America/La_Paz'
      })
    } catch {
      return 'Fecha no disponible'
    }
  }

  if (loading) return <Loader />
  if (!post) return <NotFound />

  return (
    <main className="min-h-screen bg-background p-6">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/posts/extracted">
            <Button variant="outline" size="sm" className="flex items-center gap-2 cursor-pointer">
              <ArrowLeft className="w-4 h-4" />
              Volver
            </Button>
          </Link>
          <h1 className="text-xl font-semibold">
            Evolución de la publicación
          </h1>
        </div>
      </header>

      {/* Contenedor principal: 50% / 50% */}
      <div className="flex flex-col lg:flex-row gap-6 mt-6 w-full max-w-full mx-auto">
        {/* 🧾 Card del Post */}
        <Card className="lg:w-1/2 shadow-sm border border-border">
          <CardHeader className="flex items-center gap-3">
            {post.url_imagen && (
              <Image
                src="/logos/cre-logo.png"
                alt="CRE R.L. Cooperativa Rural de Electrificación"
                width={48}
                height={48}
                className="rounded-full border object-cover"
              />
            )}
            <div>
              <CardTitle className="text-lg">CRE R.L. Cooperativa Rural de Electrificación</CardTitle>
              <p className="text-xs text-muted-foreground">
                {post.redsocial} • {formatDateLikeFacebook(post.fecha)}
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground line-clamp-3">{post.texto}</p>

            {post.url_imagen && (
              <div className="relative w-full max-w-sm mx-auto rounded-md overflow-hidden">
                <Image
                  src={post.url_imagen}
                  alt="Imagen del post"
                  width={400}
                  height={220}
                  className="object-cover w-full h-auto border"
                />
              </div>
            )}

            <div className="grid grid-cols-3 gap-2 text-center mt-2">
              <MetricCard label="Likes" value={post.likes} color="text-blue-500" small />
              <MetricCard label="Comentarios" value={post.comentarios} color="text-green-500" small />
              <MetricCard label="Compartidos" value={post.compartidos} color="text-yellow-500" small />
            </div>

            {post.url_publicacion && (
              <Link href={post.url_publicacion} target="_blank">
                <Button variant="outline" size="sm" className="w-full mt-2 cursor-pointer">
                  Ver publicación
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>

        {/* 📊 Mini Chart de Evolución */}
        <Card className="lg:w-1/2 shadow-md border border-border">
          <CardHeader>
            <CardTitle className="text-lg">Evolución diaria</CardTitle>
            <p className="text-xs text-muted-foreground">
              Desde {formatDateOnly(post.fecha)} hasta hoy
            </p>
          </CardHeader>
          <CardContent>
            {trackingData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trackingData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 10 }} 
                  />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      borderRadius: 8,
                      border: "1px solid #e5e7eb",
                    }}
                  />
                  <Legend verticalAlign="top" height={24} wrapperStyle={{ fontSize: 10 }} />
                  <Line type="monotone" dataKey="likes" stroke="#3b82f6" strokeWidth={2} dot={{ r: 2 }} name="Likes" />
                  <Line type="monotone" dataKey="comentarios" stroke="#22c55e" strokeWidth={2} dot={{ r: 2 }} name="Comentarios" />
                  <Line type="monotone" dataKey="compartidos" stroke="#f59e0b" strokeWidth={2} dot={{ r: 2 }} name="Compartidos" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-10">
                No hay datos de seguimiento disponibles.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

/* Componente reutilizable de métricas compacto */
function MetricCard({ label, value, color, small }: { label: string; value: number; color?: string; small?: boolean }) {
  return (
    <div className={`${small ? "p-2" : "p-4"} bg-muted rounded-lg flex flex-col items-center justify-center shadow-sm transition hover:bg-muted/70`}>
      <p className={`${small ? "text-lg" : "text-2xl"} font-bold ${color}`}>{value}</p>
      <p className={`${small ? "text-[10px]" : "text-xs"} text-muted-foreground uppercase tracking-wide`}>{label}</p>
    </div>
  )
}

/* Loader y NotFound */
function Loader() {
  return <div className="flex items-center justify-center h-[70vh] text-muted-foreground">Cargando información del post...</div>
}
function NotFound() {
  return <div className="flex items-center justify-center h-[70vh] text-muted-foreground">No se encontró el post solicitado.</div>
}