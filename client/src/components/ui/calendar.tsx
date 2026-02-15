import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-6 border border-slate-200 bg-white", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-8 sm:space-y-0",
        month: "space-y-6",
        caption: "flex justify-center pt-2 relative items-center",
        caption_label: "font-mono text-xs uppercase tracking-widest font-bold",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-10 w-10 bg-transparent p-0 text-slate-400 hover:text-slate-950 border-slate-200"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex mb-4",
        head_cell:
          "text-slate-400 font-mono w-10 font-bold uppercase tracking-widest text-[9px]",
        row: "flex w-full mt-2",
        cell: "h-10 w-10 text-center p-0 relative focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-10 w-10 p-0 font-mono text-[10px] aria-selected:opacity-100 rounded-none hover:border hover:border-slate-950 transition-none"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-slate-950 text-white hover:bg-slate-800 hover:text-white focus:bg-slate-950 focus:text-white border-transparent",
        day_today: "border-2 border-slate-950 bg-transparent text-slate-950 font-bold",
        day_outside:
          "day-outside text-slate-300 aria-selected:bg-slate-100 aria-selected:text-slate-400",
        day_disabled: "text-slate-300 opacity-50",
        day_range_middle:
          "aria-selected:bg-slate-100 aria-selected:text-slate-900",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ className, ...props }) => (
          <ChevronLeft className={cn("h-4 w-4", className)} {...props} />
        ),
        IconRight: ({ className, ...props }) => (
          <ChevronRight className={cn("h-4 w-4", className)} {...props} />
        ),
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }