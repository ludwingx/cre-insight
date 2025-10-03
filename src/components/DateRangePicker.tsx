"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover } from "@/components/ui/popover";

interface DateRangePickerProps {
  onDateRangeChange: (startDate: Date | null, endDate: Date | null) => void;
}

export function DateRangePicker({ onDateRangeChange }: DateRangePickerProps) {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);

  const handleApplyFilter = () => {
    // Convertir strings a objetos Date
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    
    // Si hay una fecha de fin, ajustarla para incluir todo el día
    if (end) {
      end.setHours(23, 59, 59, 999);
    }
    
    onDateRangeChange(start, end);
    setIsOpen(false);
  };

  const handleClearFilter = () => {
    setStartDate("");
    setEndDate("");
    onDateRangeChange(null, null);
    setIsOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="start-date">Fecha inicial</Label>
        <Input
          id="start-date"
          type="date"
          value={startDate}
          onChange={e => setStartDate(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="end-date">Fecha final</Label>
        <Input
          id="end-date"
          type="date"
          value={endDate}
          onChange={e => setEndDate(e.target.value)}
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={handleClearFilter}>Limpiar</Button>
        <Button variant="default" onClick={handleApplyFilter}>Aplicar</Button>
      </div>
    </div>
  );
}
