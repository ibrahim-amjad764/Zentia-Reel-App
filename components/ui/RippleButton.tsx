"use client";

import { useRef, useState, forwardRef } from "react";
import { Button } from "../ui/button"; // your existing Button

interface RippleButtonProps {
  loading?: boolean;
  children: React.ReactNode;
  className?: string;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
}

const RippleButton = forwardRef<HTMLButtonElement, RippleButtonProps>(
  ({ loading, children, className, ...props }, ref) => {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [pos, setPos] = useState({ x: 0, y: 0 });

    const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setPos({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
    };

    return (
      <Button
        ref={(el) => {
          buttonRef.current = el;
          if (typeof ref === "function") ref(el);
          else if (ref) ref.current = el;
        }}
        className={`relative overflow-hidden group ${className}`}
        onMouseEnter={handleMouseEnter}
        disabled={loading}
        {...props}
      >
        {/* Ripple effect */}
        <span
          className="absolute w-10 h-10 rounded-full scale-0 transition-transform duration-700 ease-in-out group-hover:scale-[15] pointer-events-none bg-white/20"
          style={{
            left: pos.x - 20,
            top: pos.y - 20,
          }}
        />
        {/* Button content */}
        <span className="relative z-10">{children}</span>
      </Button>
    );
  }
);

RippleButton.displayName = "RippleButton";

export default RippleButton;