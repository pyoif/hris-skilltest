import * as React from "react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"
import { cn } from "../../lib/utils"
import { Button } from "./button"
import { Calendar } from "./calendar"
import { Popover, PopoverContent, PopoverTrigger } from "./popover"

interface DateRangePickerProps {
  value?: DateRange
  onChange?: (range: DateRange | undefined) => void
  className?: string
  placeholder?: string
  disabled?: boolean
}

export function DateRangePicker({
  value,
  onChange,
  className,
  placeholder = "Pilih rentang tanggal",
  disabled = false,
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            disabled={disabled}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !value && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value?.from ? (
              value.to ? (
                <>
                  {format(value.from, "dd MMM yyyy", { locale: id })} –{" "}
                  {format(value.to, "dd MMM yyyy", { locale: id })}
                </>
              ) : (
                format(value.from, "dd MMM yyyy", { locale: id })
              )
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={value?.from}
            selected={value}
            onSelect={(range) => {
              onChange?.(range)
              if (range?.from && range?.to) {
                setOpen(false)
              }
            }}
            numberOfMonths={2}
            locale={id}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
