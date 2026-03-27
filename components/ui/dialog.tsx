import * as React from "react";
import { cn } from "@/lib/utils"; // Utility function for conditional classes

// DialogProps to accept children and onClose callback
interface DialogProps {
  isOpen: boolean; // Renamed from `open` to `isOpen` for consistency
  onClose: () => void;
  children: React.ReactNode; // Allow Dialog to accept children
}

const Dialog: React.FC<DialogProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null; // Hide the dialog if not open

  return (
   <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
  <div
    className="
      relative
      w-full max-w-lg
      text-lg font-semibold
      px-12 py-12
      rounded-lg
      bg-gray-250       /* solid background for modal content */
      dark:bg-zinc-800
      shadow-xl dark:shadow-black/60
      flex flex-col items-center justify-center
    "
  >
    <button
      className="
        absolute -top-6 right-2
        text-xl font-bold
        text-gray-300 dark:text-white
        hover:text-red-500
        transition-colors transition-all duration-200 ease-in-out
        hover:scale-105 active:scale-95
      "
      onClick={onClose}
    >
      X
    </button>
    {children} {/* Share Post content stays sharp */}
  </div>
</div>
  );
};

// DialogTrigger component
interface DialogTriggerProps {
  children: React.ReactNode;
  onOpen: () => void; // Function to open the dialog
}

const DialogTrigger: React.FC<DialogTriggerProps> = ({ children, onOpen }) => {
  return (
    <div onClick={onOpen} className="inline-block cursor-pointer">
      {children}
    </div>
  );
};

interface DialogContentProps {
  children: React.ReactNode;
  className?: string; // Optional className for styling purposes
}

const DialogContent: React.FC<DialogContentProps> = ({ children, className }) => {
  return <div className={cn("p-4", className)}>{children}</div>; // Allow dynamic classes
};

interface DialogHeaderProps {
  children: React.ReactNode;
}

const DialogHeader: React.FC<DialogHeaderProps> = ({ children }) => {
  return <div className="text-xl font-semibold">{children}</div>;
};

interface DialogTitleProps {
  children: React.ReactNode;
}

const DialogTitle: React.FC<DialogTitleProps> = ({ children }) => {
  return <div className="text-2xl font-bold mb-4 text-white">{children}</div>;
};

// Export everything
export { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle };