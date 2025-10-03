'use client';

import { Bar, BarChart, XAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface ParticipationBarChartProps {
  active: number;
  total: number;
  date: string;
}

const chartConfig = {
  participaron: {
    label: "Participaron",
    color: "var(--chart-1)",
  },
  noparticiparon: {
    label: "No participaron",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export function ParticipationBarChart({ active, total, date }: ParticipationBarChartProps) {
  const data = [{
    date,
    participaron: active,
    noparticiparon: Math.max(0, total - active),
  }];

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Participación de candidatos (ayer)</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart data={data} barCategoryGap={0}>
            <XAxis
              dataKey="date"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={() => ''}
            />
            <Bar
              dataKey="participaron"
              stackId="a"
              fill="var(--color-participaron)"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="noparticiparon"
              stackId="a"
              fill="var(--color-noparticiparon)"
              radius={[0, 0, 4, 4]}
            />
            <ChartTooltip
              content={<ChartTooltipContent indicator="line" />}
              cursor={false}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
