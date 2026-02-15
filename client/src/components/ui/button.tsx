import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-3 whitespace-nowrap rounded-none text-[10px] uppercase tracking-[0.2em] font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-slate-950 text-white hover:bg-slate-800 border-2 border-transparent",
        destructive:
          "bg-red-600 text-white hover:bg-red-700 border-2 border-transparent",
        outline:
          "border-2 border-slate-200 bg-transparent hover:border-slate-950 text-slate-950",
        secondary:
          "bg-slate-100 text-slate-950 hover:bg-slate-200 border-2 border-transparent",
        ghost: "hover:bg-slate-100 hover:text-slate-950",
        link: "font-mono text-slate-400 hover:text-slate-950 p-0 h-auto underline-offset-4 hover:underline",
      },
      size: {
        default: "h-14 px-8",
        sm: "h-10 px-6",
        lg: "h-16 px-12",
        icon: "h-14 w-14",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }