import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-neon select-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-neon transition-[transform,box-shadow,filter] duration-200 ease-out hover:brightness-110 hover:-translate-y-0.5 hover:shadow-[0_0_0_1px_oklch(1_0_0_/_12%),_0_30px_90px_-55px_var(--fx-glow-cyan),_0_30px_90px_-60px_var(--fx-glow-violet)] active:translate-y-0 active:scale-[0.985]",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm transition-[transform,box-shadow,filter] duration-200 ease-out hover:brightness-110 active:scale-[0.985]",
        outline:
          "border border-white/12 bg-white/4 text-foreground backdrop-blur-xl shadow-[0_20px_60px_-45px_rgba(0,0,0,0.85)] transition-[transform,box-shadow,background-color,border-color] duration-200 ease-out hover:bg-white/7 hover:border-white/18 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.985]",
        secondary:
          "bg-secondary text-secondary-foreground border border-white/10 shadow-sm transition-[transform,box-shadow,filter] duration-200 ease-out hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.985]",
        ghost:
          "bg-transparent text-foreground/90 transition-[transform,background-color,color] duration-200 ease-out hover:bg-white/7 hover:text-foreground active:scale-[0.985]",
        link:
          "bg-transparent text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
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
