"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"

import { cn } from "@/lib/utils"

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    config: any
    children: React.ReactNode
  }
>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-slate-400 [&_.recharts-cartesian-axis-tick_line]:stroke-slate-200 [&_.recharts-curve.recharts-line]:stroke-[3px]",
        className
      )}
      {...props}
    >
      <RechartsPrimitive.ResponsiveContainer width="100%" height="100%">
        {children as any}
      </RechartsPrimitive.ResponsiveContainer>
    </div>
  )
})
ChartContainer.displayName = "ChartContainer"

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof RechartsPrimitive.Tooltip> & {
    hideLabel?: boolean
  }
>(({ active, payload, label, hideLabel }, ref) => {
  if (!active || !payload?.length) return null

  return (
    <div
      ref={ref}
      className="border-2 border-slate-950 bg-white p-4 shadow-[4px_4px_0px_0px_rgba(2,6,23,1)]"
    >
      {!hideLabel && (
        <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-slate-400">
          {label}
        </div>
      )}
      <div className="space-y-1">
        {payload.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div 
              className="h-2 w-2 rounded-none" 
              style={{ backgroundColor: item.color }} 
            />
            <span className="font-mono text-[10px] uppercase font-bold">
              {item.name}: {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
})
ChartTooltipContent.displayName = "ChartTooltip"

export { ChartContainer, ChartTooltipContent }