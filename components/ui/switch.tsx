"use client"

import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border border-white/14 bg-white/6 backdrop-blur-xl shadow-[0_20px_60px_-50px_rgba(0,0,0,0.85)] transition-[background-color,box-shadow,border-color,transform] duration-200 ease-out ring-neon hover:border-white/20 hover:bg-white/8 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary/90 data-[state=unchecked]:bg-white/6",
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block h-5 w-5 rounded-full bg-white shadow-[0_10px_30px_-16px_rgba(0,0,0,0.8)] ring-0 transition-[transform,box-shadow,filter] duration-200 data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0 data-[state=checked]:shadow-[0_0_0_1px_oklch(1_0_0/18%),0_25px_70px_-50px_var(--fx-glow-cyan)]"
      )}
    />
  </SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
