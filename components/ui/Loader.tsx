"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  size?: "sm" | "md" | "lg";
}

const sizeConfig = {
  sm: { container: "size-20", title: "text-sm font-medium", subtitle: "text-xs", maxW: "max-w-48" },
  md: { container: "size-32", title: "text-base font-medium", subtitle: "text-sm", maxW: "max-w-56" },
  lg: { container: "size-40", title: "text-lg font-semibold", subtitle: "text-base", maxW: "max-w-64" },
};

export default function Loader({
  title = "Loading...",
  subtitle = "Please wait",
  size = "lg",
  className,
  ...props
}: LoaderProps) {
  const cfg = sizeConfig[size];

  return (
    <div className={cn("flex flex-col items-center justify-center gap-8 p-8 min-h-[40vh]", className)} {...props}>
      <motion.div
        className={cn("relative", cfg.container)}
        animate={{ scale: [1, 1.02, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: [0.4, 0, 0.6, 1] }}
      >
        {/* Primary ring */}
        <motion.div
          className="absolute inset-0 rounded-full bg-black/80 dark:bg-white/80"
          style={{
            mask: "radial-gradient(circle at 50% 50%, transparent 35%, black 37%, black 39%, transparent 41%)",
            WebkitMask: "radial-gradient(circle at 50% 50%, transparent 35%, black 37%, black 39%, transparent 41%)",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
        {/* Secondary ring (counter) */}
        <motion.div
          className="absolute inset-0 rounded-full bg-black/50 dark:bg-white/50"
          style={{
            mask: "radial-gradient(circle at 50% 50%, transparent 45%, black 47%, black 51%, transparent 53%)",
            WebkitMask: "radial-gradient(circle at 50% 50%, transparent 45%, black 47%, black 51%, transparent 53%)",
          }}
          animate={{ rotate: -360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />
      </motion.div>

      <motion.div
        className={cn("text-center space-y-2", cfg.maxW)}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <p className={cn(cfg.title, "text-black/90 dark:text-white/90")}>{title}</p>
        <p className={cn(cfg.subtitle, "text-black/60 dark:text-white/60")}>{subtitle}</p>
      </motion.div>
    </div>
  );
}
