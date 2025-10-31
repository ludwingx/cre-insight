"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip as RadarTooltip,
  Cell
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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

// Componente reutilizable de métricas compacto
function MetricCard({ label, value, color, small }: { label: string; value: number; color?: string; small?: boolean }) {
  return (
    <div className={`${small ? "p-2" : "p-4"} bg-muted rounded-lg flex flex-col items-center justify-center shadow-sm transition hover:bg-muted/70`}>
      <p className={`${small ? "text-lg" : "text-2xl"} font-bold ${color}`}>{value}</p>
      <p className={`${small ? "text-[10px]" : "text-xs"} text-muted-foreground uppercase tracking-wide`}>{label}</p>
    </div>
  )
}

// Loader y NotFound
function Loader() {
  return <div className="flex items-center justify-center h-[70vh] text-muted-foreground">Cargando información del post...</div>
}

function NotFound() {
  return <div className="flex items-center justify-center h-[70vh] text-muted-foreground">No se encontró el post solicitado.</div>
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
          // Filter out the initial data point (where isInitial is true)
          const filteredTracking = data.tracking.filter((item: any) => !item.isInitial);
          
          setTrackingData(
            filteredTracking.map((item: any) => ({
              date: formatDateForDisplay(item.date || item.fecha || item.collectedAt),
              likes: item.likes || 0,
              comentarios: item.comments || item.comentarios || 0,
              compartidos: item.shares || item.compartidos || 0,
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

  // Calculate engagement metrics for radar chart
  const engagementData = [
    {
      subject: 'Alcance',
      A: Math.min(100, Math.max(20, Math.log10(post.likes + 1) * 20)),
      fullMark: 100,
    },
    {
      subject: 'Interacción',
      A: Math.min(100, Math.max(20, Math.log10((post.likes + post.compartidos) / 2 + 1) * 25)),
      fullMark: 100,
    },
    {
      subject: 'Viralidad',
      A: Math.min(100, Math.max(20, Math.log10(post.compartidos * 5 + 1) * 20)),
      fullMark: 100,
    },
    {
      subject: 'Compromiso',
      A: Math.min(100, Math.max(20, ((post.likes + (post.compartidos * 3)) / 20) * 10)),
      fullMark: 100,
    },
  ]

  // Determine post category based on engagement metrics
  const getPostCategory = () => {
    if (post.comentarios > post.likes * 2) return '🔥 Polémico';
    if (post.compartidos > post.likes * 1.5) return '🚀 Viral';
    if (post.likes > post.comentarios * 5 && post.likes > post.compartidos * 8) return '👍 Alto Impacto';
    if (post.comentarios > 0 && post.compartidos > 0) return '💬 Conversación';
    return '📊 Promedio';
  }

  const postCategory = getPostCategory();

  return (
    <div className="min-h-screen bg-background p-6">
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

      {/* Contenedor principal */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
          {/* Card 1: Post Card */}
          <Card className="shadow-sm border border-border h-full">
            <CardHeader className="flex items-center gap-3">
              <Image
                src="/logos/cre-logo.png"
                alt="CRE R.L. Cooperativa Rural de Electrificación"
                width={48}
                height={48}
                className="rounded-full border object-cover"
              />
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

          {/* Card 2: Evolución Diaria */}
          <Card className="shadow-md border border-border">
            <CardHeader>
              <CardTitle className="text-lg">Evolución diaria</CardTitle>
              <CardDescription>Desde {formatDateOnly(post.fecha)} hasta hoy</CardDescription>
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

          {/* Card 3: Análisis de Impacto */}
          <Card className="shadow-sm border border-border h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Análisis de Impacto</CardTitle>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  postCategory.includes('Polémico') ? 'bg-amber-100 text-amber-800' :
                  postCategory.includes('Viral') ? 'bg-blue-100 text-blue-800' :
                  postCategory.includes('Alto Impacto') ? 'bg-green-100 text-green-800' :
                  postCategory.includes('Conversación') ? 'bg-purple-100 text-purple-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {postCategory}
                </div>
              </div>
            </CardHeader>
            <CardContent className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={engagementData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar
                    name="Nivel"
                    dataKey="A"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.6}
                  />
                  <RadarTooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white p-3 border border-gray-200 rounded shadow-sm">
                            <p className="font-medium">{payload[0].payload.subject}</p>
                            <p className="text-sm">Nivel: {Math.round(payload[0].value as number)}/100</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
              <div className="mt-2 text-sm text-muted-foreground text-center">
                <p className="font-medium mb-1">Categorías de impacto:</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full bg-amber-500"></span> 🔥 Polémico: Más comentarios que likes</div>
                  <div className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full bg-blue-500"></span> 🚀 Viral: Muchas veces compartido</div>
                  <div className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full bg-green-500"></span> 👍 Alto Impacto: Muchos likes</div>
                  <div className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full bg-purple-500"></span> 💬 Conversación: Buen balance de interacciones</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 4: Comparación de Interacciones */}
          <Card className="shadow-md border border-border">
            <CardHeader>
              <CardTitle className="text-lg">Comparación de Interacciones</CardTitle>
              <CardDescription>
                Distribución de las interacciones de la publicación
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={[
                    {
                      name: 'Interacciones',
                      likes: post.likes,
                      comentarios: post.comentarios,
                      compartidos: post.compartidos,
                    }
                  ]}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                  barGap={10}
                  barCategoryGap={20}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      borderRadius: 8,
                      border: "1px solid #e5e7eb",
                    }}
                    formatter={(value) => [value, 'Interacciones']}
                  />
                  <Legend />
                  <Bar dataKey="likes" name="Likes" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                    <Cell fill="#3b82f6" />
                  </Bar>
                  <Bar dataKey="comentarios" name="Comentarios" fill="#22c55e" radius={[4, 4, 0, 0]}>
                    <Cell fill="#22c55e" />
                  </Bar>
                  <Bar dataKey="compartidos" name="Compartidos" fill="#f59e0b" radius={[4, 4, 0, 0]}>
                    <Cell fill="#f59e0b" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-700">Likes</span>
                    <span className="text-lg font-bold text-blue-900">{post.likes.toLocaleString()}</span>
                  </div>
                  <div className="mt-2 w-full bg-blue-200 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: `${Math.min(100, (post.likes / Math.max(1, post.likes + post.comentarios + post.compartidos)) * 100)}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-green-700">Comentarios</span>
                    <span className="text-lg font-bold text-green-900">{post.comentarios.toLocaleString()}</span>
                  </div>
                  <div className="mt-2 w-full bg-green-200 rounded-full h-2.5">
                    <div 
                      className="bg-green-600 h-2.5 rounded-full" 
                      style={{ width: `${Math.min(100, (post.comentarios / Math.max(1, post.likes + post.comentarios + post.compartidos)) * 100)}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="bg-amber-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-amber-700">Compartidos</span>
                    <span className="text-lg font-bold text-amber-900">{post.compartidos.toLocaleString()}</span>
                  </div>
                  <div className="mt-2 w-full bg-amber-200 rounded-full h-2.5">
                    <div 
                      className="bg-amber-500 h-2.5 rounded-full" 
                      style={{ width: `${Math.min(100, (post.compartidos / Math.max(1, post.likes + post.comentarios + post.compartidos)) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}