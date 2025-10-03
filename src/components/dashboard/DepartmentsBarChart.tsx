"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, LabelList, Cell } from "recharts";

// Paleta de colores para las barras
const barColors = [
    '#17368a', // Azul principal
  ];
  

interface DepartmentData {
  department: string;
  count: number | bigint;
}

interface DepartmentsBarChartProps {
  data: DepartmentData[];
}

export function DepartmentsBarChart({ data }: DepartmentsBarChartProps) {
  // Convert all count values to Number (handle BigInt)
  const normalizedData = data.map((item) => ({
    ...item,
    count: typeof item.count === 'bigint' ? Number(item.count) : item.count,
  }));

  // Sort data by count in descending order and take top 10
  const sortedData = [...normalizedData]
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Calculate max value for percentage calculation
  const maxCount = Math.max(...sortedData.map((item) => item.count), 1);

  // Format data to include percentage
  const chartData = sortedData.map((item) => ({
    ...item,
    percentage: (item.count / maxCount) * 100,
  }));

  return (
    <div className="w-full h-full min-h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          barSize={24}
        >
          <CartesianGrid horizontal={true} vertical={false} stroke="#f0f0f0" />
          <XAxis 
            type="number" 
            domain={[0, maxCount]}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            dataKey="department"
            type="category"
            width={100}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12 }}
          />
          <Bar 
            dataKey="count"
            radius={[0, 4, 4, 0]}
            animationDuration={1000}
            isAnimationActive={true}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={barColors[index % barColors.length]}
              />
            ))}
            <LabelList
              dataKey="count"
              position="right"
              fill="#4b5563"
              style={{ fontSize: '12px' }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
