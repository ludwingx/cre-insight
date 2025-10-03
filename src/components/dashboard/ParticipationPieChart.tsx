'use client';

interface ParticipationPieChartProps {
  active: number;
  total: number;
  candidateName: string;
  date: string;
}

export function ParticipationPieChart({ active, total, date }: ParticipationPieChartProps) {
  const percentage = Math.round((active / total) * 100);
  const remainingPercentage = 100 - percentage;

  return (
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl text-green-600 font-bold">
              {percentage}% 
            </div>
            <div className="text-sm text-green-600">
              Activos
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl text-red-600 font-bold">
              {remainingPercentage}%
            </div>
            <div className="text-sm text-red-600">
              No activos
            </div>
          </div>
        </div>
  );
}
