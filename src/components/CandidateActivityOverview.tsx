"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Helper: format YYYY-MM-DD using La Paz time (UTC-4, no DST)
function ymdInLaPaz(dateUTC: Date): string {
  const laPaz = new Date(dateUTC.getTime() - 4 * 60 * 60 * 1000)
  const y = laPaz.getUTCFullYear()
  const m = String(laPaz.getUTCMonth() + 1).padStart(2, "0")
  const d = String(laPaz.getUTCDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

export const CandidateActivityOverview = React.memo(CandidateActivityOverviewImpl)

function addDaysUTC(d: Date, days: number) {
  const nd = new Date(d)
  nd.setUTCDate(nd.getUTCDate() + days)
  return nd
}

const chartConfig = {
  // Facebook brand blue
  facebook: { label: "Facebook", color: "#1877F2" },
  // Instagram pink
  instagram: { label: "Instagram", color: "#E1306C" },
  // TikTok black
  tiktok: { label: "TikTok", color: "#000000" },
} satisfies ChartConfig

type DailyItem = { date: string; facebook: number; instagram: number; tiktok: number }

function CandidateActivityOverviewImpl() {
  const [timeRange, setTimeRange] = React.useState<"7d" | "30d" | "90d">("7d")
  const [data, setData] = React.useState<DailyItem[]>([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const reqIdRef = React.useRef(0)
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const load = React.useCallback(async (range: "7d" | "30d" | "90d") => {
    const myId = ++reqIdRef.current
    try {
      setLoading(true)
      setError(null)
      const nowUTC = new Date()
      // Fin del rango: ayer en La Paz (no hoy)
      const ayerUTC = addDaysUTC(nowUTC, -1)
      const hasta = ymdInLaPaz(ayerUTC)
      const days = range === "7d" ? 7 : range === "30d" ? 30 : 90
      // desde: ventana que termina ayer (inclusive)
      const desde = ymdInLaPaz(addDaysUTC(ayerUTC, -(days - 1)))

      // Timeout con Promise.race para evitar AbortError en consola
      const timeoutMs = 60000
      const timeoutPromise = new Promise<"timeout">((resolve) => setTimeout(() => resolve("timeout"), timeoutMs))
      const fetchPromise = fetch(`/api/posts-daily?desde=${desde}&hasta=${hasta}`)
      const raced = await Promise.race([fetchPromise, timeoutPromise])
      if (raced === "timeout") {
        // Si otra solicitud comenzó después, no sobreescribas
        if (myId === reqIdRef.current) {
          setError("La solicitud tardó demasiado y fue cancelada. Intenta de nuevo.")
        }
        return
      }
      const res = raced as Response
      if (!res.ok) throw new Error(`Error ${res.status}`)
      const json = await res.json()
      const arr: DailyItem[] = json.data || []
      if (myId === reqIdRef.current) {
        setData(arr)
      }
    } catch (e: any) {
      console.error("CandidateActivityOverview load error", e)
      if (myId === reqIdRef.current) {
        setError(e?.message || "Error cargando datos")
      }
    } finally {
      if (myId === reqIdRef.current) {
        setLoading(false)
      }
    }
  }, [])

  React.useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      load(timeRange)
    }, 250)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [timeRange, load])

  return (
    <Card className="w-full h-auto pt-4 pb-4 px-4">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>Actividad diaria por red</CardTitle>
          <CardDescription>
            Conteo de publicaciones diarias (Facebook, Instagram, TikTok) · {timeRange === "7d" ? "Últimos 7 días" : timeRange === "30d" ? "Últimos 30 días" : "Últimos 90 días"}
          </CardDescription>
        </div>
        <Select value={timeRange} onValueChange={(v) => setTimeRange(v as any)}>
          <SelectTrigger className="hidden w-[160px] rounded-lg sm:ml-auto sm:flex" aria-label="Rango de tiempo">
            <SelectValue placeholder="Últimos 30 días" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="90d" className="rounded-lg">Últimos 90 días</SelectItem>
            <SelectItem value="30d" className="rounded-lg">Últimos 30 días</SelectItem>
            <SelectItem value="7d" className="rounded-lg">Últimos 7 días</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-0 pt-4 sm:px-0 sm:pt-6">
        {error && (
          <div className="flex items-center gap-3 text-sm text-red-600">
            <span>{error}</span>
            <button
              className="rounded-md border px-2 py-1 text-xs text-red-700 hover:bg-red-50"
              onClick={() => load(timeRange)}
            >
              Reintentar
            </button>
          </div>
        )}
        {!error && data.length === 0 && !loading && (
          <div className="text-sm text-muted-foreground">Sin datos para el rango seleccionado.</div>
        )}
        {!error && data.length > 0 && (
          <ChartContainer config={chartConfig} className="w-full h-[260px] sm:h-[320px] md:h-[380px]">
            <AreaChart data={data} margin={{ left: 40, right: 0 }}>
              <defs>
                <linearGradient id="fillFacebook" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1877F2" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#1877F2" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="fillInstagram" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#E1306C" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#E1306C" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="fillTikTok" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#000000" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#000000" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <YAxis
                width={40}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fontSize: 12 }}
                allowDecimals={false}
                domain={[0, (dataMax: any) => Math.max(100, Math.ceil(dataMax / 50) * 50)]}
                label={{
                  value: "Publicaciones",
                  angle: -90,
                  offset: -20,
                  position: "insideLeft",
                  style: {  textAnchor: "middle", fontSize: 16, fill: "#888", fontWeight: "bold" },
                }}
              />
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value: string) => {
                  const d = new Date(`${value}T00:00:00-04:00`)
                  return d.toLocaleDateString("es-BO", { month: "short", day: "numeric" })
                }}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value: string) => new Date(`${value}T00:00:00-04:00`).toLocaleDateString("es-BO", { weekday: "short", year: "numeric", month: "short", day: "numeric" })}
                    indicator="dot"
                  />
                }
              />
              {/* Render TikTok first (bottom), then Instagram, then Facebook last (top) */}
              <Area dataKey="tiktok" name="TikTok" type="natural" fill="url(#fillTikTok)" stroke="#000000" strokeWidth={2} stackId="a" />
              <Area dataKey="instagram" name="Instagram" type="natural" fill="url(#fillInstagram)" stroke="#E1306C" strokeWidth={2} stackId="a" />
              <Area dataKey="facebook" name="Facebook" type="natural" fill="url(#fillFacebook)" stroke="#1877F2" strokeWidth={2} stackId="a" />
              <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
