"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * PURPOSE: Lightweight progress bar for uploads/loading micro-interactions.
 * - Works with percentages (0-100)
 * - Accessible (role/progressbar + aria values)
 */
export function Progress({
  value,
  className,
  indicatorClassName,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  value: number;
  indicatorClassName?: string;
}) {
  const safe = Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : 0;

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={safe}
      className={cn(
        "h-2 w-full overflow-hidden rounded-full bg-white/10 border border-white/10 backdrop-blur",
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "h-full w-full origin-left bg-linear-to-r from-[oklch(0.62_0.12_210)] to-[oklch(0.62_0.12_190)] shadow-[0_0_0_1px_oklch(1_0_0/10%),0_25px_70px_-55px_var(--fx-glow-cyan)] transition-transform duration-300 ease-out",
          indicatorClassName
        )}
        style={{ transform: `scaleX(${safe / 100})` }}
      />
    </div>
  );
}

