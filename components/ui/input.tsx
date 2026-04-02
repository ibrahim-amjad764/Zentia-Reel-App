import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-xl border border-white/12 bg-white/4 px-3 py-2 text-base text-foreground shadow-[0_20px_60px_-50px_rgba(0,0,0,0.85)] backdrop-blur-xl transition-[border-color,background-color,box-shadow,transform] duration-200 ease-out placeholder:text-muted-foreground/80 ring-neon hover:bg-white/6 hover:border-white/18 focus-visible:bg-white/7 focus-visible:border-white/22 active:scale-[0.995] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
