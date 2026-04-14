"use client";
import { useState, forwardRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../../../../components/ui/button";
import { logout } from "@/services/auth.service";
import { toast } from "sonner";

interface LogoutButtonProps {
  onDone?: () => void; // Optional callback after logout
  className?: string; // Added className to accept custom styles
}

const LogoutButton = forwardRef<HTMLButtonElement, LogoutButtonProps>(
  ({ onDone, className }, ref) => {
    const [loading, setLoading] = useState(false); // State to manage loading status
    const router = useRouter(); // Use Next.js router

    const handleLogout = async () => {
      setLoading(true); // Set loading state to true on logout start
      const toastId = toast.loading("Logging out..."); // Show loading toast
      try {
        await logout(); // Call the logout function from the auth service
        toast.success("Logout successful", { id: toastId }); // Show success toast
        onDone?.(); // Call onDone callback if provided (e.g., for closing modals)
        router.push("/auth/login"); // Redirect to login page
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Logout failed";
        console.error("[Logout] Failed:", error);
        toast.error(message, { id: toastId }); // Show error toast
      } finally {
        setLoading(false); // Set loading to false after logout attempt
      }
    };

    return (
      <Button
        ref={ref}
        variant="destructive"
        className={`${className} w-full justify-start`} // Merge custom className with the default class
        onClick={handleLogout}
        disabled={loading} // Disable button while loading
      >
        {loading ? "Logging out..." : "Logout"} {/* Change text when loading */}
      </Button>
    );
  }
);

LogoutButton.displayName = "LogoutButton"; // Set display name for forwardRef

export default LogoutButton;