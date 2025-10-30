'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

type SentimentData = {
  name: string;
  value: number;
  color: string;
};

type SentimentChartProps = {
  data: SentimentData[];
  loading?: boolean;
};

const COLORS = {
  positive: '#10b981',
  neutral: '#6366f1',
  negative: '#ef4444'
};

export function SentimentChart({ data, loading = false }: SentimentChartProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Análisis de Sentimiento</CardTitle>
      </CardHeader>
      <CardContent className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              label={({ name, percent }) => 
                `${name}: ${(percent * 100).toFixed(0)}%`
              }
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => [
                value, 
                'Publicaciones'
              ]}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
