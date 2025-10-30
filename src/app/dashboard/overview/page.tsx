"use client";

import { useEffect, useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isWithinInterval, subMonths } from "date-fns";
import { es } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarDays, MessageSquare, ThumbsUp, Share2, AlertCircle, BarChart3, Users, Eye, TrendingUp, TrendingDown } from "lucide-react";

// Types for our data
interface Post {
  id: number;
  texto: string;
  me_gusta: number;
  comentarios: number;
  compartidos: number;
  fecha: string;
  vistas: number;
  tipoContenido?: string;
}

interface EngagementData {
  date: string;
  likes: number;
  comments: number;
  shares: number;
}

interface SentimentData {
  name: string;
  value: number;
  color: string;
}

export default function OverviewPage() {
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [timeRange, setTimeRange] = useState<'month' | 'week' | 'day'>('month');
  
  // Get current month's start and end dates
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const lastMonthStart = startOfMonth(subMonths(now, 1));
  const lastMonthEnd = endOfMonth(subMonths(now, 1));

  // Fetch posts data from the API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Format dates for the API
        const fromDate = format(monthStart, 'yyyy-MM-dd');
        const toDate = format(monthEnd, 'yyyy-MM-dd');
        
        // Fetch posts from the API
        const response = await fetch(`/api/posts/extracted?from=${fromDate}&to=${toDate}`);
        if (!response.ok) {
          throw new Error('Error al cargar las publicaciones');
        }
        
        const { posts: currentMonthPosts } = await response.json();
        
        // Fetch last month's posts for comparison
        const lastMonthFrom = format(lastMonthStart, 'yyyy-MM-dd');
        const lastMonthTo = format(lastMonthEnd, 'yyyy-MM-dd');
        const lastMonthResponse = await fetch(`/api/posts/extracted?from=${lastMonthFrom}&to=${lastMonthTo}`);
        let lastMonthData: Post[] = [];
        
        if (lastMonthResponse.ok) {
          const data = await lastMonthResponse.json();
          lastMonthData = data.posts || [];
        }
        
        setPosts(currentMonthPosts || []);
        
        // Calculate metrics for current month
        const currentMetrics = calculateMetrics(currentMonthPosts || []);
        const lastMonthMetrics = calculateMetrics(lastMonthData);
        
        // Calculate percentage changes
        const calculateChange = (current: number, previous: number) => {
          if (previous === 0) return current > 0 ? 100 : 0;
          return ((current - previous) / previous) * 100;
        };
        
        setMetrics({
          totalPosts: currentMetrics.totalPosts,
          totalReach: currentMetrics.totalReach,
          totalEngagement: currentMetrics.totalEngagement,
          avgEngagement: currentMetrics.avgEngagement,
          postsChange: calculateChange(currentMetrics.totalPosts, lastMonthMetrics.totalPosts),
          reachChange: calculateChange(currentMetrics.totalReach, lastMonthMetrics.totalReach),
          engagementChange: calculateChange(currentMetrics.totalEngagement, lastMonthMetrics.totalEngagement),
          avgEngagementChange: calculateChange(currentMetrics.avgEngagement, lastMonthMetrics.avgEngagement),
        });
        
        // Prepare engagement data for the chart
        const engagementData = prepareEngagementData(currentMonthPosts || []);
        setEngagementData(engagementData);
        
        // Prepare sentiment data (simplified for now)
        const sentimentData = [
          { name: 'Positivo', value: Math.floor(Math.random() * 100), color: '#10b981' },
          { name: 'Neutral', value: Math.floor(Math.random() * 100), color: '#6366f1' },
          { name: 'Negativo', value: Math.floor(Math.random() * 100), color: '#ef4444' },
        ];
        setSentimentData(sentimentData);
        
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [monthStart, monthEnd, lastMonthStart, lastMonthEnd]);
  
  const [metrics, setMetrics] = useState({
    totalPosts: 0,
    totalReach: 0,
    totalEngagement: 0,
    avgEngagement: 0,
    postsChange: 0,
    reachChange: 0,
    engagementChange: 0,
    avgEngagementChange: 0,
  });
  
  const [engagementData, setEngagementData] = useState<EngagementData[]>([]);
  const [sentimentData, setSentimentData] = useState<SentimentData[]>([]);
  
  // Calculate metrics from posts
  const calculateMetrics = (posts: Post[]) => {
    if (!posts || posts.length === 0) {
      return {
        totalPosts: 0,
        totalReach: 0,
        totalEngagement: 0,
        avgEngagement: 0,
      };
    }
    
    const totalPosts = posts.length;
    const totalReach = posts.reduce((sum, post) => sum + (post.vistas || 0), 0);
    const totalEngagement = posts.reduce((sum, post) => 
      sum + (post.me_gusta || 0) + (post.comentarios || 0) + (post.compartidos || 0), 0);
    const avgEngagement = totalPosts > 0 ? Math.round(totalEngagement / totalPosts) : 0;
    
    return {
      totalPosts,
      totalReach,
      totalEngagement,
      avgEngagement,
    };
  };
  
  // Prepare engagement data for the chart
  const prepareEngagementData = (posts: Post[]): EngagementData[] => {
    // Group posts by date
    const postsByDate: Record<string, Post[]> = {};
    
    posts.forEach(post => {
      const date = format(new Date(post.fecha), 'yyyy-MM-dd');
      if (!postsByDate[date]) {
        postsByDate[date] = [];
      }
      postsByDate[date].push(post);
    });
    
    // Create data points for each day in the month
    const daysInMonth = eachDayOfInterval({
      start: monthStart,
      end: monthEnd,
    });
    
    return daysInMonth.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayPosts = postsByDate[dateStr] || [];
      
      return {
        date: format(date, 'MMM d', { locale: es }),
        likes: dayPosts.reduce((sum, post) => sum + (post.me_gusta || 0), 0),
        comments: dayPosts.reduce((sum, post) => sum + (post.comentarios || 0), 0),
        shares: dayPosts.reduce((sum, post) => sum + (post.compartidos || 0), 0),
      };
    });
  };
  
  // Get top performing post
  const getTopPost = () => {
    if (posts.length === 0) return null;
    
    return posts.reduce((topPost, post) => {
      const engagement = (post.me_gusta || 0) + (post.comentarios || 0) + (post.compartidos || 0);
      const topEngagement = (topPost.me_gusta || 0) + (topPost.comentarios || 0) + (topPost.compartidos || 0);
      
      return engagement > topEngagement ? post : topPost;
    }, posts[0]);
  };
  
  const topPost = getTopPost();
  
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
  
  // Render a metrics card
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16 mb-2" />
            <Skeleton className="h-4 w-32" />
          </CardContent>
        </Card>
      );
    }

    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {icon && <div className="h-4 w-4 text-muted-foreground">{icon}</div>}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          {description && (
            <p className="text-xs text-muted-foreground">
              {!isNeutral && (
                <span
                  className={`inline-flex items-center ${
                    isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {isPositive ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  {Math.abs(change).toFixed(1)}%
                </span>
              )}
              {isNeutral && (
                <span className="inline-flex items-center text-muted-foreground">
                  <BarChart3 className="h-3 w-3 mr-1" />
                  {change}%
                </span>
              )}{' '}
              {description}
            </p>
          )}
        </CardContent>
      </Card>
    );
  };

  // Render a chart component
  const EngagementChart = ({ data, loading = false }: { data: EngagementData[], loading?: boolean }) => {
    if (loading) {
      return <Skeleton className="h-64 w-full" />;
    }

    return (
      <div className="h-64">
        <div className="w-full h-full text-sm text-muted-foreground flex items-center justify-center">
          Gráfico de interacción (se requiere implementar Recharts)
        </div>
      </div>
    );
  };

  // Render a pie chart component
  const SentimentChart = ({ data, loading = false }: { data: SentimentData[], loading?: boolean }) => {
    if (loading) {
      return <Skeleton className="h-64 w-full" />;
    }

    return (
      <div className="h-64">
        <div className="w-full h-full text-sm text-muted-foreground flex items-center justify-center">
          Gráfico de sentimiento (se requiere implementar Recharts)
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Resumen</h2>
        <p className="text-muted-foreground">
          Visión general del rendimiento de tus publicaciones
        </p>
      </div>

      {/* Time Range Selector */}
      <div className="flex space-x-2">
        <Button
          variant={timeRange === 'day' ? 'default' : 'outline'}
          onClick={() => setTimeRange('day')}
          size="sm"
        >
          Hoy
        </Button>
        <Button
          variant={timeRange === 'week' ? 'default' : 'outline'}
          onClick={() => setTimeRange('week')}
          size="sm"
        >
          Esta semana
        </Button>
        <Button
          variant={timeRange === 'month' ? 'default' : 'outline'}
          onClick={() => setTimeRange('month')}
          size="sm"
        >
          Este mes
        </Button>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricsCard
          title="Publicaciones"
          value={loading ? '...' : metrics.totalPosts}
          change={metrics.postsChange}
          description="respecto al mes pasado"
          icon={<CalendarDays className="h-4 w-4" />}
          loading={loading}
        />
        <MetricsCard
          title="Alcance total"
          value={loading ? '...' : formatNumber(metrics.totalReach)}
          change={metrics.reachChange}
          description="personas alcanzadas"
          icon={<Eye className="h-4 w-4" />}
          loading={loading}
        />
        <MetricsCard
          title="Interacción total"
          value={loading ? '...' : formatNumber(metrics.totalEngagement)}
          change={metrics.engagementChange}
          description="interacciones totales"
          icon={<ThumbsUp className="h-4 w-4" />}
          loading={loading}
        />
        <MetricsCard
          title="Interacción media"
          value={loading ? '...' : metrics.avgEngagement}
          change={metrics.avgEngagementChange}
          description="por publicación"
          icon={<BarChart3 className="h-4 w-4" />}
          loading={loading}
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Actividad de Publicaciones</CardTitle>
            <CardDescription>Interacción diaria en el período seleccionado</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <EngagementChart data={engagementData} loading={loading} />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Sentimiento del Público</CardTitle>
            <CardDescription>Distribución de sentimientos en las publicaciones</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <SentimentChart data={sentimentData} loading={loading} />
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Post */}
      <Card>
        <CardHeader>
          <CardTitle>Publicación Destacada</CardTitle>
          <CardDescription>La publicación con mayor interacción este mes</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="flex space-x-4 pt-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          ) : topPost ? (
            <div>
              <h3 className="text-lg font-medium">Publicación con mayor interacción</h3>
              <p className="text-muted-foreground mt-1 line-clamp-2">
                {topPost.texto || 'Sin contenido'}
              </p>
              <div className="flex items-center space-x-6 mt-4 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <ThumbsUp className="h-4 w-4 mr-1" />
                  <span>{topPost.me_gusta || 0} Me gusta</span>
                </div>
                <div className="flex items-center">
                  <MessageSquare className="h-4 w-4 mr-1" />
                  <span>{topPost.comentarios || 0} Comentarios</span>
                </div>
                <div className="flex items-center">
                  <Share2 className="h-4 w-4 mr-1" />
                  <span>{topPost.compartidos || 0} Compartidas</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No hay datos de publicaciones para mostrar</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
