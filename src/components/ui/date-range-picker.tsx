"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DateRangePickerProps extends React.HTMLAttributes<HTMLDivElement> {
  date: DateRange | undefined
  onDateChange: (date: DateRange | undefined) => void
  className?: string
  fromPlaceholder?: string
  toPlaceholder?: string
}

function getFirstDayOfMonth() {
  const date = new Date()
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

export function DateRangePicker({
  date: propDate,
  onDateChange,
  className,
  fromPlaceholder = 'Desde',
  toPlaceholder = 'Hasta',
}: DateRangePickerProps) {
  // Set default values if not provided
  const [date, setDate] = React.useState<DateRange | undefined>(() => {
    if (propDate) return propDate
    const today = new Date()
    const firstDayOfMonth = getFirstDayOfMonth()
    return {
      from: firstDayOfMonth,
      to: today
    }
  })

  // Update internal state when propDate changes or when the day changes
  React.useEffect(() => {
    const today = new Date()
    const firstDayOfMonth = getFirstDayOfMonth()
    
    // Always ensure 'to' date is today
    if (propDate) {
      setDate({
        from: propDate.from,
        to: today
      })
    } else {
      setDate({
        from: firstDayOfMonth,
        to: today
      })
    }
    
    // Update the parent component if needed
    if (propDate?.to?.toDateString() !== today.toDateString()) {
      onDateChange?.({
        from: propDate?.from || firstDayOfMonth,
        to: today
      })
    }
  }, [propDate, new Date().toDateString()])

  const [open, setOpen] = React.useState<'desde' | 'hasta' | null>(null)

  const handleDateSelect = (selectedDate: Date | undefined, type: 'desde' | 'hasta') => {
    if (!selectedDate) return

    const newDate = date ? { ...date } : { from: undefined, to: undefined }
    const today = new Date()
    
    if (type === 'desde') {
      // If no date is selected or we're creating a new range
      if (!newDate.from || (newDate.from && newDate.to)) {
        newDate.from = selectedDate
        newDate.to = today // Always set 'to' to today
      } else {
        // If we have a from date but no to date, set the to date to today
        newDate.from = selectedDate < today ? selectedDate : today
        newDate.to = today
      }
    } else {
      // If selecting 'to' date and it's before 'from' date, update 'from' date
      if (newDate.from && selectedDate < newDate.from) {
        newDate.from = selectedDate
      }
      newDate.to = today
    }

    // Only update parent if dates have changed
    if (newDate.from?.toDateString() !== date?.from?.toDateString() || 
        newDate.to?.toDateString() !== date?.to?.toDateString()) {
      onDateChange(newDate)
    }
  }

  return (
    <div className={cn("flex items-center gap-3 w-full", className)}>
      {/* Desde */}
      <div className="flex items-center gap-1 flex-1">
        <span className="text-xs text-muted-foreground whitespace-nowrap w-10">Desde:</span>
        <Popover open={open === 'desde'} onOpenChange={(isOpen) => setOpen(isOpen ? 'desde' : null)}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "justify-start text-left font-normal h-8 text-xs min-w-[80px] hover:cursor-pointer",
                !date?.from && "text-muted-foreground"
              )}
              onClick={() => setOpen('desde')}
            >
              <CalendarIcon className="mr-1 h-3 w-3" />
              {date?.from ? format(date.from, "dd/MM/yy") : fromPlaceholder}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date?.from}
              onSelect={(selectedDate) => {
                handleDateSelect(selectedDate, 'desde')
                setOpen(null)
              }}
              defaultMonth={date?.from || new Date()}
              initialFocus
              disabled={(currentDate) => currentDate > new Date() || currentDate < new Date('1900-01-01')}
              className="border-0"
              modifiers={{
                selected: (day) => {
                  if (!date?.from) return false
                  return day.toDateString() === date.from.toDateString()
                }
              }}
              modifiersClassNames={{
                selected: 'bg-primary text-primary-foreground hover:bg-primary/80',
              }}
            />
          </PopoverContent>
        </Popover>
      </div>
      
      {/* Hasta */}
      <div className="flex items-center gap-1 flex-1">
        <span className="text-xs text-muted-foreground whitespace-nowrap w-10">Hasta:</span>
        <Popover open={open === 'hasta'} onOpenChange={(isOpen) => setOpen(isOpen ? 'hasta' : null)}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "justify-start text-left font-normal h-8 text-xs min-w-[80px] hover:cursor-pointer",
                !date?.to && "text-muted-foreground"
              )}
              onClick={() => setOpen('hasta')}
              disabled={!date?.from}
            >
              <CalendarIcon className="mr-1 h-3 w-3" />
              {date?.to ? format(date.to, "dd/MM/yy") : toPlaceholder}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date?.to}
              onSelect={(selectedDate) => {
                handleDateSelect(selectedDate, 'hasta')
                setOpen(null)
              }}
              defaultMonth={date?.to || date?.from || new Date()}
              initialFocus
              disabled={(currentDate) => {
                const fromDate = date?.from || new Date('1900-01-01')
                return (
                  currentDate > new Date() || 
                  currentDate < new Date('1900-01-01') ||
                  currentDate < fromDate
                )
              }}
              className="border-0"
              modifiers={{
                selected: (day) => {
                  const today = new Date()
                  // Show today as selected if no date is selected yet
                  if (!date?.to) {
                    return day.toDateString() === today.toDateString()
                  }
                  return day.toDateString() === date.to.toDateString()
                },
                today: (day) => {
                  const today = new Date()
                  return day.toDateString() === today.toDateString()
                }
              }}
              modifiersClassNames={{
                selected: 'bg-primary text-primary-foreground hover:bg-primary/80',
              }}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}