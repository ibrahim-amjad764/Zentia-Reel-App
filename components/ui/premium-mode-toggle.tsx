"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useStore } from "../../src/store/useStore";

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
  }, []);

  const isDark = mode === "dark";

  const toggleTheme = () => setMode(isDark ? "light" : "dark");

  const sizeConfig = {
    sm: { width: 14, height: 7, icon: 16, slider: 5 },
    md: { width: 16, height: 8, icon: 18, slider: 6 },
    lg: { width: 20, height: 10, icon: 20, slider: 8 },
  };
  const config = sizeConfig[size];

  if (!mounted) {
    return <div className={`w-${config.width} h-${config.height} rounded-full glass-placeholder ${className}`} />;
  }

  return (
    <motion.div
      className={`relative w-${config.width} h-${config.height} rounded-full glass-ultra cursor-pointer ${className}`}
      onClick={toggleTheme}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      animate={{ y: [0, -2, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* Glass background */}
      <div className="absolute inset-0 rounded-full backdrop-blur-md bg-white/20 dark:bg-gray-900/30 border border-white/20 dark:border-gray-700/20 shadow-inner-ultra" />

      {/* Slider */}
      <motion.div
        className={`absolute top-1 w-${config.slider} h-${config.slider} rounded-full bg-white/80 dark:bg-gray-700 border border-white/30 dark:border-gray-600 shadow-md z-10 flex items-center justify-center`}
        animate={{
          x: isDark
            ? size === "sm"
              ? 20
              : size === "md"
              ? 24
              : 32
            : 4,
        }}
        transition={{
          type: "spring",
          damping: 20,
          stiffness: 180,
        }}
      >
        {/* Sun/Moon Icon */}
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            <motion.div
              key="moon"
              className="w-full h-full flex items-center justify-center"
              initial={{ scale: 0.5, opacity: 0, rotate: -90 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.5, opacity: 0, rotate: 90 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              <Moon size={config.icon} className="text-purple-600 drop-shadow-lg" />
            </motion.div>
          ) : (
            <motion.div
              key="sun"
              className="w-full h-full flex items-center justify-center"
              initial={{ scale: 0.5, opacity: 0, rotate: 90 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.5, opacity: 0, rotate: -90 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              <Sun size={config.icon} className="text-yellow-400 drop-shadow-md" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Slow glowing aura */}
      <motion.div
        className="absolute inset-0 rounded-full pointer-events-none"
        animate={{
          boxShadow: isDark
            ? ["0 0 0px rgba(120,80,240,0.1)", "0 0 6px rgba(120,80,240,0.15)", "0 0 12px rgba(120,80,240,0.1)"]
            : ["0 0 0px rgba(250,200,60,0.1)", "0 0 6px rgba(250,200,60,0.15)", "0 0 12px rgba(250,200,60,0.1)"],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Floating mini particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(2)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full"
            style={{
              background: isDark ? "rgba(120,80,240,0.4)" : "rgba(250,200,60,0.4)",
              left: `${15 + i * 30}%`,
              top: `${20 + i * 25}%`,
            }}
            animate={{
              y: [0, -4, 0],
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 3 + i,
              repeat: Infinity,
              delay: i * 0.5,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}