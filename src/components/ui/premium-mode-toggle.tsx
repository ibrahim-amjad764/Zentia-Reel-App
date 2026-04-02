"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useStore } from "../../store/useStore";

/**
 * Premium Glass Mode Toggle Component
 * - Glass-style with blurred translucent panel
 * - Rounded corners (16-24px)
 * - Animated neon gradient borders
 * - Tap/click triggers subtle neon ripple and icon morphing (sun ↔ moon)
 */
interface PremiumModeToggleProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function PremiumModeToggle({ 
  className = "", 
  size = "md" 
}: PremiumModeToggleProps) {
  const [mounted, setMounted] = useState(false);
  const { mode, setMode } = useStore();
  
  console.log(`[PremiumModeToggle] Current mode: ${mode}, mounted: ${mounted}`);

  useEffect(() => {
    setMounted(true);
    console.log("[PremiumModeToggle] Component mounted");
  }, []);

  const isDark = mode === "dark";

  const toggleTheme = () => {
    const newMode = isDark ? "light" : "dark";
    setMode(newMode);
    console.log(`[PremiumModeToggle] Theme toggled to: ${newMode}`);
  };

  // Size configurations for flexibility
  const sizeConfig = {
    sm: { width: "w-14", height: "h-7", iconSize: 16, sliderWidth: "w-5", sliderHeight: "h-5", sliderX: 20 },
    md: { width: "w-16", height: "h-8", iconSize: 18, sliderWidth: "w-6", sliderHeight: "h-6", sliderX: 24 },
    lg: { width: "w-20", height: "h-10", iconSize: 20, sliderWidth: "w-7", sliderHeight: "h-7", sliderX: 32 }
  };

  const config = sizeConfig[size];

  // Loading skeleton state
  if (!mounted) {
    return (
      <div className={`${config.width} ${config.height} rounded-full bg-white/10 backdrop-blur-xl border border-white/20 ${className}`}>
        <div className="w-full h-full rounded-full loading-skeleton-premium" />
      </div>
    );
  }

  return (
    <motion.div
      className={`relative ${config.width} ${config.height} rounded-full cursor-pointer ${className}`}
      onClick={toggleTheme}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.2 }}
      style={{
        // Enhanced glass effect with better visibility
        backdropFilter: 'blur(20px)',
        background: isDark 
          ? 'rgba(255, 255, 255, 0.25)' 
          : 'rgba(255, 255, 255, 0.4)',
        border: '2px solid',
        borderColor: isDark 
          ? 'rgba(255, 255, 255, 0.4)' 
          : 'rgba(255, 255, 255, 0.6)',
        boxShadow: isDark
          ? '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 0 20px rgba(255, 255, 255, 0.1)'
          : '0 8px 32px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.7), 0 0 20px rgba(255, 255, 255, 0.2)'
      }}
    >
      {/* Simple toggle slider */}
      <motion.div
        className={`absolute top-1 ${config.sliderWidth} ${config.sliderHeight} rounded-full flex items-center justify-center z-10`}
        animate={{
          x: isDark ? config.sliderX : 4,
          backgroundColor: isDark 
            ? '#ffffff' 
            : '#000000',
          boxShadow: isDark
            ? '0 2px 8px rgba(0, 0, 0, 0.3)'
            : '0 2px 8px rgba(0, 0, 0, 0.2)'
        }}
        transition={{ 
          type: "spring",
          damping: 25,
          stiffness: 300,
          duration: 0.3
        }}
      >
        {/* Simple icon */}
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            <motion.div
              key="moon"
              className="w-full h-full flex items-center justify-center"
              initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
              transition={{ 
                duration: 0.3,
                ease: "easeInOut"
              }}
            >
              <Moon 
                size={config.iconSize} 
                style={{ 
                  color: isDark ? '#000000' : '#ffffff'
                }}
              />
            </motion.div>
          ) : (
            <motion.div
              key="sun"
              className="w-full h-full flex items-center justify-center"
              initial={{ rotate: 90, opacity: 0, scale: 0.5 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: -90, opacity: 0, scale: 0.5 }}
              transition={{ 
                duration: 0.3,
                ease: "easeInOut"
              }}
            >
              <Sun 
                size={config.iconSize} 
                style={{ 
                  color: isDark ? '#000000' : '#ffffff'
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
