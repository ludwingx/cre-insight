"use client";
import React from "react";
import {
  ChartContainer,
  ChartTooltip,
  ChartLegend,
  ChartStyle,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts";

interface ActivityChartProps {
  data: { label: string; value: number }[];
  color?: string;
  height?: number;
}

export function ActivityChart({ data, color = "#2563eb", height = 260 }: ActivityChartProps) {
  // Config para shadcn chart
  const config = {
    actividad: {
      label: "Publicaciones",
      color,
    },
  };
  return (
    <ChartContainer config={config} style={{ width: "100%", height }}>
      <BarChart data={data} barCategoryGap={16}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="label" tick={{ fontSize: 12 }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
        <Bar dataKey="value" fill="var(--color-actividad)" name="Publicaciones" />
        <ChartTooltip />
        <ChartLegend />
      </BarChart>
    </ChartContainer>
  );
}
