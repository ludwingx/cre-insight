'use client';

import { PieChart, Pie, Cell } from "recharts";
import React from "react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../ui/chart";

interface SocialMediaData {
  platform: string;
  count: number;
}

interface SocialMediaPieChartProps {
  data: SocialMediaData[];
}

const COLORS = {
  'Facebook': 'hsl(221.2 83.2% 53.3%)',
  'Instagram': 'hsl(329.5 88.3% 60.6%)',
  'TikTok': 'hsl(0 0% 13.3%)'
};

export function SocialMediaPieChart({ data }: SocialMediaPieChartProps) {
  const total = data.reduce((sum, item) => sum + item.count, 0);
  
  const chartConfig = {
    Facebook: { label: 'Facebook', color: COLORS.Facebook },
    Instagram: { label: 'Instagram', color: COLORS.Instagram },
    TikTok: { label: 'TikTok', color: COLORS.TikTok }
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-4">
        {/* Gráfico de pastel */}
        <div className="w-48 h-48 md:w-52 md:h-52">
          <ChartContainer 
            config={chartConfig}
            className="w-full h-full [&_.recharts-pie-label-text]:fill-foreground"
          >
              <PieChart width={200} height={200}>
                <Pie 
                  data={data} 
                  dataKey="count"
                  nameKey="platform"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={1}
                  labelLine={false}
                >
                  {data.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`}
                      fill={COLORS[entry.platform as keyof typeof COLORS]}
                      stroke="#fff"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <ChartTooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      const percent = (data.count / total * 100).toFixed(1);
                      return (
                        <div className="bg-white p-2 border rounded shadow-lg">
                          <p className="font-medium">{data.platform}</p>
                          <p>{data.count} publicaciones</p>
                          <p>{percent}% del total</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ChartContainer>
          </div>

          {/* Leyenda */}
          <div className="w-full md:w-auto mt-4 md:mt-0">
            <div className="space-y-3">
              {data.map((item) => {
                const percent = total > 0 ? (item.count / total * 100).toFixed(1) : 0;
                return (
                  <div key={item.platform} className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: COLORS[item.platform as keyof typeof COLORS] }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium truncate">{item.platform}</span>
                        <span className="ml-2 font-medium">{percent}%</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {item.count} publicaciones
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
  );
}
