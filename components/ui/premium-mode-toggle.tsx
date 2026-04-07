"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon, Sparkles } from "lucide-react";
import { useStore } from "../../src/store/useStore";

/**
 * PremiumModeToggle
 * 
 * Purpose: A high-end theme toggle designed for the Zentia luxury interface.
 * Features:
 * - Gold-plated aesthetic with obsidian background
 * - Advanced multi-layered glass shadows
 * - Sophisticated slide-and-rotate animations
 * - Real-time state persistence with custom store
 */

interface PremiumModeToggleProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function PremiumModeToggle({
  className = "",
  size = "md",
}: PremiumModeToggleProps) {
  const [mounted, setMounted] = useState(false);
  const { mode, setMode } = useStore();

  useEffect(() => {
    setMounted(true);
    console.log("[ThemeToggle] Mounted with current mode:", mode);
  }, [mode]);

  const isDark = mode === "dark";

  const toggleTheme = () => {
    const nextMode = isDark ? "light" : "dark";
    console.log(`[ThemeToggle] Switching to ${nextMode} mode`);
    setMode(nextMode);
  };

  const sizeConfig = {
    sm: { width: "w-14", height: "h-7", icon: 14, slider: "w-5 h-5", travel: 28 },
    md: { width: "w-16", height: "h-8", icon: 16, slider: "w-6 h-6", travel: 32 },
    lg: { width: "w-20", height: "h-10", icon: 20, slider: "w-8 h-8", travel: 40 },
  };
  const config = sizeConfig[size];

  if (!mounted) {
    return <div className={`${config.width} ${config.height} rounded-full bg-muted/20 animate-pulse ${className}`} />;
  }

  return (
    <motion.div
      className={`relative ${config.width} ${config.height} rounded-full cursor-pointer p-1 overflow-hidden transition-colors duration-500 ${isDark ? 'bg-[#050505]' : 'bg-[#f8f9fa]'} border border-[#bf953f]/30 shadow-inner ${className}`}
      onClick={toggleTheme}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Background Track with Subtle Gradients */}
      <div className={`absolute inset-0 opacity-10 ${isDark ? 'bg-gradient-to-r from-[#d4af37] to-transparent' : 'bg-gradient-to-r from-transparent to-[#aa771c]'}`} />
      
      {/* Interactive Slider Handle */}
      <motion.div
        className={`relative z-10 ${config.slider} rounded-full flex items-center justify-center shadow-[0_2px_10px_rgba(0,0,0,0.4)] border border-[#bf953f]/50`}
        animate={{
          x: isDark ? config.travel : 0,
          rotate: isDark ? 360 : 0,
          background: isDark 
            ? "linear-gradient(135deg, #1a1a1a 0%, #000000 100%)" 
            : "linear-gradient(135deg, #ffffff 0%, #e8e8e8 100%)"
        }}
        transition={{
          type: "spring",
          damping: 22,
          stiffness: 240,
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            <motion.div
              key="moon"
              initial={{ scale: 0, opacity: 0, rotate: -90 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0, opacity: 0, rotate: 90 }}
              className="text-[#d4af37]"
            >
              <Moon size={config.icon} strokeWidth={2.5} />
            </motion.div>
          ) : (
            <motion.div
              key="sun"
              initial={{ scale: 0, opacity: 0, rotate: 90 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0, opacity: 0, rotate: -90 }}
              className="text-[#aa771c]"
            >
              <Sun size={config.icon} strokeWidth={2.5} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Decorative Premium Dots */}
      <div className="absolute inset-0 flex justify-between items-center px-3 pointer-events-none opacity-40">
        <Sparkles size={8} className={isDark ? "text-[#d4af37] opacity-10" : "text-[#aa771c] opacity-80"} />
        <Sparkles size={8} className={isDark ? "text-[#d4af37] opacity-80" : "text-[#aa771c] opacity-10"} />
      </div>

      {/* Internal Glow Effect */}
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={{
          boxShadow: isDark 
            ? "inset 0 0 10px rgba(212,175,55,0.15)" 
            : "inset 0 0 10px rgba(170,119,28,0.08)"
        }}
      />
    </motion.div>
  );
}