"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Search, Filter, X } from "lucide-react";
import {
  MentionsTable,
  type Mention,
} from "@/components/reputation/MentionsTable";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";
import { getCurrentMonthRange } from "@/lib/date-utils";
import { toast } from "sonner";

// Define filter types based on Mention type
type SortOption = 'date-desc' | 'date-asc' | 'source-asc' | 'source-desc';
type PlatformFilter = 'all' | 'facebook' | 'instagram' | 'twitter' | 'youtube';
type SourceFilter = 'all' | 'facebook' | 'instagram' | 'twitter' | 'youtube' | 'otra';

export default function NegativesPage() {
  const [mentions, setMentions] = useState<Mention[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [dateRange, setDateRange] = useState<DateRange | undefined>(getCurrentMonthRange());
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformFilter>("all");
  const [selectedSource, setSelectedSource] = useState<SourceFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');

  // Fetch mentions from the API
  const fetchMentions = useCallback(async (startDate?: Date, endDate?: Date) => {
    try {
      setLoading(true);
      setError(null);
      
      const url = new URL('/api/mentions', window.location.origin);
      
      if (startDate && endDate) {
        const startOfDay = new Date(startDate);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        
        url.searchParams.append('from', startOfDay.toISOString());
        url.searchParams.append('to', endOfDay.toISOString());
      }
      
      console.log('Fetching mentions from:', url.toString());
      const response = await fetch(url.toString());

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`Error al cargar las menciones (${response.status}): ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Fetched mentions:', data);
      
      // DEBUG: Mostrar la estructura real de los datos
      if (data.length > 0) {
        console.log('🔍 Estructura del primer elemento:', data[0]);
        console.log('📋 Propiedades disponibles:', Object.keys(data[0]));
      }
      
      if (!Array.isArray(data)) {
        console.error('Unexpected response format:', data);
        throw new Error('Formato de respuesta inesperado del servidor');
      }
      
      setMentions(data);
      return data;
    } catch (err) {
      console.error("Error fetching mentions:", err);
      const errorMessage = err instanceof Error ? err.message : "Error al cargar las menciones. Por favor, intente nuevamente.";
      setError(errorMessage);
      toast.error(errorMessage);
      setMentions([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Apply filters and sorting - MEJORADO con búsqueda más robusta
  const filteredMentions = useMemo(() => {
    if (!mentions.length) return [];

    console.log('🔍 Aplicando filtros. Término de búsqueda:', searchTerm);

    let filtered = mentions.filter(mention => {
      // Search filter - búsqueda más robusta en TODOS los campos de texto
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm || 
        // Buscar en todos los campos de texto posibles
        Object.values(mention).some(value => {
          if (typeof value === 'string') {
            return value.toLowerCase().includes(searchLower);
          }
          return false;
        });
      
      // Platform filter
      const matchesPlatform = selectedPlatform === "all" || 
        (mention.platform && mention.platform.toLowerCase().includes(selectedPlatform.toLowerCase()));
      
      // Source filter - buscar en sourceName o cualquier campo que contenga la fuente
      const matchesSource = selectedSource === "all" || 
        (mention.sourceName && mention.sourceName.toLowerCase().includes(selectedSource.toLowerCase())) ||
        (mention.source && mention.source.toLowerCase().includes(selectedSource.toLowerCase())) ||
        (mention.platform && mention.platform.toLowerCase().includes(selectedSource.toLowerCase()));
      
      // Date filter
      let matchesDate = true;
      if (dateRange?.from) {
        const fromDate = new Date(dateRange.from);
        fromDate.setHours(0, 0, 0, 0);
        
        const toDate = dateRange.to ? new Date(dateRange.to) : new Date(dateRange.from);
        toDate.setHours(23, 59, 59, 999);
        
        // Buscar en múltiples campos de fecha posibles
        const mentionDate = mention.publishedAt ? new Date(mention.publishedAt) : 
                           mention.date ? new Date(mention.date) : 
                           mention.createdAt ? new Date(mention.createdAt) :
                           mention.fecha ? new Date(mention.fecha) : null;
        
        if (mentionDate) {
          matchesDate = mentionDate >= fromDate && mentionDate <= toDate;
        } else {
          matchesDate = false;
        }
      }
      
      const shouldInclude = matchesSearch && matchesPlatform && matchesSource && matchesDate;
      
      // DEBUG: Mostrar por qué se incluye o excluye cada mención
      if (searchTerm && shouldInclude) {
        console.log('✅ Mención incluida:', {
          searchTerm,
          content: mention.content?.substring(0, 50),
          sourceName: mention.sourceName,
          platform: mention.platform,
          matchesSearch
        });
      }
      
      return shouldInclude;
    });

    console.log(`📊 Filtrado: ${filtered.length} de ${mentions.length} menciones`);

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      // Get dates for comparison - buscar en múltiples campos de fecha
      const dateA = a.publishedAt ? new Date(a.publishedAt) : 
                   a.date ? new Date(a.date) : 
                   a.createdAt ? new Date(a.createdAt) :
                   a.fecha ? new Date(a.fecha) : new Date(0);
      
      const dateB = b.publishedAt ? new Date(b.publishedAt) : 
                   b.date ? new Date(b.date) : 
                   b.createdAt ? new Date(b.createdAt) :
                   b.fecha ? new Date(b.fecha) : new Date(0);
      
      switch (sortBy) {
        case 'date-desc':
          return dateB.getTime() - dateA.getTime();
          
        case 'date-asc':
          return dateA.getTime() - dateB.getTime();
          
        case 'source-asc':
          return (a.sourceName || a.author || a.source || '').localeCompare(b.sourceName || b.author || b.source || '');
          
        case 'source-desc':
          return (b.sourceName || b.author || b.source || '').localeCompare(a.sourceName || a.author || a.source || '');
          
        default:
          return 0;
      }
    });
    
    return sorted;
  }, [mentions, searchTerm, selectedPlatform, selectedSource, dateRange, sortBy]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Initial data load
  useEffect(() => {
    if (dateRange?.from) {
      fetchMentions(dateRange.from, dateRange.to || dateRange.from);
    } else {
      fetchMentions();
    }
  }, [dateRange, fetchMentions]);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedPlatform("all");
    setSelectedSource("all");
    setSortBy('date-desc');
  };

  const hasActiveFilters = searchTerm || selectedPlatform !== "all" || selectedSource !== "all" || sortBy !== 'date-desc';

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
                <BreadcrumbLink href="#">Reputación</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="#">Menciones Negativas</BreadcrumbLink>
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
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Menciones Negativas</h1>
              <p className="text-muted-foreground">
                Monitorea y gestiona las menciones negativas de C.R.E. SL
              </p>
            </div>
          </div>

          {/* Tools & Filters Section */}
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

              {/* Search - MEJORADO */}
              <div className="min-w-[160px]">
                <Label htmlFor="search" className="text-xs mb-2 block">Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="search"
                    type="text"
                    placeholder="Buscar en cualquier campo..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="pl-7 h-8 text-xs w-full min-w-[200px]"
                  />
                </div>
              </div>

              {/* Platform Filter */}
              <div className="min-w-[130px]">
                <Label htmlFor="platform" className="text-xs mb-2 block">Plataforma</Label>
                <Select value={selectedPlatform} onValueChange={(value: PlatformFilter) => setSelectedPlatform(value)}>
                  <SelectTrigger id="platform" className="h-8 text-xs hover:cursor-pointer">
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="text-xs">Todas</SelectItem>
                    <SelectItem value="facebook" className="text-xs">Facebook</SelectItem>
                    <SelectItem value="instagram" className="text-xs">Instagram</SelectItem>
                    <SelectItem value="twitter" className="text-xs">Twitter</SelectItem>
                    <SelectItem value="youtube" className="text-xs">YouTube</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Source Filter */}
              <div className="min-w-[130px]">
                <Label htmlFor="source" className="text-xs mb-2 block">Fuente</Label>
                <Select value={selectedSource} onValueChange={(value: SourceFilter) => setSelectedSource(value)}>
                  <SelectTrigger id="source" className="h-8 text-xs hover:cursor-pointer">
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="text-xs">Todas</SelectItem>
                    <SelectItem value="facebook" className="text-xs">Facebook</SelectItem>
                    <SelectItem value="instagram" className="text-xs">Instagram</SelectItem>
                    <SelectItem value="twitter" className="text-xs">Twitter</SelectItem>
                    <SelectItem value="youtube" className="text-xs">YouTube</SelectItem>
                    <SelectItem value="otra" className="text-xs">Otra</SelectItem>
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
                    <SelectItem value="source-asc" className="text-xs">Fuente A-Z</SelectItem>
                    <SelectItem value="source-desc" className="text-xs">Fuente Z-A</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end gap-2 ml-auto">
                {hasActiveFilters && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={clearFilters}
                    className="h-8 px-3 text-xs gap-1.5 hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <X className="h-3 w-3" />
                    Limpiar filtros
                  </Button>
                )}
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={() => dateRange?.from ? 
                    fetchMentions(dateRange.from, dateRange.to || dateRange.from) : 
                    fetchMentions()
                  } 
                  disabled={loading}
                  className="h-8 px-3 text-xs gap-1.5 hover:cursor-pointer border hover:bg-white hover:text-black hover:border"
                >
                  <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
                  {loading ? 'Actualizando...' : 'Actualizar'}
                </Button>
              </div>
            </div>
          </div>

          {/* Mentions Table */}
          <div className="rounded-lg p-6">
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <p className="text-muted-foreground">Cargando menciones...</p>
              </div>
            ) : mentions.length === 0 ? (
              <div className="flex justify-center items-center h-32">
                <p className="text-muted-foreground">No hay menciones en el rango de fechas seleccionado.</p>
              </div>
            ) : filteredMentions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 space-y-2">
                <p className="text-muted-foreground">No se encontraron menciones con los filtros actuales.</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={clearFilters}
                >
                  Limpiar filtros
                </Button>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <p className="text-red-500 mb-4">{error}</p>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => dateRange?.from ? 
                    fetchMentions(dateRange.from, dateRange.to || dateRange.from) : 
                    fetchMentions()
                  }
                  disabled={loading}
                  className="mt-2 hover:bg-primary/80"
                >
                  <RefreshCw
                    className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
                  />
                  Reintentar
                </Button>
              </div>
            ) : (
              <div className="min-w-full">
                <MentionsTable initialMentions={filteredMentions} />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}