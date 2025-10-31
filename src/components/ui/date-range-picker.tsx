"use client"

import * as React from "react"
import { format, parseISO } from "date-fns"
import { cn } from "@/lib/utils"

// This type matches react-day-picker's DateRange
export type DateRange = {
  from?: Date
  to?: Date
}

interface DateRangePickerProps extends React.HTMLAttributes<HTMLDivElement> {
  date?: DateRange | undefined
  onDateChange: (date: DateRange) => void
  className?: string
  fromPlaceholder?: string
  toPlaceholder?: string
}

export function DateRangePicker({
  date,
  onDateChange,
  className,
  fromPlaceholder = 'Desde',
  toPlaceholder = 'Hasta',
}: DateRangePickerProps) {
  const today = new Date()
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  
  // Set default values from props or use current month range
  const [fromDate, setFromDate] = React.useState<string>(
    date?.from ? format(date.from, 'yyyy-MM-dd') : format(firstDayOfMonth, 'yyyy-MM-dd')
  )
  const [toDate, setToDate] = React.useState<string>(
    date?.to ? format(date.to, 'yyyy-MM-dd') : format(today, 'yyyy-MM-dd')
  )

  // Update internal state when date prop changes
  React.useEffect(() => {
    if (date) {
      if (date.from) setFromDate(format(date.from, 'yyyy-MM-dd'))
      if (date.to) setToDate(format(date.to, 'yyyy-MM-dd'))
    }
  }, [date])

  // Update parent when dates change
  const handleDateChange = (type: 'from' | 'to', value: string) => {
    const newDate = new Date(value)
    
    if (type === 'from') {
      setFromDate(value)
      // If the new from date is after the current to date, update both dates
      const newToDate = new Date(value) > (date?.to || today) ? new Date(value) : (date?.to || today)
      setToDate(format(newToDate, 'yyyy-MM-dd'))
      
      onDateChange({
        from: newDate,
        to: newToDate
      })
    } else {
      setToDate(value)
      // If the new to date is before the current from date, update from date
      const newFromDate = new Date(value) < (date?.from || firstDayOfMonth) ? new Date(value) : (date?.from || firstDayOfMonth)
      setFromDate(format(newFromDate, 'yyyy-MM-dd'))
      
      onDateChange({
        from: newFromDate,
        to: newDate
      })
    }
  }

  // Format for display
  const formatDisplayDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'dd/MM/yy')
    } catch {
      return dateString
    }
  }

  return (
    <div className={cn("flex items-center gap-4 w-full", className)}>
      {/* From Date */}
      <div className="flex items-center gap-2 flex-1">
        <label htmlFor="from-date" className="text-sm text-muted-foreground whitespace-nowrap">
          Desde:
        </label>
        <div className="relative flex-1">
          <input
            id="from-date"
            type="date"
            value={fromDate}
            onChange={(e) => handleDateChange('from', e.target.value)}
            max={format(new Date(toDate), 'yyyy-MM-dd')}
            className="flex h-9 w-full rounded-md border border-input bg-background pl-3 pr-9 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        
        </div>
      </div>

      {/* To Date */}
      <div className="flex items-center gap-2 flex-1">
        <label htmlFor="to-date" className="text-sm text-muted-foreground whitespace-nowrap">
          Hasta:
        </label>
        <div className="relative flex-1">
          <input
            id="to-date"
            type="date"
            value={toDate}
            onChange={(e) => handleDateChange('to', e.target.value)}
            min={fromDate}
            max={format(today, 'yyyy-MM-dd')}
            className="flex h-9 w-full rounded-md border border-input bg-background pl-3 pr-9 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
         
        </div>
      </div>
    </div>
  )
}