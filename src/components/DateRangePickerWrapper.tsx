"use client";
import { DateRangePicker } from "@/components/DateRangePicker";

interface DateRangePickerWrapperProps {
  startDate: Date | null;
  endDate: Date | null;
}

export function DateRangePickerWrapper({ startDate, endDate }: DateRangePickerWrapperProps) {
  const handleDateRangeChange = (start: Date | null, end: Date | null) => {
    // Construir la URL con los parámetros de búsqueda
    const params = new URLSearchParams();
    if (start) params.set('startDate', start.toISOString());
    if (end) params.set('endDate', end.toISOString());
    
    // Redirigir a la misma página con los nuevos parámetros
    window.location.href = `${window.location.pathname}?${params.toString()}`;
  };

  return <DateRangePicker onDateRangeChange={handleDateRangeChange} />;
}
