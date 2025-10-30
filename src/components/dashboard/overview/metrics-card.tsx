import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

type MetricsCardProps = {
  title: string;
  value: string | number;
  change?: number;
  description?: string;
  icon?: React.ReactNode;
  loading?: boolean;
};

export function MetricsCard({
  title,
  value,
  change = 0,
  description,
  icon,
  loading = false,
}: MetricsCardProps) {
  const isPositive = change > 0;
  const isNeutral = change === 0;

  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-16 mb-2" />
          <Skeleton className="h-4 w-32" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="h-4 w-4 text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">
            {!isNeutral && (
              <span
                className={`inline-flex items-center ${
                  isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                }`}
              >
                {isPositive ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1" />
                )}
                {Math.abs(change)}%
              </span>
            )}
            {isNeutral && (
              <span className="inline-flex items-center text-muted-foreground">
                <Minus className="h-3 w-3 mr-1" />
                {change}%
              </span>
            )}{' '}
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
