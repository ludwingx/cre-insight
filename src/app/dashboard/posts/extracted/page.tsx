"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { toast } from "sonner"
import { Separator } from "@/components/ui/separator"
import { PostTable, type Post } from "@/components/extracted/PostTable"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { RefreshCw, Scissors, Search, Filter, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DateRange } from "@/components/ui/date-range-picker"
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
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState<DateRange>(getCurrentMonthRange())
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all")
  const [contentType, setContentType] = useState<string>("all")
  const [sortBy, setSortBy] = useState<SortOption>('date-desc')
  type SeguimientoFilter = 'all' | 'tracked' | 'not-tracked'
  const [seguimientoFilter, setSeguimientoFilter] = useState<SeguimientoFilter>('all')

  // Available platforms and content types for filters
  const platforms = useMemo(() => {
    return ['Facebook', 'Instagram', 'TikTok']
  }, [])
  
  const postContentTypes = useMemo(() => {
    return Array.from(new Set(allPosts.map(post => post.tipoContenido))).filter(Boolean) as string[]
  }, [allPosts])

  // Fetch posts from the API
  const fetchPosts = useCallback(async (startDate: Date, endDate: Date) => {
    setLoading(true);
    try {
      const url = new URL('/api/posts/extracted', window.location.origin);
      
      if (startDate && endDate) {
        const startOfDay = new Date(startDate);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        
        url.searchParams.append('from', startOfDay.toISOString());
        url.searchParams.append('to', endOfDay.toISOString());
      }
      
      console.log('Fetching posts from:', url.toString());
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`Error al cargar las publicaciones (${response.status}): ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Fetched posts:', data);
      
      if (!Array.isArray(data.posts)) {
        console.error('Unexpected response format:', data);
        throw new Error('Formato de respuesta inesperado del servidor');
      }
      
      setAllPosts(data.posts);
      return data.posts;
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error(error instanceof Error ? error.message : 'Error al cargar las publicaciones');
      setAllPosts([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Apply all filters and sorting
  const applyFiltersAndSorting = useCallback((posts: Post[]) => {
    let filtered = posts.filter(post => {
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

    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'date-desc': return new Date(b.fechapublicacion).getTime() - new Date(a.fechapublicacion).getTime()
        case 'date-asc': return new Date(a.fechapublicacion).getTime() - new Date(b.fechapublicacion).getTime()
        case 'likes-desc': return (b.likes || 0) - (a.likes || 0)
        case 'likes-asc': return (a.likes || 0) - (b.likes || 0)
        case 'comments-desc': return (b.comentarios || 0) - (a.comentarios || 0)
        case 'comments-asc': return (a.comentarios || 0) - (b.comentarios || 0)
        case 'shares-desc': return (b.compartidos || 0) - (a.compartidos || 0)
        case 'shares-asc': return (a.compartidos || 0) - (b.compartidos || 0)
        case 'views-desc': return (b.vistas || 0) - (a.vistas || 0)
        case 'views-asc': return (a.vistas || 0) - (b.vistas || 0)
        default: return 0
      }
    });
    setFilteredPosts(sorted);
    return sorted;
  }, [searchTerm, selectedPlatform, contentType, sortBy, seguimientoFilter]);

  // Apply filters and sorting when dependencies change
  useEffect(() => {
    applyFiltersAndSorting(allPosts);
  }, [searchTerm, selectedPlatform, contentType, sortBy, seguimientoFilter, allPosts, applyFiltersAndSorting]);

  // Initial data load
  useEffect(() => {
    if (dateRange?.from) {
      fetchPosts(dateRange.from, dateRange.to || dateRange.from);
    }
  }, [dateRange, fetchPosts]);

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedPlatform("all")
    setContentType("all")
    setSeguimientoFilter('all')
    setSortBy('date-desc')
  }

  const hasActiveFilters = searchTerm || selectedPlatform !== "all" || contentType !== "all" || seguimientoFilter !== 'all' || sortBy !== 'date-desc';

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

          {/* Tools & Filters */}
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
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={clearFilters}
                  className="h-8 hover:bg-destructive hover:text-destructive-foreground"
                >
                  <X className="mr-2 h-3 w-3" />
                  Limpiar filtros
                </Button>
              )}
            </div>

            {/* Fila 1: Solo Fechas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg border">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Rango de fechas</Label>
                <div className="flex items-center gap-2">
                  <DateRangePicker 
                    date={dateRange}
                    onDateChange={setDateRange}
                    className="flex-1"
                    fromPlaceholder="Desde"
                    toPlaceholder="Hasta"
                  />
                </div>
              </div>
              
              {/* Botones de Acción en la misma fila */}
              <div className="flex items-end gap-2">
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={() => dateRange?.from && fetchPosts(dateRange.from, dateRange.to || dateRange.from)} 
                  disabled={loading}
                  className="h-9 flex-1 text-sm gap-1.5 hover:cursor-pointer border hover:bg-white hover:text-black hover:border"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  {loading ? 'Actualizando...' : 'Actualizar'}
                </Button>
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={async () => {
                    const toastId = toast.loading('Extrayendo nuevas publicaciones de Facebook...');
                    
                    try {
                      const requestBody = {
                        action: 'start_scraping',
                        timestamp: new Date().toISOString()
                      };
                      
                      const response = await fetch('https://intelexia-labs-n8n.af9gwe.easypanel.host/webhook-test/creinsights', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'Accept': 'application/json'
                        },
                        body: JSON.stringify(requestBody)
                      });
                      
                      let responseData;
                      try {
                        responseData = await response.json();
                      } catch (e) {
                        responseData = await response.text();
                      }
                      
                      if (!response.ok) {
                        const errorMessage = typeof responseData === 'object' && responseData.message 
                          ? responseData.message 
                          : response.statusText;
                        
                        throw new Error(`Error del servidor (${response.status}): ${errorMessage}`);
                      }
                      
                      toast.success('Extracción finalizada correctamente', { id: toastId });
                      
                      if (dateRange?.from) {
                        await fetchPosts(dateRange.from, dateRange.to || dateRange.from);
                      }
                      
                    } catch (error) {
                      console.error('Error al iniciar scraping:', error);
                      toast.error(
                        `Error al iniciar el scraping: ${error instanceof Error ? error.message : 'Error desconocido'}`, 
                        { id: toastId }
                      );
                    }
                  }}
                  className="h-9 flex-1 text-sm gap-1.5 hover:cursor-pointer border hover:bg-white hover:text-black hover:border"
                >
                  <Scissors className="h-4 w-4" />
                  Extraer
                </Button>
              </div>
            </div>

            {/* Fila 2: Filtros de Búsqueda y Filtrado */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 p-4 bg-muted/30 rounded-lg border">
              {/* Search */}
              <div className="space-y-2">
                <Label htmlFor="search" className="text-sm font-medium">Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Buscar por texto o perfil..."
                    className="pl-9 h-9 text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Platform Filter */}
              <div className="space-y-2">
                <Label htmlFor="platform" className="text-sm font-medium">Plataforma</Label>
                <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Todas las plataformas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="text-sm">Todas</SelectItem>
                    <SelectItem value="Facebook" className="text-sm">Facebook</SelectItem>
                    <SelectItem value="Instagram" className="text-sm">Instagram</SelectItem>
                    <SelectItem value="TikTok" className="text-sm">TikTok</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Content Type Filter */}
              <div className="space-y-2">
                <Label htmlFor="content-type" className="text-sm font-medium">Tipo de contenido</Label>
                <Select value={contentType} onValueChange={setContentType}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Todos los tipos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="text-sm">Todos</SelectItem>
                    {postContentTypes.map(type => (
                      <SelectItem key={type} value={type} className="text-sm">
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sort By */}
              <div className="space-y-2">
                <Label htmlFor="sort" className="text-sm font-medium">Ordenar por</Label>
                <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Seleccionar orden" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date-desc" className="text-sm">Más recientes</SelectItem>
                    <SelectItem value="date-asc" className="text-sm">Más antiguos</SelectItem>
                    <SelectItem value="likes-desc" className="text-sm">Más likes</SelectItem>
                    <SelectItem value="likes-asc" className="text-sm">Menos likes</SelectItem>
                    <SelectItem value="comments-desc" className="text-sm">Más comentarios</SelectItem>
                    <SelectItem value="comments-asc" className="text-sm">Menos comentarios</SelectItem>
                    <SelectItem value="shares-desc" className="text-sm">Más compartidos</SelectItem>
                    <SelectItem value="shares-asc" className="text-sm">Menos compartidos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Seguimiento Filter */}
              <div className="space-y-2">
                <Label htmlFor="tracked-filter" className="text-sm font-medium">Seguimiento</Label>
                <Select 
                  value={seguimientoFilter}
                  onValueChange={(value: SeguimientoFilter) => setSeguimientoFilter(value)}
                >
                  <SelectTrigger id="tracked-filter" className="h-9 text-sm hover:cursor-pointer">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="text-sm">Todos</SelectItem>
                    <SelectItem value="tracked" className="text-sm">Con seguimiento</SelectItem>
                    <SelectItem value="not-tracked" className="text-sm">Sin seguimiento</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Clear Filters Button */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-transparent">Acción</Label>
                {hasActiveFilters && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={clearFilters}
                    className="h-9 w-full hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Limpiar filtros
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Posts Table */}
          <div className="rounded-lg p-6 border">
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