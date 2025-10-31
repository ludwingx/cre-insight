"use client"

import { Pie, PieChart } from "recharts"
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
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

interface SentimentData {
  name: string
  value: number
  color: string
}

interface SentimentChartProps {
  data: {
    positive: number
    neutral: number
    negative: number
  }
  className?: string
}

export function SentimentChart({ data, className }: SentimentChartProps) {
  const chartData: SentimentData[] = [
    {
      name: "Positivo",
      value: data.positive,
      color: "var(--chart-1)",
    },
    {
      name: "Neutral",
      value: data.neutral,
      color: "var(--chart-3)",
    },
    {
      name: "Negativo",
      value: data.negative,
      color: "var(--chart-2)",
    },
  ]

  const chartConfig = {
    positive: {
      label: "Positivo",
      color: "var(--chart-1)",
    },
    neutral: {
      label: "Neutral",
      color: "var(--chart-3)",
    },
    negative: {
      label: "Negativo",
      color: "var(--chart-2)",
    },
  } satisfies ChartConfig

  const total = chartData.reduce((sum, item) => sum + item.value, 0)

  if (total === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Sentimiento del Público</CardTitle>
          <CardDescription>Distribución de sentimientos en las publicaciones</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center text-muted-foreground">
          No hay datos de sentimiento disponibles
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Sentimiento del Público</CardTitle>
        <CardDescription>Distribución de sentimientos en las publicaciones</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center gap-6">
        <div className="relative h-48 w-48 sm:h-60 sm:w-60">
          <ChartContainer
            config={chartConfig}
            className="[&_.recharts-pie-label-text]:fill-foreground h-full w-full"
          >
            <PieChart>
              <ChartTooltip 
                content={
                  <ChartTooltipContent 
                    formatter={(value) => [
                      `${value} (${Math.round((Number(value) / total) * 100)}%)`,
                      ""
                    ]} 
                  />
                } 
              />
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => 
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                labelLine={false}
              >
                {chartData.map((entry, index) => (
                  <circle
                    key={`cell-${index}`}
                    cx="50%"
                    cy="50%"
                    r={80}
                    fill={entry.color}
                    fillOpacity={0.1}
                  />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
        </div>
        <div className="grid grid-cols-3 gap-4 w-full max-w-md">
          {chartData.map((item) => (
            <div key={item.name} className="flex flex-col items-center">
              <div 
                className="h-3 w-3 rounded-full mb-1" 
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm font-medium">{item.name}</span>
              <span className="text-2xl font-bold">
                {Math.round((item.value / total) * 100)}%
              </span>
              <span className="text-xs text-muted-foreground">
                {item.value} {item.value === 1 ? 'publicación' : 'publicaciones'}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
