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
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Eye,
  Share2,
  MessageSquare,
  ThumbsUp,
  TrendingUp,
  BarChart3,
  Zap,
  Heart,
  Calendar,
  Target,
  Users
} from "lucide-react"

type TrackingPoint = {
  date: string
  likes: number
  comentarios: number
  compartidos: number
  vistas: number
  engagement: number
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
  vistas: number
  url_publicacion?: string
  url_imagen?: string
}

// Componente de métricas compacto
function MetricCard({
  label,
  value,
  icon: Icon,
  trend,
  description
}: {
  label: string
  value: string | number
  icon: any
  trend?: number
  description?: string
}) {
  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            <p className="text-xl font-bold">{value}</p>
            {trend !== undefined && (
              <div className="flex items-center gap-1">
                <TrendingUp className={`h-3 w-3 ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`} />
                <span className={`text-xs ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {trend >= 0 ? '+' : ''}{trend}%
                </span>
              </div>
            )}
          </div>
          <div className="p-2 rounded-full bg-primary/10">
            <Icon className="h-4 w-4 text-primary" />
          </div>
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-2">{description}</p>
        )}
      </CardContent>
    </Card>
  )
}

// Loader y NotFound
function Loader() {
  return (
    <div className="flex items-center justify-center h-[70vh]">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground">Cargando información del post...</p>
      </div>
    </div>
  )
}

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-[70vh] space-y-4">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Post no encontrado</h2>
        <p className="text-muted-foreground">No se pudo encontrar el post solicitado.</p>
      </div>
      <Link href="/dashboard/posts/extracted">
        <Button>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver a publicaciones
        </Button>
      </Link>
    </div>
  )
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
            vistas: data.post.vistas || 0,
            url_publicacion: data.post.url_publicacion,
            url_imagen: data.post.url_imagen,
          })
        }

        if (data.tracking && Array.isArray(data.tracking)) {
          const filteredTracking = data.tracking.filter((item: any) => !item.isInitial)

          const processedData = filteredTracking.map((item: any, index: number) => {
            const likes = item.likes || 0
            const comments = item.comments || item.comentarios || 0
            const shares = item.shares || item.compartidos || 0
            const views = item.views || item.vistas || 0
            const engagement = ((likes + comments + shares) / Math.max(views, 1)) * 100

            return {
              date: formatDateForDisplay(item.date || item.fecha || item.collectedAt),
              likes,
              comentarios: comments,
              compartidos: shares,
              vistas: views,
              engagement: Math.min(engagement, 100)
            }
          })

          setTrackingData(processedData)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

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

  // Cálculos de métricas
  const totalEngagement = (post?.likes || 0) + (post?.comentarios || 0) + (post?.compartidos || 0)
  const engagementRate = ((totalEngagement / Math.max(post?.vistas || 1, 1)) * 100)
  const avgEngagementPerDay = trackingData.length > 0
    ? totalEngagement / trackingData.length
    : 0

  // Datos para gráficos
  const engagementByType = [
    { name: 'Likes', value: post?.likes || 0, color: '#3b82f6' },
    { name: 'Comentarios', value: post?.comentarios || 0, color: '#10b981' },
    { name: 'Compartidos', value: post?.compartidos || 0, color: '#f59e0b' }
  ]

  const performanceData = [
    { metric: 'Alcance', score: Math.min(100, Math.log10((post?.vistas || 0) + 1) * 25) },
    { metric: 'Engagement', score: Math.min(100, engagementRate * 2) },
    { metric: 'Viralidad', score: Math.min(100, ((post?.compartidos || 0) / Math.max(post?.likes || 1, 1)) * 50) },
    { metric: 'Conversación', score: Math.min(100, ((post?.comentarios || 0) / Math.max(totalEngagement, 1)) * 100) },
  ]

  if (loading) return <Loader />
  if (!post) return <NotFound />

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background border-b border-border px-6 py-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/posts/extracted">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Seguimiento de Publicación</h1>
            <p className="text-sm text-muted-foreground">
              Análisis detallado del rendimiento
            </p>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Columna izquierda: Post y métricas básicas */}
          <div className="space-y-6">
            {/* Tarjeta del post */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Image
                    src="/logos/cre-logo.png"
                    alt="CRE"
                    width={40}
                    height={40}
                    className="rounded-full border flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="font-semibold text-base">CRE R.L. Cooperativa Rural de Electrificación</h2>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {post.redsocial}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(post.fecha).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground leading-relaxed mt-3 line-clamp-4">
                      {post.texto}
                    </p>

                    {post.url_publicacion && (
                      <Button asChild variant="outline" size="sm" className="mt-3">
                        <a href={post.url_publicacion} target="_blank" rel="noopener noreferrer">
                          Ver publicación original
                        </a>
                      </Button>
                    )}
                  </div>
                </div>

                {/* Imagen del post */}
                <div className="mt-4">
                  <div className="relative aspect-video w-full rounded-lg overflow-hidden border bg-muted">
                    {post.url_imagen ? (
                      <Image
                        src={post.url_imagen}
                        alt="Imagen del post"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex w-full h-full items-center justify-center">
                        <Image
                          src="/logos/cre-logo.png"
                          alt="Logo CRE"
                          width={60}
                          height={60}
                          className="object-contain opacity-50"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Métricas rápidas */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Likes</p>
                      <p className="text-lg font-bold">{post.likes?.toLocaleString()}</p>
                    </div>
                    <ThumbsUp className="h-4 w-4 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Comentarios</p>
                      <p className="text-lg font-bold">{post.comentarios?.toLocaleString()}</p>
                    </div>
                    <MessageSquare className="h-4 w-4 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Compartidos</p>
                      <p className="text-lg font-bold">{post.compartidos?.toLocaleString()}</p>
                    </div>
                    <Share2 className="h-4 w-4 text-amber-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Vistas</p>
                      <p className="text-lg font-bold">{post.vistas?.toLocaleString()}</p>
                    </div>
                    <Eye className="h-4 w-4 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Distribución de interacciones */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Distribución de Interacciones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {engagementByType.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm">{item.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-medium">{item.value.toLocaleString()}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          ({((item.value / Math.max(totalEngagement, 1)) * 100).toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Columna derecha: Análisis detallado */}
          <div className="space-y-6">
            {/* Métricas principales */}
            <div className="grid grid-cols-2 gap-4">
              <MetricCard
                label="Alcance Total"
                value={post.vistas?.toLocaleString() || '0'}
                icon={Eye}
                trend={8.2}
                description="Personas alcanzadas"
              />
              <MetricCard
                label="Interacción Total"
                value={totalEngagement.toLocaleString()}
                icon={ThumbsUp}
                trend={12.5}
                description="Total engagements"
              />
              <MetricCard
                label="Tasa Engagement"
                value={`${engagementRate.toFixed(1)}%`}
                icon={BarChart3}
                trend={3.1}
                description="Porcentaje"
              />
              <MetricCard
                label="Engagement/día"
                value={Math.round(avgEngagementPerDay)}
                icon={TrendingUp}
                description="Promedio diario"
              />
            </div>

            {/* Tabs para análisis */}
            <Tabs defaultValue="evolution" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="evolution">Evolución</TabsTrigger>
                <TabsTrigger value="performance">Rendimiento</TabsTrigger>
                <TabsTrigger value="breakdown">Análisis</TabsTrigger>
              </TabsList>

              {/* Evolución */}
              <TabsContent value="evolution" className="space-y-4 mt-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Evolución de Métricas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {trackingData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={trackingData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" fontSize={10} />
                          <YAxis fontSize={10} />
                          <Tooltip />
                          <Line type="monotone" dataKey="likes" stroke="#3b82f6" strokeWidth={2} name="Likes" />
                          <Line type="monotone" dataKey="comentarios" stroke="#10b981" strokeWidth={2} name="Comentarios" />
                          <Line type="monotone" dataKey="compartidos" stroke="#f59e0b" strokeWidth={2} name="Compartidos" />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground text-sm">
                        No hay datos de seguimiento disponibles
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Resumen de Actividad</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                          <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Pico de Likes</p>
                          <p className="text-lg font-bold text-blue-700 dark:text-blue-300">
                            {Math.max(...trackingData.map(d => d.likes), 0).toLocaleString()}
                          </p>
                        </div>
                        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                          <p className="text-xs text-green-600 dark:text-green-400 font-medium">Pico de Comentarios</p>
                          <p className="text-lg font-bold text-green-700 dark:text-green-300">
                            {Math.max(...trackingData.map(d => d.comentarios), 0).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        La publicación ha mostrado un comportamiento {engagementRate > 5 ? "muy activo" : "estable"} en los últimos días.
                        El mayor crecimiento se registró el {trackingData.length > 0 ? trackingData[trackingData.length - 1].date : "recientemente"}.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Rendimiento */}
              <TabsContent value="performance" className="space-y-4 mt-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Análisis de Rendimiento</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {performanceData.map((item, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>{item.metric}</span>
                          <span>{item.score.toFixed(0)}%</span>
                        </div>
                        <Progress value={item.score} className="h-1.5" />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Distribución de Interacciones</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-center">
                      <ResponsiveContainer width="100%" height={180}>
                        <PieChart>
                          <Pie
                            data={engagementByType}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={70}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {engagementByType.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="mt-4 space-y-3">
                      {engagementByType.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: item.color }}
                            />
                            <span className="text-sm font-medium">{item.name}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-bold">{item.value.toLocaleString()}</span>
                            <span className="text-xs text-muted-foreground w-12 text-right">
                              {((item.value / Math.max(totalEngagement, 1)) * 100).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Análisis */}
              <TabsContent value="breakdown" className="space-y-4 mt-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Ratios de Viralidad</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span>Compartidos/Likes</span>
                        <span className="font-medium">
                          {((post.compartidos / Math.max(post.likes, 1)) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <Progress
                        value={Math.min((post.compartidos / Math.max(post.likes, 1)) * 100, 100)}
                        className="h-1.5"
                      />

                      <div className="flex justify-between items-center text-sm">
                        <span>Comentarios/Likes</span>
                        <span className="font-medium">
                          {((post.comentarios / Math.max(post.likes, 1)) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <Progress
                        value={Math.min((post.comentarios / Math.max(post.likes, 1)) * 100, 100)}
                        className="h-1.5"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Métricas Adicionales</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between p-2 bg-muted rounded text-sm">
                      <span>Alcance por Interacción</span>
                      <span className="font-medium">
                        {Math.round((post.vistas || 0) / Math.max(totalEngagement, 1))}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-muted rounded text-sm">
                      <span>Valor por Interacción</span>
                      <span className="font-medium text-green-600">
                        {((totalEngagement / Math.max(post.vistas || 1, 1)) * 100).toFixed(2)}%
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Conclusiones</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm text-muted-foreground">
                      <div className="flex gap-2">
                        <Target className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <p>
                          El contenido tiene un <span className="font-medium text-foreground">
                            {engagementRate > 5 ? "alto" : engagementRate > 2 ? "medio" : "bajo"}
                          </span> nivel de engagement ({engagementRate.toFixed(1)}%).
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Users className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <p>
                          La audiencia está <span className="font-medium text-foreground">
                            {post.compartidos > post.comentarios ? "compartiendo activamente" : "comentando activamente"}
                          </span>, lo que sugiere interés en {post.compartidos > post.comentarios ? "difundir" : "debatir"} el tema.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}