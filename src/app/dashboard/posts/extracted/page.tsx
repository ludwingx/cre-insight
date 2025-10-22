"use client"

import { useState, useEffect, useMemo } from "react"
import { Separator } from "@/components/ui/separator"
import { PostTable, type Post } from "@/components/extracted/PostTable"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { RefreshCw, Scissors, Search, Filter, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DateRange } from "react-day-picker"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { getCurrentMonthRange, formatDateForAPI } from "@/lib/date-utils"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

type SortOption = 'date-desc' | 'date-asc' | 'likes-desc' | 'likes-asc' | 'comments-desc' | 'comments-asc' | 'shares-desc' | 'shares-asc' | 'views-desc' | 'views-asc'

export default function ExtractedPostsPage() {
  const [allPosts, setAllPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState<DateRange | undefined>(getCurrentMonthRange())
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all")
  const [contentType, setContentType] = useState<string>("all")
  const [sortBy, setSortBy] = useState<SortOption>('date-desc')
  type SeguimientoFilter = 'all' | 'tracked' | 'not-tracked'
  const [seguimientoFilter, setSeguimientoFilter] = useState<SeguimientoFilter>('all')

  // Available platforms and content types for filters
  const platforms = useMemo(() => {
    // Return fixed list of social networks
    return ['Facebook', 'Instagram', 'TikTok']
  }, [])
  
  const postContentTypes = useMemo(() => {
    return Array.from(new Set(allPosts.map(post => post.tipoContenido))).filter(Boolean) as string[]
  }, [allPosts])

  // Apply all filters and sorting
  const filteredPosts = useMemo(() => {
    let filtered = allPosts.filter(post => {
      // Text search
      const matchesSearch = !searchTerm || 
        post.texto.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (post.perfil && post.perfil.toLowerCase().includes(searchTerm.toLowerCase()))
      
      // Platform filter
      const matchesPlatform = selectedPlatform === "all" || selectedPlatform === post.redsocial
      
      // Content type filter
      const matchesContentType = contentType === "all" || post.tipoContenido === contentType
      
      // Filter by seguimiento
      const matchesSeguimiento = 
        seguimientoFilter === 'all' || 
        (seguimientoFilter === 'tracked' && post.seguimiento) ||
        (seguimientoFilter === 'not-tracked' && !post.seguimiento)
      
      return matchesSearch && matchesPlatform && matchesContentType && matchesSeguimiento
    })

    // Apply sorting
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'likes-asc': return (a.likes || 0) - (b.likes || 0)
        case 'likes-desc': return (b.likes || 0) - (a.likes || 0)
        case 'comments-asc': return (a.comentarios || 0) - (b.comentarios || 0)
        case 'comments-desc': return (b.comentarios || 0) - (a.comentarios || 0)
        case 'shares-asc': return (a.compartidos || 0) - (b.compartidos || 0)
        case 'shares-desc': return (b.compartidos || 0) - (a.compartidos || 0)
        case 'views-asc': return (a.vistas || 0) - (b.vistas || 0)
        case 'views-desc': return (b.vistas || 0) - (a.vistas || 0)
        case 'date-asc': return new Date(a.fechapublicacion).getTime() - new Date(b.fechapublicacion).getTime()
        case 'date-desc':
        default:
          return new Date(b.fechapublicacion).getTime() - new Date(a.fechapublicacion).getTime()
      }
    })
  }, [allPosts, searchTerm, selectedPlatform, contentType, sortBy, seguimientoFilter])

  const fetchPosts = async (from?: Date, to?: Date) => {
    try {
      setLoading(true)
      const url = new URL('/api/posts/extracted', window.location.origin)
      
      if (from && to) {
        const startOfDay = new Date(from)
        startOfDay.setHours(0, 0, 0, 0)
        
        const endOfDay = new Date(to)
        endOfDay.setHours(23, 59, 59, 999)
        
        url.searchParams.append('from', formatDateForAPI(startOfDay))
        url.searchParams.append('to', formatDateForAPI(endOfDay))
      }
      
      const res = await fetch(url.toString())
      const data = await res.json()
      setAllPosts(data.posts || [])
    } catch (error) {
      console.error('Error fetching posts:', error)
      setAllPosts([])
    } finally {
      setLoading(false)
    }
  }

  // Fetch posts when date range changes
  useEffect(() => {
    const fetchData = async () => {
      if (dateRange?.from) {
        const fromDate = dateRange.from
        const toDate = dateRange.to || new Date()
        
        const startOfDay = new Date(fromDate)
        startOfDay.setHours(0, 0, 0, 0)
        
        const endOfDay = new Date(toDate)
        endOfDay.setHours(23, 59, 59, 999)
        
        await fetchPosts(startOfDay, endOfDay)
      } else {
        await fetchPosts()
      }
    }
    
    fetchData()
  }, [dateRange])

  // Format date range display
  const formatDateRange = () => {
    if (!dateRange?.from) return 'Selecciona un rango de fechas'
    
    const from = dateRange.from
    const to = dateRange.to || dateRange.from
    
    if (from.getTime() === to.getTime()) {
      return format(from, "d 'de' MMMM 'de' yyyy", { locale: es })
    }
    
    if (from.getMonth() === to.getMonth() && from.getFullYear() === to.getFullYear()) {
      return `${from.getDate()} - ${to.getDate()} de ${format(from, 'MMMM', { locale: es })} ${from.getFullYear()}`
    }
    
    return `${format(from, 'd MMM yyyy', { locale: es })} - ${format(to, 'd MMM yyyy', { locale: es })}`
  }

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedPlatform("all")
    setContentType("all")
    setSortBy('date-desc')
    setSeguimientoFilter('all')
  }

  const hasActiveFilters = searchTerm || selectedPlatform !== "all" || contentType !== "all" || sortBy !== 'date-desc' || seguimientoFilter !== 'all'

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex h-16 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 px-4">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb className="truncate">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="#">Publicaciones Extraídas</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="flex items-center h-full py-2">
          <img 
            src="https://www.cre.com.bo/wp-content/uploads/2024/10/logo-cre-fb.jpg" 
            alt="CRE Logo" 
            className="h-full w-auto object-contain"
          />
        </div>
      </header>
      
      <main className="flex-1 p-4 md:p-6">
        <div className="flex flex-col space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Publicaciones Extraídas</h1>
              <p className="text-muted-foreground">
                Visualiza y gestiona las publicaciones extraídas de redes sociales
              </p>
            </div>
          </div>
{/* Filters Card - Compacta */}
{/* Tools & Filters - Sin card */}
<div className="space-y-4">
  {/* Header */}
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2">
      <Filter className="h-4 w-4 text-muted-foreground" />
      <h3 className="text-base font-semibold">
        Herramientas y Filtros
      </h3>
    </div>
    {hasActiveFilters && (
      <Button variant="ghost" size="sm" onClick={clearFilters} className="h-7 px-2 text-xs">
        <X className="h-3 w-3 mr-1" />
        Limpiar
      </Button>
    )}
  </div>

  {/* Filtros y botones */}
  <div className="flex flex-wrap items-end gap-3">
    {/* Date Range Picker */}
    <div className="min-w-[200px]">
      <Label className="text-xs mb-2 block">Fechas</Label>
      <DateRangePicker 
        date={dateRange}
        onDateChange={setDateRange}
        className="h-8"
        fromPlaceholder="Desde"
        toPlaceholder="Hasta"
      />
    </div>

    {/* Search */}
    <div className="min-w-[160px]">
      <Label htmlFor="search" className="text-xs mb-2 block">Buscar</Label>
      <div className="relative">
        <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
        <Input
          id="search"
          placeholder="Texto o perfil..."
          className="pl-7 h-8 text-xs"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
    </div>

    {/* Platform Filter */}
    <div className="min-w-[130px]">
      <Label htmlFor="platform" className="text-xs mb-2 block">Red Social</Label>
      <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
        <SelectTrigger id="platform" className="h-8 text-xs hover:cursor-pointer">
          <SelectValue placeholder="Todas" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all" className="text-xs">Todas</SelectItem>
          <SelectItem value="Facebook" className="text-xs">Facebook</SelectItem>
          <SelectItem value="Instagram" className="text-xs">Instagram</SelectItem>
          <SelectItem value="TikTok" className="text-xs">TikTok</SelectItem>
        </SelectContent>
      </Select>
    </div>

    {/* Content Type Filter */}
    <div className="min-w-[130px]">
      <Label htmlFor="content-type" className="text-xs mb-2 block">Tipo</Label>
      <Select value={contentType} onValueChange={setContentType}>
        <SelectTrigger id="content-type" className="h-8 text-xs hover:cursor-pointer">
          <SelectValue placeholder="Todos" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all" className="text-xs">Todos</SelectItem>
          {postContentTypes.map(type => (
            <SelectItem key={type} value={type} className="text-xs">
              {type}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>

    {/* Sort Filter */}
    <div className="min-w-[140px]">
      <Label htmlFor="sort" className="text-xs mb-2 block">Ordenar</Label>
      <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
        <SelectTrigger id="sort" className="h-8 text-xs hover:cursor-pointer">
          <SelectValue placeholder="Orden..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="date-desc" className="text-xs">Más recientes</SelectItem>
          <SelectItem value="date-asc" className="text-xs">Más antiguos</SelectItem>
          <SelectItem value="likes-desc" className="text-xs">Más likes</SelectItem>
          <SelectItem value="likes-asc" className="text-xs">Menos likes</SelectItem>
        </SelectContent>
      </Select>
    </div>

    {/* Seguimiento Filter */}
    <div className="min-w-[150px]">
      <Label htmlFor="tracked-filter" className="text-xs mb-2 block">Seguimiento</Label>
      <Select 
        value={seguimientoFilter}
        onValueChange={(value: SeguimientoFilter) => setSeguimientoFilter(value)}
      >
        <SelectTrigger id="tracked-filter" className="h-8 text-xs hover:cursor-pointer">
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all" className="text-xs">Todos</SelectItem>
          <SelectItem value="tracked" className="text-xs">Con seguimiento</SelectItem>
          <SelectItem value="not-tracked" className="text-xs">Sin seguimiento</SelectItem>
        </SelectContent>
      </Select>
    </div>


    <div className="flex items-end gap-2 ml-auto">
      <Button 
        variant="default" 
        size="sm"
        onClick={() => dateRange?.from && fetchPosts(dateRange.from, dateRange.to || dateRange.from)} 
        disabled={loading}
        className="h-8 px-3 text-xs gap-1.5 hover:cursor-pointer border hover:bg-white hover:text-black hover:border"
      >
        <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
        {loading ? 'Actualizando...' : 'Actualizar'}
      </Button>
      <Button 
        variant="default" 
        size="sm" 
        onClick={async () => {
          try {
            const response = await fetch('https://intelexia-labs-n8n.af9gwe.easypanel.host/webhook-test/creinsights', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                action: 'start_scraping',
                timestamp: new Date().toISOString()
              })
            });
            
            if (!response.ok) {
              throw new Error('Error al iniciar el scraping');
            }
            
            alert('Scraping iniciado correctamente');
          } catch (error) {
            console.error('Error al iniciar scraping:', error);
            alert('Error al iniciar el scraping. Por favor, inténtalo de nuevo.');
          }
        }}
        className="h-8 px-3 text-xs gap-1.5 hover:cursor-pointer border hover:bg-white hover:text-black hover:border"
      >
        <Scissors className="h-3 w-3 " />
        Extraer
      </Button>
    </div>
  </div>
</div>


{/* Posts Table - Con border */}
<div className="rounded-lg p-6">
  {loading ? (
    <div className="flex justify-center items-center h-32">
      <p className="text-muted-foreground">Cargando publicaciones...</p>
    </div>
  ) : allPosts.length === 0 ? (
    <div className="flex justify-center items-center h-32">
      <p className="text-muted-foreground">No hay publicaciones en el rango de fechas seleccionado.</p>
    </div>
  ) : filteredPosts.length === 0 ? (
    <div className="flex flex-col items-center justify-center h-32 space-y-2">
      <p className="text-muted-foreground">No se encontraron publicaciones con los filtros actuales.</p>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={clearFilters}
      >
        Limpiar filtros
      </Button>
    </div>
  ) : (
    <PostTable posts={filteredPosts} />
  )}
</div>
        </div>
      </main>
    </div>
  )
}