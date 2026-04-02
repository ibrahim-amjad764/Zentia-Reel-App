"use client";

import { useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "./button";
import { useStore } from "../../src/store/useStore";

/**
 * PURPOSE: The ONLY controller for dark/light mode.
 * - No system preference syncing
 * - Persists in localStorage
 * - Applies class on <html> for Tailwind `dark:` styles
 */
export function ModeToggleButton() {
  const mode = useStore((s) => s.mode);
  const hydrated = useStore((s) => s.hydrated);
  const hydrateTheme = useStore((s) => s.hydrateTheme);
  const toggleMode = useStore((s) => s.toggleMode);

  // PURPOSE: Apply persisted theme once per app session (avoid doing this in render).
  useEffect(() => {
    if (hydrated) return;
    console.log("[ModeToggleButton] Hydrating theme on mount");
    hydrateTheme();
  }, [hydrated, hydrateTheme]);

  const isDark = mode === "dark";

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={toggleMode}
      className="rounded-full"
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </Button>
  );
}

