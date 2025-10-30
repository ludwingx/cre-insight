'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

type EngagementData = {
  date: string;
  likes: number;
  comments: number;
  shares: number;
};

type EngagementChartProps = {
  data: EngagementData[];
  loading?: boolean;
};

export function EngagementChart({ data, loading = false }: EngagementChartProps) {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Interacción de Publicaciones</CardTitle>
      </CardHeader>
      <CardContent className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 0,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(value) => format(new Date(value), 'd MMM', { locale: es })}
              tick={{ fontSize: 12 }}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip 
              labelFormatter={(value) => format(new Date(value), 'PPP', { locale: es })}
              formatter={(value, name) => [value, 
                name === 'likes' ? 'Me gusta' : 
                name === 'comments' ? 'Comentarios' : 'Compartidas']}
            />
            <Bar dataKey="likes" fill="#8884d8" name="Me gusta" />
            <Bar dataKey="comments" fill="#82ca9d" name="Comentarios" />
            <Bar dataKey="shares" fill="#ffc658" name="Compartidas" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
