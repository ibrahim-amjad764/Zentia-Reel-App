"use client"
import * as React from "react"
import { Eye, EyeOff, MailIcon, LockIcon, UserIcon } from "lucide-react"
import { getAuth, createUserWithEmailAndPassword, } from "firebase/auth"
import { useState, useEffect } from "react"
import { PremiumModeToggle } from "../../../../components/ui/premium-mode-toggle";
import { useRouter } from "next/navigation"
import { Button } from "../../../../components/ui/button"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { Input } from "../../../../components/ui/input"
import { app } from "@/lib/firebase"
import RippleButton from "@components/ui/RippleButton";

async function saveUserToDB(idToken: string) {
  const res = await fetch("/api/auth/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${idToken}`
    },
    body: JSON.stringify({ idToken }),
  })

  if (!res.ok) {
    const msg = await res.text()
    console.error("Backend DB Creation Failed:", msg)
    throw new Error("Signup DB Sync Failed")
  }
  return res.json()
}

export function SignupForm({ className, ...props }: React.ComponentProps<"div">) {
  useEffect(() => {
    document.title = "Signup | My Next JS App"
  }, [])
  const router = useRouter()

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)
    const name = String(formData.get("name") || "").trim()
    const email = String(formData.get("email") || "").trim()
    const password = String(formData.get("password") || "")
    const confirmPassword = String(formData.get("confirm-password") || "")

    if (!name || !email || !password || !confirmPassword) {
      toast.error("All fields are required")
      return
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long")
      return
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    setLoading(true)
    const toastId = toast.loading("Creating your account...")

    try {
      const auth = getAuth(app)

      // Create Firebase user
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      console.log("Firebase User Created:", cred.user.uid)

      // Get ID token from Firebase
      const idToken = await cred.user.getIdToken(true)
      console.log("Token Issued:", idToken.slice(0, 20), "...")

      // Send token + optional user info to backend for DB & cookie
      await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, name, email }),
      })

      // saved to db user
      await saveUserToDB(idToken)
      toast.success("Account created successfully", { id: toastId })

      router.replace("/feed")

    } catch (err: any) {
      console.error("Signup failed:", err.message || err)
      toast.error(err.message || "Signup failed. Please try again.", { id: toastId })
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
    {/* Soft Floating Shapes */}
    {/* Desktop: extra shapes */}
    <motion.div
      animate={{ y: [0, -25, 0], rotate: [0, 10, 0] }}
      transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      className="absolute top-24 left-24 w-72 h-72 border border-gray-300 dark:border-blue-700 rounded-3xl opacity-40 hidden md:block"
    />
    <motion.div
      animate={{ y: [0, 30, 0], rotate: [0, -15, 0] }}
      transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      className="absolute bottom-32 right-28 w-80 h-80 border border-gray-300 dark:border-blue-700 rounded-full opacity-30 hidden md:block"
    />
    {/* Extra desktop shapes */}
    <motion.div
      animate={{ y: [0, -20, 0], rotate: [0, 15, 0] }}
      transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      className="absolute top-10 right-10 w-60 h-60 border border-gray-300 dark:border-blue-600 rounded-2xl opacity-25 hidden md:block"
    />
    <motion.div
      animate={{ y: [0, 25, 0], rotate: [0, -10, 0] }}
      transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      className="absolute bottom-16 left-16 w-64 h-64 border border-gray-300 dark:border-blue-600 rounded-full opacity-25 hidden md:block"
    />

    {/* Mobile: show fewer floating shapes */}
    <motion.div
      animate={{ y: [0, -20, 0], rotate: [0, 8, 0] }}
      transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      className="absolute top-16 left-8 w-48 h-48 border border-gray-500 dark:border-blue-600 rounded-2xl opacity-30 md:hidden"
    />
    <motion.div
      animate={{ y: [0, 20, 0], rotate: [0, -8, 0] }}
      transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      className="absolute bottom-16 right-8 w-56 h-56 border border-gray-500 dark:border-blue-600 rounded-full opacity-25 md:hidden"
    />

      {/* Premium mode toggle */}
      <div className="absolute top-4 right-4 z-20">
        <PremiumModeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 70, scale: 0.85 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          duration: 0.9,
          type: "spring",
          damping: 25,
          stiffness: 300,
        }}
        className="relative z-10"
      >
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-lg w-full border border-white/40 dark:border-gray-700">
          {/* Modern logo */}
          <motion.div
            className="flex justify-center mb-8"
            animate={{ rotate: [0, -3, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="w-24 h-24 bg-white/80 dark:bg-gray-700 rounded-2xl flex items-center justify-center shadow-lg">
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <svg
                  className="w-12 h-12 text-gray-700 dark:text-gray-300"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </motion.div>
            </div>
          </motion.div>

          {/* Form content (unchanged) */}

          <motion.div
            className="mb-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.7 }}
          >
            <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-3">Join Zentia</h1>
            <p className="text-gray-700 dark:text-gray-400 text-lg">Create your identity today</p>
          </motion.div>

          <motion.form
            onSubmit={handleSignup}
            className="space-y-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.7 }}
          >
            {/* Full Name input */}
            <motion.div
              className="relative"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <Input id="name" name="name" placeholder="Full name" required className="pl-14 rounded-xl h-13 bg-white/80 dark:bg-gray-700 border-white/40 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300" />
              <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 dark:text-gray-500" size={22} />
            </motion.div>

            {/* Email input */}
            <motion.div
              className="relative"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <Input id="email" name="email" type="email" placeholder="Email address" required className="pl-14 rounded-xl h-13 bg-white/80 dark:bg-gray-700 border-white/40 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300" />
              <MailIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 dark:text-gray-500" size={22} />
            </motion.div>

            {/* Password input */}
            <motion.div
              className="relative"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <Input id="password" name="password" type={showPassword ? "text" : "password"} placeholder="Password" required className="pl-14 pr-16 rounded-xl h-13 bg-white/80 dark:bg-gray-700 border-white/40 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300" />
              <LockIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 dark:text-gray-500" size={22} />
              <motion.button type="button" onClick={() => setShowPassword((p) => !p)}
                className="absolute right-4 top-1/2 -translate-y-1/2"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}>
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/60 dark:bg-gray-600 border border-white/40 dark:border-gray-500 transition-all duration-300 hover:bg-white/80 dark:hover:bg-gray-500">
                  {showPassword ? <EyeOff size={20} className="text-gray-700 dark:text-gray-300" /> : <Eye size={20} className="text-gray-700 dark:text-gray-300" />}
                </span>
              </motion.button>
            </motion.div>

            {/* Confirm Password input */}
            <motion.div
              className="relative"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <Input id="confirm-password" name="confirm-password" type={showConfirmPassword ? "text" : "password"} placeholder="Confirm password" required className="pl-14 pr-16 rounded-xl h-13 bg-white/80 dark:bg-gray-700 border-white/40 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300" />
              <LockIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 dark:text-gray-500" size={22} />
              <motion.button type="button" onClick={() => setShowConfirmPassword((p) => !p)}
                className="absolute right-4 top-1/2 -translate-y-1/2"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}>
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/60 dark:bg-gray-600 border border-white/40 dark:border-gray-500 transition-all duration-300 hover:bg-white/80 dark:hover:bg-gray-500">
                  {showConfirmPassword ? <EyeOff size={20} className="text-gray-700 dark:text-gray-300" /> : <Eye size={20} className="text-gray-700 dark:text-gray-300" />}
                </span>
              </motion.button>
            </motion.div>

            {/* Submit button */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.7 }}
            >
              <RippleButton type="submit" loading={loading} className="w-full h-16 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95">
                {loading ? "Creating Account..." : "Start Your Journey"}
              </RippleButton>
            </motion.div>

            {/* Footer */}
            <motion.div
              className="text-center text-sm text-gray-700 dark:text-gray-400 mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.7 }}
            >
              Already part of our universe?{" "}
              <motion.a
                href="/auth/login"
                className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 inline-block"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Sign in
              </motion.a>
            </motion.div>
          </motion.form>
        </div>
      </motion.div>
    </div>
  )
}
