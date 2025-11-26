"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfDay,
  endOfDay,
  subMonths,
  subWeeks,
  subDays,
  eachDayOfInterval,
  isWithinInterval
} from "date-fns";
import { es } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarDays, MessageSquare, ThumbsUp, Share2, AlertCircle, BarChart3, Eye, TrendingUp, TrendingDown, RefreshCw, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ActivityChart } from "@/components/dashboard/charts/activity-chart";
import { EngagementMetricsChart, EngagementMetricsChartSkeleton } from "@/components/dashboard/charts/engagement-metrics-chart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Types for our data
interface Post {
  id: number;
  id_publicacion: string;
  plataforma: string;
  texto: string;
  me_gusta: number;
  comentarios: number;
  compartidos: number;
  fecha: string;
  timestamp?: number;
  hashtags: string[];
  tiene_imagen: boolean;
  url_image?: string;
  url_publicacion: string;
  seguimiento: boolean;
  tipoContenido: string;
  vistas: number;
  created_at: string;
  updated_at: string;
}

interface EngagementData {
  date: string;
  likes: number;
  comments: number;
  shares: number;
}

interface DateRange {
  start: Date;
  end: Date;
  previousStart: Date;
  previousEnd: Date;
}

// Error boundary component for Next.js 15
function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="p-6 rounded-lg bg-destructive/10 border border-destructive/30">
      <div className="flex items-center gap-3 mb-4 text-destructive">
        <AlertCircle className="w-5 h-5" />
        <h2 className="text-lg font-semibold">¡Algo salió mal!</h2>
      </div>
      <p className="mb-4 text-sm">{error.message}</p>
      <Button variant="outline" size="sm" onClick={resetErrorBoundary}>
        <RefreshCw className="mr-2 h-4 w-4" />
        Reintentar
      </Button>
    </div>
  );
}

// Función para normalizar tipos de contenido
const normalizeContentType = (contentType: string): string => {
  if (!contentType) return 'Otro';

  const normalized = contentType.toLowerCase().trim();

  // Mapeo de tipos equivalentes
  const typeMap: Record<string, string> = {
    'image': 'Imagen',
    'imagen': 'Imagen',
    'photo': 'Imagen',
    'foto': 'Imagen',
    'video': 'Video',
    'vídeo': 'Video',
    'sidecar': 'Sidecar',
    'carousel': 'Sidecar',
    'text': 'Texto',
    'texto': 'Texto',
    'link': 'Enlace',
    'enlace': 'Enlace',
    'shared': 'Compartida',
    'compartida': 'Compartida',
    'reel': 'Reel',
    'story': 'Story'
  };

  return typeMap[normalized] || contentType.charAt(0).toUpperCase() + contentType.slice(1).toLowerCase();
};

// Colores fijos para tipos de contenido comunes
const CONTENT_TYPE_COLORS: Record<string, string> = {
  'Imagen': '#3b82f6',      // blue-500
  'Video': '#ef4444',       // red-500
  'Sidecar': '#8b5cf6',     // violet-500
  'Texto': '#10b981',       // emerald-500
  'Enlace': '#f59e0b',      // amber-500
  'Compartida': '#6b7280',  // gray-500
  'Reel': '#ec4899',        // pink-500
  'Story': '#06b6d4',       // cyan-500
  'Otro': '#84cc16'         // lime-500
};

// Normaliza nombres de plataforma a valores canónicos en minúsculas
const normalizePlatform = (platform?: string): string => {
  const p = (platform || '').toLowerCase().trim();
  if (!p) return 'facebook';
  if (p === 'fb' || p.includes('face')) return 'facebook';
  if (p === 'ig' || p.includes('insta')) return 'instagram';
  if (p === 'tt' || p.includes('tiktok')) return 'tiktok';
  return p;
};

// Deriva la plataforma a partir del dominio del URL
const derivePlatformFromUrl = (url?: string): string | null => {
  if (!url) return null;
  try {
    const u = new URL(url);
    const host = u.hostname.toLowerCase();
    if (host.includes('tiktok.com')) return 'tiktok';
    if (host.includes('instagram.com')) return 'instagram';
    if (host.includes('facebook.com') || host.includes('fb.watch')) return 'facebook';
    return null;
  } catch {
    return null;
  }
};

