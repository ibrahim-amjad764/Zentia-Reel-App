"use client"

import { getAuth, sendPasswordResetEmail } from "firebase/auth"
import { useEffect, useState } from "react"
import { MailIcon, Check } from "lucide-react"
import { Button } from "@components/ui/button"
import { motion } from "framer-motion"
import { Label } from "@components/ui/label"
import { toast } from "sonner"
import { app } from "@/lib/firebase"
import { PremiumModeToggle } from "../../../../components/ui/premium-mode-toggle";
import { Input } from "../../../../components/ui/input"
import RippleButton from "@components/ui/RippleButton";

const ForgotPasswordForm = () => {

  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const auth = getAuth(app)
  useEffect(() => {
    document.title = "Forgot | My Next JS App"
  }, [])

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return toast.error("Please enter your email")
    setLoading(true)
    const toastId = toast.loading("Sending reset link...")
    try {
      await sendPasswordResetEmail(auth, email)
      toast.success("Password reset email sent!", { id: toastId })
      setEmail("")
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to send reset email";
      console.error("[ForgotPassword] Reset error:", error);
      toast.error(message, { id: toastId })
    } finally {
      setLoading(false)
    }
  }

return (
  <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
    {/* Modern clean background */}
    <div className="absolute inset-0 bg-[#F0F4FF] dark:bg-gray-800" />

    {/* Subtle geometric patterns */}
    <div className="absolute inset-0 opacity-5 dark:opacity-10">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(0,0,0,0.15) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
    </div>

    {/* Desktop floating shapes */}
<motion.div
  animate={{ y: [0, -35, 0], rotate: [0, 90, 180] }}
  transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
  className="absolute top-24 left-24 w-28 h-28 border-2 border-gray-600/50 dark:border-gray-700 rounded-lg opacity-30 hidden md:block"
/>
<motion.div
  animate={{ y: [0, 40, 0], rotate: [180, 90, 0] }}
  transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
  className="absolute bottom-24 right-24 w-36 h-36 border-2 border-gray-900/50 dark:border-gray-700 rounded-full opacity-30 hidden md:block"
/>
<motion.div
  animate={{ y: [0, -25, 0], rotate: [0, 180, 360] }}
  transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
  className="absolute top-16 right-32 w-32 h-32 border-2 border-gray-600/50 dark:border-gray-600 rounded-xl opacity-25 hidden md:block"
/>
<motion.div
  animate={{ y: [0, 30, 0], rotate: [0, -90, -180] }}
  transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
  className="absolute bottom-20 left-28 w-28 h-28 border-2 border-gray-800/50 dark:border-gray-600 rounded-2xl opacity-25 hidden md:block"
/>

    {/* Mobile floating shapes */}
    <motion.div
      animate={{ y: [0, -25, 0], rotate: [0, 90, 180] }}
      transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      className="absolute top-20 left-8 w-24 h-24 border-2 border-gray-600/50 dark:border-gray-600 rounded-lg opacity-25 md:hidden"
    />
    <motion.div
      animate={{ y: [0, 30, 0], rotate: [0, -90, -180] }}
      transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      className="absolute bottom-24 right-6 w-28 h-28 border-2 border-gray-600/50 dark:border-gray-600 rounded-full opacity-25 md:hidden"
    />

    {/* Premium mode toggle */}
    <div className="absolute top-4 right-4 z-20">
      <PremiumModeToggle />
    </div>

    {/* Main card */}
    <motion.div
      initial={{ opacity: 0, y: 65, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.85, type: "spring", damping: 25, stiffness: 300 }}
      className="relative z-10"
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full border border-white/40 dark:border-gray-700">
        {/* Modern mail icon */}
        <motion.div
          className="flex justify-center mb-8"
          animate={{ scale: [1, 1.2, 1], rotate: [0, 5, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="w-20 h-20 bg-white/80 dark:bg-gray-700 rounded-2xl flex items-center justify-center shadow-lg">
            <MailIcon className="w-10 h-10 text-gray-700 dark:text-gray-300" />
          </div>
        </motion.div>

        <motion.div
          className="mb-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Reset Password</h1>
          <p className="text-gray-700 dark:text-gray-400 text-lg">Enter your email to reset</p>
        </motion.div>

        <motion.form
          onSubmit={handleReset}
          className="space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          {/* Email input */}
          <motion.div className="relative" whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
            <Label htmlFor="email" className="sr-only">
              Email address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="pl-14 rounded-xl h-13 bg-white/80 dark:bg-gray-700 border-white/40 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
            />
            <MailIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 dark:text-gray-500" size={22} />
          </motion.div>

          {/* Submit button */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.6 }}>
            <RippleButton
              type="submit"
              loading={loading}
              className="w-full h-14 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
            >
              {loading ? "Sending Reset..." : "SEND RESET LINK"}
            </RippleButton>
          </motion.div>

          {/* Footer */}
          <motion.div
            className="text-center text-sm text-gray-700 dark:text-gray-400 mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
          >
            Remember your password?{" "}
            <motion.a
              href="/auth/login"
              className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 inline-block"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Back to login
            </motion.a>
          </motion.div>
        </motion.form>
      </div>
    </motion.div>
  </div>
)
}

export default ForgotPasswordForm