import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import prisma from "@/lib/prisma";

import { ExcelDownloadModal } from "@/components/ExcelDownloadModal";
import { CandidatePostCounts } from "@/components/CandidatePostCounts";
import { CandidateActivityOverview } from "@/components/CandidateActivityOverview";
import { SocialMediaPieChart } from "@/components/dashboard/SocialMediaPieChart";
import { QuickActionCard } from "@/components/ui/quick-action-card";
import {
  BarChart3,
  Download,
  FileText,
  PieChart,
  Users,
  MapPin,
  Activity,
  TrendingUp,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { ParticipationPieChart } from "@/components/dashboard/ParticipationPieChart";
import { DepartmentsBarChart } from "@/components/dashboard/DepartmentsBarChart";
import { Label } from "@/components/ui/label";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart } from "recharts/types/chart/BarChart";
import { CartesianGrid } from "recharts/types/cartesian/CartesianGrid";
import { YAxis } from "recharts/types/cartesian/YAxis";
import { XAxis, Bar, LabelList } from "recharts";

export default async function Page() {
  // Helper: get YYYY-MM-DD string for La Paz tz (UTC-4)
  function getLaPazDateString(d: Date) {
    const laPaz = new Date(d.getTime() - 4 * 60 * 60 * 1000);
    const y = laPaz.getUTCFullYear();
    const m = String(laPaz.getUTCMonth() + 1).padStart(2, "0");
    const day = String(laPaz.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }
  // Copia de ymdInLaPaz (igual que en /api/posts-daily)
  function ymdInLaPaz(dateUTC: Date): string {
    const laPaz = new Date(dateUTC.getTime() - 4 * 60 * 60 * 1000);
    const y = laPaz.getUTCFullYear();
    const m = String(laPaz.getUTCMonth() + 1).padStart(2, "0");
    const d = String(laPaz.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  // Copia de normalizeUrl (igual que en /api/posts-daily)
  function normalizeUrl(url?: string | null): string {
    if (!url) return "";
    try {
      const u = new URL(url);
      const host = u.hostname.replace(/^www\./i, "").toLowerCase();
      const path = u.pathname.replace(/\/+/g, "");
      return `${host}${path}`;
    } catch {
      return String(url).toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").split(/[?#]/)[0].replace(/\/+/g, "");
    }
  }

  const now = new Date();
  // Yesterday in La Paz
  const laPazNow = new Date(now.getTime() - 4 * 60 * 60 * 1000);
  const laPazYesterday = new Date(laPazNow);
  laPazYesterday.setUTCDate(laPazNow.getUTCDate() - 1);
  const yStr = getLaPazDateString(laPazYesterday);
  const yStart = new Date(`${yStr}T00:00:00-04:00`);
  const yEnd = new Date(`${yStr}T23:59:59.999-04:00`);

  // Anteayer en La Paz
  const laPazDayBefore = new Date(laPazNow);
  laPazDayBefore.setUTCDate(laPazNow.getUTCDate() - 2);
  const dbStr = getLaPazDateString(laPazDayBefore);
  const dbStart = new Date(`${dbStr}T00:00:00-04:00`);
  const dbEnd = new Date(`${dbStr}T23:59:59.999-04:00`);

  // 7-day window ending yesterday (inclusive)
  const start7LaPaz = new Date(laPazYesterday);
  start7LaPaz.setUTCDate(laPazYesterday.getUTCDate() - 6);
  const start7Str = getLaPazDateString(start7LaPaz);
  const start7 = new Date(`${start7Str}T00:00:00-04:00`);
  const end7 = yEnd;

  const posts = (
    await prisma.scrap_post.findMany({
      where: { redsocial: "Facebook", candidatoid: { gt: 0 } },
      orderBy: { fechapublicacion: "desc" },
      // ¡Sin límite! Trae todos los posts para el filtro en el modal
    })
  ).map((post) => ({
    ...post,
    created_at:
      post.created_at instanceof Date
        ? post.created_at.toISOString()
        : post.created_at,
    fechapublicacion:
      post.fechapublicacion instanceof Date
        ? post.fechapublicacion.toISOString()
        : post.fechapublicacion,
  }));

  // Metrics
  const totalCandidates = await prisma.candidatos.count();
  const activeYesterdayDistinct = await prisma.scrap_post.findMany({
    where: {
      fechapublicacion: { gte: yStart, lte: yEnd },
      candidatoid: { gt: 0 },
    },
    distinct: ["candidatoid"],
    select: { candidatoid: true },
  });
  const activeYesterday = activeYesterdayDistinct.length;
  const participantsPct =
    totalCandidates > 0 ? (activeYesterday / totalCandidates) * 100 : 0;
  const nonParticipantsPct = 100 - participantsPct;

  const posts7d = await prisma.scrap_post.count({
    where: {
      fechapublicacion: { gte: start7, lte: end7 },
    },
  });
  const avgDaily7d = posts7d / 7;

  // Extra metrics for more cards
  const postsYesterdayCount = await prisma.scrap_post.count({
    where: {
      fechapublicacion: { gte: yStart, lte: yEnd },
    },
  });

  const candidatesNoActivityYesterday = Math.max(
    0,
    totalCandidates - activeYesterday
  );

  // Top departamento by posts yesterday
  const topDeptGroups = await prisma.scrap_post.groupBy({
    by: ["departamento"],
    where: {
      fechapublicacion: { gte: yStart, lte: yEnd },
      candidatoid: { gt: 0 },
    },
    _count: { _all: true },
  });
  const topDeptSorted = topDeptGroups.sort(
    (a, b) => (b._count._all ?? 0) - (a._count._all ?? 0)
  );
  const topDeptYesterday = topDeptSorted[0]?.departamento || "Sin datos";
  const topDeptYesterdayCount = topDeptSorted[0]?._count._all || 0;

  // Get post counts by department for yesterday
  const departmentPosts = (await prisma.$queryRaw`
    SELECT 
      c.departamento as department,
      COUNT(sp.id) as count
    FROM 
      scrap_post sp
    JOIN 
      candidatos c ON sp.candidatoid = c.id
    WHERE 
      sp.fechapublicacion >= ${yStart} AND 
      sp.fechapublicacion <= ${yEnd}
    GROUP BY 
      c.departamento
    ORDER BY 
      count DESC
    LIMIT 10
  `) as { department: string; count: number }[];

  // Obtener publicaciones de ayer deduplicadas igual que el gráfico (usando el endpoint /api/posts-daily)
  let publicacionesAyerDedup = 0;
  try {
    const resp = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/posts-daily?desde=${getLaPazDateString(yStart)}&hasta=${getLaPazDateString(yStart)}`,
      { cache: "no-store" }
    );
    if (resp.ok) {
      const json = await resp.json();
      if (json.data && Array.isArray(json.data) && json.data.length > 0) {
        const dayData = json.data[0];
        publicacionesAyerDedup = (dayData.facebook || 0) + (dayData.instagram || 0) + (dayData.tiktok || 0);
      }
    }
  } catch (e) {
    publicacionesAyerDedup = 0;
  }

  // Get post counts by department for the day before yesterday
  const departmentPostsDayBefore = (await prisma.$queryRaw`
    SELECT 
      c.departamento as department,
      COUNT(sp.id) as count
    FROM 
      scrap_post sp
    JOIN 
      candidatos c ON sp.candidatoid = c.id
    WHERE 
      sp.fechapublicacion >= ${dbStart} AND 
      sp.fechapublicacion <= ${dbEnd}
    GROUP BY 
      c.departamento
    ORDER BY 
      count DESC
    LIMIT 100
  `) as { department: string; count: number }[];

  // Calcular crecimiento por departamento
  const growthByDept: { department: string; growth: number; countYesterday: number }[] = departmentPosts.map(dp => {
    const before = departmentPostsDayBefore.find(d => d.department === dp.department);
    const countBefore = before ? (typeof before.count === 'bigint' ? Number(before.count) : before.count) : 0;
    const countYesterday = typeof dp.count === 'bigint' ? Number(dp.count) : dp.count;
    return {
      department: dp.department,
      growth: countYesterday - countBefore,
      countYesterday
    };
  });
  const maxGrowthDept = growthByDept.sort((a, b) => b.growth - a.growth)[0];

  // Distribution by network last 7 days
  const byNetwork7d = await prisma.scrap_post.groupBy({
    by: ["redsocial"],
    where: { fechapublicacion: { gte: start7, lte: end7 } },
    _count: { _all: true },
  });
  const netMap: Record<string, number> = {};
  for (const row of byNetwork7d) {
    netMap[row.redsocial] = row._count._all;
  }
  const fb7 = netMap["Facebook"] || 0;
  const ig7 = netMap["Instagram"] || 0;
  const tk7 = netMap["TikTok"] || 0;
  const totalNet7 = fb7 + ig7 + tk7 || 1; // avoid div by zero

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center w-full gap-2 px-4">
          <div className="flex items-center gap-2 flex-grow min-w-0">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb className="truncate">
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="flex items-center gap-2 ml-auto pr-3">
            <img
              className="w-35 h-10 object-contain pr-2"
              src="https://noticias-admin-panel.vercel.app/_next/image/?url=https%3A%2F%2Fi.postimg.cc%2FrFJtBVqs%2FProyecto-nuevo-3.png&w=256&q=75"
              alt="Libre-Scraping Logo 1"
            />
            <img
              className="w-23 h-10 object-contain pr-2"
              src="https://tuto-noticias-test.vercel.app/_next/image/?url=https%3A%2F%2Fi.postimg.cc%2FMZDMg3pY%2FProyecto-nuevo-1.png&w=128&q=75"
              alt="Libre-Scraping Logo 2"
            />
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-4 p-4 pt-0  via-white to-white min-h-screen">
        <div className="bg-white p-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4">
            <div className="flex flex-col ">
              <h1 className="text-2xl font-bold text-gray-800">
                Panel de Control
              </h1>
              <p className="text-sm text-gray-500">
                Resumen general de actividad en redes sociales
              </p>
            </div>
            <ExcelDownloadModal
              posts={posts}
              sinActividad={[]}
              departamentoNombre={"General"}
              className="w-full sm:w-auto"
            />
          </div>
        </div>
        <div className="w-full mx-auto  px-4 sm:px-6 lg:px-8">
          {/* Fila 1: Contenedor de métricas */}
          <div className="flex flex-col items-stretch w-full">
{/* Primera fila con todas las métricas */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6 w-full">
  {/* Activos ayer */}
  <Card className="lg:col-span-1 bg-white rounded-xl border-l-4 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all border-[#17368a]">
    <CardHeader className="flex items-center gap-2 pb-2">
      <Users className="w-5 h-5 text-[#17368a]" />
      <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Activos ayer
      </CardTitle>
    </CardHeader>
    <CardContent className="text-center py-3">
      <p className="text-3xl font-extrabold text-[#17368a]">
        {activeYesterday}
      </p>
      <p className="text-xs text-muted-foreground">
        de {totalCandidates} candidatos
      </p>
    </CardContent>
  </Card>

  {/* Total candidatos */}
  <Card className="lg:col-span-1 bg-white rounded-xl border-l-4 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all border-[#17368a]">
    <CardHeader className="flex items-center gap-2 pb-2">
      <Users className="w-5 h-5 text-[#17368a]" />
      <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Total candidatos
      </CardTitle>
    </CardHeader>
    <CardContent className="text-center py-3">
      <p className="text-3xl font-extrabold text-[#17368a]">
        {totalCandidates}
      </p>
      <p className="text-xs text-muted-foreground">Registrados</p>
    </CardContent>
  </Card>

  {/* Participación */}
  <Card className="lg:col-span-1 bg-white rounded-xl border-l-4 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all border-[#17368a]">
    <CardHeader className="flex items-center gap-2 pb-2">
      <PieChart className="w-5 h-5 text-[#17368a]" />
      <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Participación
      </CardTitle>
    </CardHeader>
    <CardContent className="text-center py-3">
      <p className="text-3xl font-extrabold text-[#17368a]">
        {totalCandidates > 0
          ? ((activeYesterday / totalCandidates) * 100).toFixed(1)
          : 0}
        %
      </p>
      <p className="text-xs text-muted-foreground">Últimas 24h</p>
    </CardContent>
  </Card>

  {/* Publicaciones ayer */}
  <Card className="lg:col-span-1 bg-white rounded-xl border-l-4 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all border-[#f21212]">
    <CardHeader className="flex items-center gap-2 pb-2">
      <Users className="w-5 h-5 text-[#f21212]" />
      <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Publicaciones ayer
      </CardTitle>
    </CardHeader>
    <CardContent className="text-center py-3">
      <p className="text-3xl font-extrabold text-[#f21212]">
        {postsYesterdayCount}
      </p>
      <p className="text-xs text-muted-foreground">Fecha: {yStr}</p>
    </CardContent>
  </Card>

  {/* Candidatos inactivos */}
  <Card className="lg:col-span-1 bg-white rounded-xl border-l-4 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all border-[#f21212]">
    <CardHeader className="flex items-center gap-2 pb-2">
      <Users className="w-5 h-5 text-[#f21212]" />
      <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Inactivos ayer
      </CardTitle>
    </CardHeader>
    <CardContent className="text-center py-3">
      <p className="text-3xl font-extrabold text-[#f21212]">
        {candidatesNoActivityYesterday}
      </p>
      <p className="text-xs text-muted-foreground">
        De {totalCandidates} (
        {totalCandidates > 0
          ? (
              (candidatesNoActivityYesterday / totalCandidates) *
              100
            ).toFixed(1)
          : 0}
        %)
      </p>
    </CardContent>
  </Card>

  {/* Depto. con mayor crecimiento */}
  <Card className="lg:col-span-1 bg-white rounded-xl border-l-4 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all border-[#f21212]">
    <CardHeader className="flex items-center gap-2 pb-2">
      <TrendingUp className="w-5 h-5 text-[#f21212]" />
      <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Depto. con mayor crecimiento
      </CardTitle>
    </CardHeader>
    <CardContent className="flex flex-col items-center py-3">
      <div className="flex items-center gap-2">
        <div>
          <p className="text-2xl font-extrabold text-[#f21212]">
            {maxGrowthDept?.department || "Sin datos"}
          </p>
          <p className="text-xs text-muted-foreground">
            {maxGrowthDept
              ? `+${maxGrowthDept.growth} publicaciones vs. día anterior`
              : "Sin crecimiento registrado"}
          </p>
        </div>
      </div>
    </CardContent>
  </Card>
</div>


            {/* Fila 2: Graficos   */}

            {/* Gráfico de distribución por red social */}
            <div className="w-full mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Distribución por red social */}
              <Card className="bg-white shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg font-semibold">
                        Distribución por red social
                      </CardTitle>
                      <CardDescription className="text-xs text-muted-foreground">
                        Actividad de los últimos 7 días
                      </CardDescription>
                    </div>
                    <div className="p-2 rounded-full bg-blue-50">
                      <Activity className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 pb-6 flex-1 flex flex-col items-center justify-center min-h-[350px] p-4">
                  <SocialMediaPieChart
                    data={[
                      { platform: "Facebook", count: fb7 },
                      { platform: "Instagram", count: ig7 },
                      { platform: "TikTok", count: tk7 },
                    ]}
                  />
                  <div className="w-full mt-4 grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-xs font-semibold text-blue-600">
                        Facebook
                      </p>
                      <p className="text-lg font-bold text-blue-700">
                        {totalNet7 > 0
                          ? ((fb7 / totalNet7) * 100).toFixed(1)
                          : 0}
                        %
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {fb7} publicaciones
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-pink-600">
                        Instagram
                      </p>
                      <p className="text-lg font-bold text-pink-700">
                        {totalNet7 > 0
                          ? ((ig7 / totalNet7) * 100).toFixed(1)
                          : 0}
                        %
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {ig7} publicaciones
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold ">TikTok</p>
                      <p className="text-lg font-bold ">
                        {totalNet7 > 0
                          ? ((tk7 / totalNet7) * 100).toFixed(1)
                          : 0}
                        %
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {tk7} publicaciones
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Top departamentos por publicaciones */}
              <Card className="bg-white shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg font-semibold">
                        Top Departamentos
                      </CardTitle>
                      <CardDescription className="text-xs text-muted-foreground">
                        Publicaciones en Redes Sociales de ayer por departamento
                      </CardDescription>
                    </div>
                    <div className="p-2 rounded-full bg-blue-50">
                      <MapPin className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 pb-6 flex-1 flex flex-col">
                  <div className="h-[300px] w-full mt-4">
                    <DepartmentsBarChart data={departmentPosts} />
                  </div>
                </CardContent>
                <CardFooter className="flex-col items-start gap-2 text-sm">
                  <div className="flex gap-2 leading-none font-medium items-center">
                    Departamento top: <span className="font-bold text-red-700">{departmentPosts[0]?.department || 'Sin datos'}</span>
                    🏆
                  </div>
                  <div className="text-muted-foreground leading-none">
                    {departmentPosts[0]?.department
                      ? `Ayer: ${departmentPosts[0]?.count} publicaciones en ${departmentPosts[0]?.department}`
                      : 'No hubo publicaciones registradas ayer'}
                  </div>
                </CardFooter>
              </Card>
            </div>
          </div>
          {/* Gráfico de actividad diaria */}
          <div className="pt-4">
            <CandidateActivityOverview />
          </div>
          {/* Gráfico de conteo de publicaciones */}
          <div className="pt-4">
            <CandidatePostCounts />
          </div>
        </div>
      </main>
    </div>
  );
}
