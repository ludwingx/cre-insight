"use client"

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface MetricItem {
  name: string;
  value: number;
  color: string;
}

interface EngagementMetricsChartProps {
  data: MetricItem[];
  className?: string;
}

export function EngagementMetricsChart({ data, className }: EngagementMetricsChartProps) {
  console.log('Rendering EngagementMetricsChart with:', data);

  if (!data || data.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Distribución</CardTitle>
          <CardDescription>Porcentaje de interacciones</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center text-muted-foreground">
          No hay datos disponibles para mostrar
        </CardContent>
      </Card>
    )
  }

  // Calculate total for percentage
  const total = data.reduce((sum, item) => sum + item.value, 0);

  // Format data with percentages
  const chartData = data.map(item => ({
    ...item,
    percentage: total > 0 ? Math.round((item.value / total) * 100) : 0
  }));

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg text-sm">
          <p className="font-medium">{data.name}</p>
          <p className="text-muted-foreground">{data.percentage}% del total</p>
          <p className="text-xs text-muted-foreground mt-1">
            {data.value} {data.value === 1 ? 'interacción' : 'interacciones'}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Distribución</CardTitle>
        <CardDescription>Porcentaje de interacciones por tipo de contenido</CardDescription>
      </CardHeader>
      <CardContent className="h-[400px] sm:h-[450px]">
        <div className="flex flex-col h-full">
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percentage }) => `${name} ${percentage}%`}
                  labelLine={false}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value, entry: any) => {
                    const data = chartData.find(item => item.name === value);
                    return (
                      <span className="text-sm text-muted-foreground">
                        {value} ({data?.percentage}%)
                      </span>
                    );
                  }}
                  iconType="circle"
                  iconSize={10}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Simple percentage summary */}
          <div className="mt-4 grid grid-cols-2 gap-2">
            {chartData.slice(0, 4).map((item, index) => (
              <div key={index} className="flex items-center">
                <div
                  className="w-3 h-3 rounded-full mr-2 flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <div className="text-sm truncate">
                  <span className="font-medium">{item.percentage}%</span>
                  <span className="text-muted-foreground ml-1 truncate">{item.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Loading skeleton for the chart
export function EngagementMetricsChartSkeleton() {
  return (
    <Card className="w-full">
      <CardHeader>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-64" />
      </CardHeader>
      <CardContent className="h-[300px] sm:h-[350px] flex items-center justify-center">
        <Skeleton className="h-4 w-full" />
      </CardContent>
    </Card>
  )
}
