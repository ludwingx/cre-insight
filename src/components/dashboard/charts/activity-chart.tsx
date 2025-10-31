"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
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

interface ActivityChartProps {
  data: Array<{
    date: string
    posts: number
    interactions: number
  }>
  className?: string
  timeRange: 'day' | 'week' | 'month'
}

export function ActivityChart({ data, className, timeRange }: ActivityChartProps) {
  // Use the full data passed from parent, as it's already filtered by the main date range
  const filteredData = React.useMemo(() => {
    if (!data.length) return [];
    return [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [data])

  const chartConfig = {
    posts: {
      label: "Publicaciones",
      color: "var(--primary)",
    },
    interactions: {
      label: "Interacciones",
      color: "var(--chart-2)",
    },
  } satisfies ChartConfig

  if (!data.length) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Actividad de Publicaciones</CardTitle>
          <CardDescription>Interacción diaria en el período seleccionado</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center text-muted-foreground">
          No hay datos disponibles
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="w-full">
          <CardTitle>Actividad de Publicaciones</CardTitle>
          <CardDescription>Interacción diaria en el período seleccionado</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillPosts" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillInteractions" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={12}
              minTickGap={32}
              tickFormatter={(value) => {
                // Value is already in DD/MM format from processEngagementData
                return value || '';
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    try {
                      // Get the index of the data point to access the original date
                      const dataPoint = filteredData.find(item => item.date === value);
                      if (!dataPoint) return value;
                      
                      // For tooltip, we'll show a more detailed date format
                      // Since we're using DD/MM format in the data, we need to parse it back to a date
                      const [day, month] = value.split('/').map(Number);
                      const currentYear = new Date().getFullYear();
                      const date = new Date(currentYear, month - 1, day);
                      
                      if (isNaN(date.getTime())) return value;
                      
                      return date.toLocaleDateString('es-ES', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      });
                    } catch (error) {
                      console.error('Error formatting tooltip date:', error);
                      return value;
                    }
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="posts"
              type="monotone"
              fill="url(#fillPosts)"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={false}
            />
            <Area
              dataKey="interactions"
              type="monotone"
              fill="url(#fillInteractions)"
              stroke="var(--chart-2)"
              strokeWidth={2}
              dot={false}
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
