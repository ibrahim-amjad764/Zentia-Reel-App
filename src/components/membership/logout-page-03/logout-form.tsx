// "use client"
// import { useState, forwardRef } from "react"
// import { useRouter } from "next/navigation"
// import { Button } from "@/components/ui/button"
// import { toast } from "sonner"
// import { logout } from "@/src/services/auth.service"

// interface LogoutButtonProps {
//   onDone?: () => void
// }

// const LogoutButton = forwardRef<HTMLButtonElement, LogoutButtonProps>(
//   ({ onDone }, ref) => {
//     const [loading, setLoading] = useState(false)
//     const router = useRouter()

//     const handleLogout = async () => {
//       setLoading(true)
//       const toastId = toast.loading("Logging out...")
//       try {
//         await logout()
//         toast.success("Logout successful", { id: toastId })
//         onDone?.()        // optional dropdown close
//         router.push("/auth/login")
//       } catch (error: any) {
//         toast.error(error.message || "Logout failed", { id: toastId })
//       } finally {
//         setLoading(false)
//       }
//     }

//     return (
//       <Button
//         ref={ref}
//         variant="destructive"
//         className="w-full justify-start"
//         onClick={handleLogout}
//         disabled={loading}
//       >
//         {loading ? "Logging out..." : "Logout"}
//       </Button>
//     )
//   }
// )

// LogoutButton.displayName = "LogoutButton"

// export default LogoutButton


"use client";
import { useState, forwardRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../../../../components/ui/button";
import { toast } from "sonner";
import { logout } from "@/services/auth.service";

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
      } catch (error: any) {
        toast.error(error.message || "Logout failed", { id: toastId }); // Show error toast
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