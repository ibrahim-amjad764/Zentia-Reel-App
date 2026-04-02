"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useScroll, useTransform, useSpring, MotionValue } from "framer-motion";
import React from "react";

interface ParallaxOptions {
  speed?: number;
  direction?: "up" | "down" | "left" | "right";
  springConfig?: {
    damping: number;
    stiffness: number;
  };
}

export function useParallax(options: ParallaxOptions = {}) {
  const {
    speed = 0.5,
    direction = "up",
    springConfig = { damping: 25, stiffness: 300 }
  } = options;

  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const getTransform = (): MotionValue<number> => {
    switch (direction) {
      case "up":
        return useTransform(scrollYProgress, [0, 1], [100, -100]);
      case "down":
        return useTransform(scrollYProgress, [0, 1], [-100, 100]);
      case "left":
        return useTransform(scrollYProgress, [0, 1], [100, -100]);
      case "right":
        return useTransform(scrollYProgress, [0, 1], [-100, 100]);
      default:
        return useTransform(scrollYProgress, [0, 1], [100, -100]);
    }
  };

  const transform = getTransform();
  const springTransform = useSpring(transform, springConfig);

  return { ref, transform: springTransform };
}

interface ParallaxElementProps {
  children: React.ReactNode;
  className?: string;
  speed?: number;
  direction?: "up" | "down" | "left" | "right";
}

export function ParallaxElement({
  children,
  className = "",
  speed = 0.5,
  direction = "up"
}: ParallaxElementProps) {
  const { ref, transform } = useParallax({ speed, direction });

  return React.createElement(
    "div",
    { ref, className },
    React.createElement(
      motion.div,
      { style: { transform }, className: "h-full" },
      children
    )
  );
}

// Advanced scroll-based animations
export function useScrollAnimations() {
  const [scrollY, setScrollY] = useState(0);
  const [scrollDirection, setScrollDirection] = useState<"up" | "down" | null>(null);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrollY(currentScrollY);

      if (currentScrollY > lastScrollY.current) {
        setScrollDirection("down");
      } else if (currentScrollY < lastScrollY.current) {
        setScrollDirection("up");
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return { scrollY, scrollDirection };
}

// Floating animation hook
export function useFloatAnimation(amplitude = 10, frequency = 0.01) {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setOffset((prev) => prev + frequency);
    }, 16);

    return () => clearInterval(interval);
  }, [frequency]);

  const floatY = Math.sin(offset) * amplitude;
  const floatX = Math.cos(offset * 0.7) * (amplitude * 0.5);

  return { floatY, floatX };
}

// Stagger animation for multiple elements
export const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

export const staggerItem = {
  hidden: { 
    opacity: 0, 
    y: 20,
    scale: 0.95
  },
  show: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      damping: 20,
      stiffness: 300
    }
  }
};

// Glow pulse animation
export const glowPulse = {
  initial: { 
    boxShadow: [
      "0 0 0 0 rgba(0, 255, 245, 0.4)",
      "0 0 0 10px rgba(0, 255, 245, 0.2)",
      "0 0 0 20px rgba(0, 255, 245, 0)"
    ]
  },
  animate: {
    boxShadow: [
      "0 0 0 0 rgba(0, 255, 245, 0.4)",
      "0 0 0 10px rgba(0, 255, 245, 0.2)",
      "0 0 0 20px rgba(0, 255, 245, 0)"
    ]
  },
  transition: {
    duration: 2,
    repeat: Infinity,
    repeatDelay: 1
  }
};

// Parallax background hook
export function useParallaxBackground() {
  const { scrollY } = useScrollAnimations();
  
  // Simple transform functions
  const bgY = scrollY * 0.5;
  const bgScale = 1 + scrollY * 0.0005;

  return { bgY, bgScale };
}
