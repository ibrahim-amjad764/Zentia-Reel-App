"use client";

import * as React from "react";
import { PanelLeft } from "lucide-react";
import { cn } from "@/lib/utils";

// Context for sidebar open state
const SidebarContext = React.createContext<{
  open: boolean;
  setOpen: (v: boolean) => void;
} | null>(null);

/** Wraps layout; provides sidebar state */
export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(true);
  return (
    <SidebarContext.Provider value={{ open, setOpen }}>
      {children}
    </SidebarContext.Provider>
  );
}

/** Toggle button for sidebar */
export function SidebarTrigger({
  className,
  ...props
}: React.ComponentProps<"button">) {
  const ctx = React.useContext(SidebarContext);
  if (!ctx) return null;
  return (
    <button
      type="button"
      onClick={() => ctx.setOpen(!ctx.open)}
      className={cn("p-2 rounded-md hover:bg-accent", className)}
      {...props}
    >
      <PanelLeft className="size-5" />
    </button>
  );
}

/** Sidebar panel with nav links */
export function Sidebar({
  className,
  children,
  ...props
}: React.ComponentProps<"aside">) {
  const ctx = React.useContext(SidebarContext);
  if (!ctx) return <aside {...props}>{children}</aside>;
  return (
    <aside
      className={cn(
        "border-r bg-card transition-all",
        ctx.open ? "w-56" : "w-0 overflow-hidden",
        className
      )}
      {...props}
    >
      {children}
    </aside>
  );
}