// Helper to display platform name nicely in Spanish
const getPlatformDisplay = (platform?: string): string => {
  const p = (platform || '').toLowerCase().trim();
  // Comparar SIEMPRE en minúsculas porque p ya está en lower-case
  if (p === 'instagram' || p.includes('insta') || p === 'ig') return 'Instagram';
  if (p === 'tiktok' || p === 'tt' || p.includes('tiktok')) return 'TikTok';
  if (p === 'facebook' || p === 'fb' || p.includes('face')) return 'Facebook';
  // Fallback if unknown
  return 'la red social';
};

export default function OverviewPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('month');

  // Calculate date ranges based on timeRange
  const dateRange = useMemo((): DateRange => {
    const now = new Date();

    switch (timeRange) {
      case 'day':
        return {
          start: startOfDay(now),
          end: endOfDay(now),
          previousStart: startOfDay(subDays(now, 1)),
          previousEnd: endOfDay(subDays(now, 1))
        };
      case 'week':
        return {
          start: startOfDay(subDays(now, 6)),
          end: endOfDay(now),
          previousStart: startOfDay(subDays(now, 13)),
          previousEnd: endOfDay(subDays(now, 7))
        };
      case 'month':
      default:
        return {
          start: startOfMonth(now),
          end: endOfMonth(now),
          previousStart: startOfMonth(subMonths(now, 1)),
          previousEnd: endOfMonth(subMonths(now, 1))
        };
    }
  }, [timeRange]);

  // Filter posts based on current date range
  const filteredPosts = useMemo(() => {
    return allPosts.filter(post => {
      try {
        const postDate = new Date(post.fecha);
        return isWithinInterval(postDate, {
          start: dateRange.start,
          end: dateRange.end
        });
      } catch {
        return false;
      }
    });
  }, [allPosts, dateRange]);

  // Filter previous period posts for comparison
  const previousPeriodPosts = useMemo(() => {
    return allPosts.filter(post => {
      try {
        const postDate = new Date(post.fecha);
        return isWithinInterval(postDate, {
          start: dateRange.previousStart,
          end: dateRange.previousEnd
        });
      } catch {
        return false;
      }
    });
  }, [allPosts, dateRange]);

  // Helper function to normalize and validate post data
  const normalizePost = (post: any): Post => {
    try {
      const postDate = post.fecha || post.fechapublicacion || post.created_at || new Date().toISOString();
      const normalizedDate = new Date(postDate).toISOString();
      const hasImage = Boolean(post.tiene_imagen || post.url_image || post.image);
      const postId = post.id || Math.floor(Math.random() * 10000);
      const postPublicId = post.id_publicacion || post.id || String(Math.random().toString(36).substr(2, 9));

      // Normalizar el tipo de contenido
      const rawContentType = post.tipoContenido || (hasImage ? 'imagen' : 'texto');
      const normalizedContentType = normalizeContentType(rawContentType);

      // Resolver URL y usar plataforma EXACTA desde la columna (sin normalizar)
      const permalink: string = post.url_publicacion || post.url || post.permalink_url || `https://facebook.com/${postPublicId}`;

      return {
        id: postId,
        id_publicacion: postPublicId,
        plataforma: post.plataforma || post.redsocial || '',
        texto: post.texto || post.contenido || '',
        me_gusta: Number(post.me_gusta || post.likes || 0),
        comentarios: Number(post.comentarios || post.comments || 0),
        compartidos: Number(post.compartidos || post.shares || 0),
        fecha: normalizedDate,
        timestamp: post.timestamp ? Number(post.timestamp) : Math.floor(new Date(normalizedDate).getTime() / 1000),
        hashtags: Array.isArray(post.hashtags) ? post.hashtags : [],
        tiene_imagen: hasImage,
        url_image: post.url_image || post.image || undefined,
        url_publicacion: permalink,
        seguimiento: post.seguimiento !== undefined ? Boolean(post.seguimiento) : true,
        tipoContenido: normalizedContentType,
        vistas: Number(post.vistas || post.views || 0),
        created_at: post.created_at || normalizedDate,
        updated_at: post.updated_at || normalizedDate
      };
    } catch (error) {
      console.error('Error normalizing post:', error, 'Post data:', post);
      return {
        id: Math.floor(Math.random() * 10000),
        id_publicacion: String(Math.random().toString(36).substr(2, 9)),
        plataforma: 'facebook',
        texto: 'Error al cargar esta publicación',
        me_gusta: 0,
        comentarios: 0,
        compartidos: 0,
        fecha: new Date().toISOString(),
        timestamp: Math.floor(Date.now() / 1000),
        hashtags: [],
        tiene_imagen: false,
        url_publicacion: '',
        seguimiento: true,
        tipoContenido: 'error',
        vistas: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }
  };

  // Memoized fetch function
  const fetchPosts = useCallback(async (from: Date, to: Date) => {
    const fromDate = format(from, 'yyyy-MM-dd');
    const toDate = format(to, 'yyyy-MM-dd');

    try {
      const fields = [
        'id', 'id_publicacion', 'plataforma', 'texto', 'me_gusta', 'comentarios', 'compartidos',
        'fecha', 'timestamp', 'hashtags', 'tiene_imagen', 'url_image', 'url_publicacion',
        'seguimiento', 'tipoContenido', 'vistas', 'created_at', 'updated_at', 'url', 'permalink_url',
        'likes', 'comments', 'shares', 'views', 'fechapublicacion', 'contenido', 'type', 'image'
      ];

      const response = await fetch(
        `/api/posts/extracted?from=${fromDate}&to=${toDate}&fields=${fields.join(',')}`
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!Array.isArray(data.posts)) {
        console.warn('[WARNING] Expected posts array but got:', data);
        return [];
      }

      const normalized = data.posts.map(normalizePost);
      try {
        const platformsSample = normalized.slice(0, 10).map((p: Post) => ({ id: p.id_publicacion, plataforma: p.plataforma }));
        console.log('[OverviewPage] Normalized posts (sample) plataformas:', platformsSample);
      } catch (e) {
        console.log('[OverviewPage] Debug platforms log failed', e);
      }
      return normalized;
    } catch (error) {
      console.error(`Error in fetchPosts:`, error);
      throw error;
    }
  }, []);

  // Fetch all posts data from the API
  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;

    const fetchData = async () => {
      if (!isMounted) return;

      setLoading(true);
      setError(null);

      timeoutId = setTimeout(() => {
        if (isMounted) {
          setLoading(false);
        }
      }, 15000);

      try {
        // Fetch data for a wider range to cover all time ranges
        const now = new Date();
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(now.getMonth() - 3);

        console.log('[OverviewPage] Fetching posts from last 3 months...');
        const apiPosts = await fetchPosts(threeMonthsAgo, now);

        if (!isMounted) return;

        console.log(`[OverviewPage] Setting ${apiPosts.length} posts`);
        setAllPosts(apiPosts);

        console.log('[OverviewPage] Data fetch completed successfully');

      } catch (err) {
        console.error('[OverviewPage] Error in fetchData:', err);
        if (isMounted) {
          const error = err instanceof Error ? err : new Error('Error desconocido al cargar los datos');
          setError(error);
          setAllPosts([]);
        }
      } finally {
        if (isMounted) {
          clearTimeout(timeoutId);
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [fetchPosts]);

  // Calculate metrics from posts with proper comparison
  const calculateMetrics = useCallback((currentPosts: Post[], previousPosts: Post[]) => {
    const calculateTotals = (posts: Post[]) => {
      if (!posts || posts.length === 0) {
        return { totalPosts: 0, totalReach: 0, totalEngagement: 0, avgEngagement: 0 };
      }

      const totalPosts = posts.length;
      const totalReach = posts.reduce((sum, post) => sum + (post.vistas || 0), 0);
      const totalEngagement = posts.reduce((sum, post) =>
        sum + (post.me_gusta || 0) + (post.comentarios || 0) + (post.compartidos || 0), 0);
      const avgEngagement = totalPosts > 0 ? Math.round(totalEngagement / totalPosts) : 0;

      return { totalPosts, totalReach, totalEngagement, avgEngagement };
    };

    const current = calculateTotals(currentPosts);
    const previous = calculateTotals(previousPosts);

    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    return {
      totalPosts: current.totalPosts,
      totalReach: current.totalReach,
      totalEngagement: current.totalEngagement,
      avgEngagement: current.avgEngagement,
      postsChange: calculateChange(current.totalPosts, previous.totalPosts),
      reachChange: calculateChange(current.totalReach, previous.totalReach),
      engagementChange: calculateChange(current.totalEngagement, previous.totalEngagement),
      avgEngagementChange: calculateChange(current.avgEngagement, previous.avgEngagement),
    };
  }, []);

  // Calculate metrics whenever filtered posts change
  const metrics = useMemo(() => {
    return calculateMetrics(filteredPosts, previousPeriodPosts);
  }, [filteredPosts, previousPeriodPosts, calculateMetrics]);

  // Calculate engagement metrics by post type (con tipos normalizados)
  const engagementByType = useMemo(() => {
    console.log('Calculating engagement by type for posts:', filteredPosts);
    const types: Record<string, { count: number, likes: number, comments: number, shares: number, views: number }> = {};

    filteredPosts.forEach(post => {
      const type = post.tipoContenido;
      if (!types[type]) {
        types[type] = { count: 0, likes: 0, comments: 0, shares: 0, views: 0 };
      }

      types[type].count += 1;
      types[type].likes += post.me_gusta || 0;
      types[type].comments += post.comentarios || 0;
      types[type].shares += post.compartidos || 0;
      types[type].views += post.vistas || 0;
    });

    // Calculate averages
    const result = Object.entries(types).map(([type, data]) => ({
      type,
      avgLikes: data.count > 0 ? Math.round((data.likes / data.count) * 10) / 10 : 0,
      avgComments: data.count > 0 ? Math.round((data.comments / data.count) * 10) / 10 : 0,
      avgShares: data.count > 0 ? Math.round((data.shares / data.count) * 10) / 10 : 0,
      avgViews: data.count > 0 ? Math.round((data.views / data.count)) : 0,
      postCount: data.count
    }));

    console.log('Calculated engagement by type:', result);
    return result;
  }, [filteredPosts]);

  // Get top performing post (excluding shared posts)
  const topPost = useMemo(() => {
    const nonSharedPosts = filteredPosts.filter(post => post.tipoContenido !== 'Compartida');

    if (nonSharedPosts.length === 0) return null;

    return nonSharedPosts.reduce((topPost, post) => {
      const engagement = (post.me_gusta || 0) + (post.comentarios || 0) + (post.compartidos || 0);
      const topEngagement = (topPost.me_gusta || 0) + (topPost.comentarios || 0) + (topPost.compartidos || 0);

      return engagement > topEngagement ? post : topPost;
    }, nonSharedPosts[0]);
  }, [filteredPosts]);

  // Log topPost details to debug platform/display mismatch
  useEffect(() => {
    if (topPost) {
      try {
        console.log('[OverviewPage] topPost debug:', {
          id: topPost.id_publicacion,
          plataforma_raw: topPost.plataforma,
          plataforma_display: getPlatformDisplay(topPost.plataforma),
          url_publicacion: topPost.url_publicacion,
          tipoContenido: topPost.tipoContenido,
        });
      } catch (e) {
        console.log('[OverviewPage] topPost debug failed', e);
      }
    } else {
      console.log('[OverviewPage] No topPost available for current range');
    }
  }, [topPost]);

  // Format numbers for display
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  // Render a metrics card with shadcn/ui components
  const MetricsCard = ({
    title,
    value,
    change = 0,
    description,
    icon,
    loading = false
  }: {
    title: string;
    value: string | number;
    change?: number;
    description?: string;
    icon?: React.ReactNode;
    loading?: boolean;
  }) => {
    const isPositive = change > 0;
    const isNeutral = change === 0;

    if (loading) {
      return (
        <Card className="h-full">
          <CardHeader className="p-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </div>
            <div className="space-y-2 mt-2">
              <Skeleton className="h-7 w-3/4" />
              <Skeleton className="h-3 w-full" />
            </div>
          </CardHeader>
        </Card>
      );
    }

    return (
      <Card className="h-full hover:shadow-md transition-shadow">
        <CardHeader className="p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            {icon && (
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                {icon}
              </div>
            )}
          </div>
          <div className="mt-2">
            <h3 className="text-2xl font-bold">{value}</h3>
            {description && (
              <div className="flex items-center gap-1 mt-1">
                {!isNeutral ? (
                  <Badge
                    variant={isPositive ? 'default' : 'destructive'}
                    className="gap-1 text-xs h-5"
                  >
                    {isPositive ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {Math.abs(change).toFixed(1)}%
                  </Badge>
                ) : (
                  <Badge variant="outline" className="gap-1 text-xs h-5">
                    <BarChart3 className="h-3 w-3" />
                    {change}%
                  </Badge>
                )}
                <span className="text-xs text-muted-foreground">
                  {description}
                </span>
              </div>
            )}
          </div>
        </CardHeader>
      </Card>
    );
  };

  // Process engagement data for the activity chart
  const processEngagementData = useCallback(() => {
    const engagementByDate = new Map<string, { posts: number, interactions: number }>();

    filteredPosts.forEach(post => {
      if (!post.fecha) return;

      const date = format(new Date(post.fecha), 'yyyy-MM-dd');
      const current = engagementByDate.get(date) || { posts: 0, interactions: 0 };

      engagementByDate.set(date, {
        posts: current.posts + 1,
        interactions: current.interactions + (post.me_gusta || 0) + (post.comentarios || 0) + (post.compartidos || 0)
      });
    });

    // Fill in missing dates with zero values
    const dateRangeInterval = eachDayOfInterval({
      start: dateRange.start,
      end: dateRange.end
    });

    return dateRangeInterval.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const data = engagementByDate.get(dateStr) || { posts: 0, interactions: 0 };

      // Format date as DD/MM with proper spacing
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const formattedDate = `${day}/${month}`;

      return {
        date: formattedDate,
        posts: data.posts,
        interactions: data.interactions
      };
    });
  }, [filteredPosts, dateRange, timeRange]);

  // Prepare engagement data for the chart with colores consistentes
  const processEngagementMetrics = useCallback((): Array<{ name: string; value: number; color: string }> => {
    console.log('Processing engagement metrics for types:', engagementByType);

    if (!engagementByType || engagementByType.length === 0) {
      console.log('No engagement data available');
      return [];
    }

    // Calculate total engagement for each post type
    return engagementByType.map(item => ({
      name: item.type,
      value: (item.avgLikes || 0) + (item.avgComments || 0) + (item.avgShares || 0),
      color: CONTENT_TYPE_COLORS[item.type] || CONTENT_TYPE_COLORS['Otro']
    }));
  }, [engagementByType]);

  // Show error state
  if (error) {
    return (
      <div className="container mx-auto p-6">
        <ErrorFallback
          error={error}
          resetErrorBoundary={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Resumen</h1>
          <p className="text-muted-foreground">
            Visión general del rendimiento de tus publicaciones
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center gap-4">
          <Select
            value={timeRange}
            onValueChange={(value) => setTimeRange(value as 'day' | 'week' | 'month')}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Seleccionar período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  Hoy
                </div>
              </SelectItem>
              <SelectItem value="week">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  Esta semana
                </div>
              </SelectItem>
              <SelectItem value="month">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  Este mes
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Date Range Info */}
      <div className="text-sm text-muted-foreground">
        Mostrando datos del {format(dateRange.start, 'dd/MM/yyyy')} al {format(dateRange.end, 'dd/MM/yyyy')}
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricsCard
          title="Publicaciones"
          value={loading ? '...' : metrics.totalPosts}
          change={metrics.postsChange}
          description={`respecto al ${timeRange === 'day' ? 'día' : timeRange === 'week' ? 'semana' : 'mes'} anterior`}
          icon={<CalendarDays className="h-4 w-4 text-primary" />}
          loading={loading}
        />
        <MetricsCard
          title="Alcance total"
          value={loading ? '...' : formatNumber(metrics.totalReach)}
          change={metrics.reachChange}
          description="personas alcanzadas"
          icon={<Eye className="h-4 w-4 text-primary" />}
          loading={loading}
        />
        <MetricsCard
          title="Interacción total"
          value={loading ? '...' : formatNumber(metrics.totalEngagement)}
          change={metrics.engagementChange}
          description="interacciones totales"
          icon={<ThumbsUp className="h-4 w-4 text-primary" />}
          loading={loading}
        />
        <MetricsCard
          title="Interacción media"
          value={loading ? '...' : metrics.avgEngagement}
          change={metrics.avgEngagementChange}
          description="por publicación"
          icon={<BarChart3 className="h-4 w-4 text-primary" />}
          loading={loading}
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-7">
        <div className="lg:col-span-4">
          <ActivityChart
            data={processEngagementData()}
            className={loading ? 'opacity-50 pointer-events-none' : ''}
            timeRange={timeRange}
          />
        </div>
        <div className="lg:col-span-3">
          {loading ? (
            <div className="opacity-50 pointer-events-none">
              <EngagementMetricsChartSkeleton />
            </div>
          ) : (
            <EngagementMetricsChart
              data={processEngagementMetrics()}
            />
          )}
        </div>
      </div>

      {/* Top Performing Post */}
      <Card>
        <CardHeader>
          <CardTitle>Publicación Destacada</CardTitle>
          <CardDescription>La publicación con mayor interacción en el período seleccionado</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="flex gap-4 pt-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          ) : topPost ? (
            <div className="flex flex-col md:flex-row gap-4">
              {/* Post Content */}
              <div className="flex-1">
                <h3 className="text-lg font-medium">
                  Publicación con mayor interacción
                </h3>
                <p className="text-muted-foreground mt-1 line-clamp-5">
                  {topPost.texto || 'Sin contenido'}
                </p>

                {topPost.url_publicacion && (
                  <div className="mt-3">
                    <Button asChild variant="default" size="sm">
                      <a
                        href={topPost.url_publicacion}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2"
                      >
                        <ExternalLink className="h-4 w-4" />
                        {`Ver publicación en ${(topPost.plataforma ?? '').trim() || 'Plataforma'}`}
                      </a>
                    </Button>
                  </div>
                )}
              </div>

              {/* Post Thumbnail */}
              <div className="w-full md:w-48 flex-shrink-0">
                {topPost.url_image ? (
                  <div className="relative aspect-square w-full overflow-hidden rounded-lg border bg-muted">
                    <img
                      src={topPost.url_image}
                      alt="Miniatura de la publicación"
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex aspect-square w-full items-center justify-center rounded-lg border bg-muted">
                    {/* Reemplazar "Sin imagen" con el logo de CRE */}
                    <img
                      src="/logos/cre-logo.png"
                      alt="Logo CRE"
                      className="h-16 w-16 object-contain opacity-80"
                    />
                  </div>
                )}
              </div>

              {/* Engagement Metrics - Only show for non-shared posts */}
              {topPost.tipoContenido !== 'Compartida' && (
                <div className="space-y-2 min-w-[200px]">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Me gusta</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{topPost.me_gusta || 0}</span>
                      <ThumbsUp className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                  <Progress value={Math.min((topPost.me_gusta || 0) / 100 * 100, 100)} className="h-2" />

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Comentarios</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{topPost.comentarios || 0}</span>
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                  <Progress value={Math.min((topPost.comentarios || 0) / 50 * 100, 100)} className="h-2" />

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Compartidas</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{topPost.compartidos || 0}</span>
                      <Share2 className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                  <Progress value={Math.min((topPost.compartidos || 0) / 25 * 100, 100)} className="h-2" />
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No hay datos de publicaciones para mostrar en este período</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}