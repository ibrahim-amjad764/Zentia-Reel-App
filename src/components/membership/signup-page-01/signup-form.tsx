"use client"
import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/ui/card"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "../../../../components/ui/field"
import { Eye, EyeOff, MailIcon, LockIcon, UserIcon } from "lucide-react"
import { getAuth, createUserWithEmailAndPassword, } from "firebase/auth"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "../../../../components/ui/button"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { Input } from "../../../../components/ui/input"
import { app } from "@/lib/firebase"
import { cn } from "@/lib/utils"

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-gray-800 via-gray-900 to-gray-600 px-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10">
        <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-5 max-w-md w-full border border-gray-500/25 shadow-lg">

          {/* Top Heading */}
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-gray-200 italic">
              Welcome to Firebase Authentication!
            </h1>
            <p className="text-sm text-gray-400 mt-2">
              Start your journey by creating your account below.
            </p>
          </div>

          {/* Avatar */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
              <svg
                className="w-15 h-15 text-white/50" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
          </div>

          {/* Form Title */}
          <div className="mb-6 text-center">
            <h2 className="text-white text-xl font-semibold">Create your account</h2>
            <p className="text-gray-300 mt-1">Enter your details to get started</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-6 text-white">

            {/* Full Name */}
            <div className="relative">
              <input
                id="name" name="name" placeholder="Full name" required
                className="w-full bg-transparent border-b border-white/40 placeholder-white/60 pl-10 py-2 text-white focus:outline-none focus:border-white transition" />
              <UserIcon
                className="absolute left-0 top-1/2 -translate-y-1/2 text-white/60 ml-1.5" size={20} />
            </div>

            {/* Email */}
            <div className="relative">
              <input id="email" name="email" type="email" placeholder="Email address" required
                className="w-full bg-transparent border-b border-white/40 placeholder-white/60 pl-10 py-2 text-white focus:outline-none focus:border-white transition" />
              <MailIcon className="absolute left-0 top-1/2 -translate-y-1/2 text-white/60 ml-1.5" size={20} />
            </div>

            {/* Password */}
            <div className="relative">
              <input id="password" name="password" type={showPassword ? "text" : "password"} placeholder="Password" required
                className="w-full bg-transparent border-b border-white/40 placeholder-white/60 pl-10 pr-10 py-2 text-white focus:outline-none focus:border-white transition" />
              <LockIcon className="absolute left-0 top-1/2 -translate-y-1/2 text-white/60 ml-1.5" size={20} />
              <button type="button" onClick={() => setShowPassword((p) => !p)}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <input id="confirm-password" name="confirm-password" type={showConfirmPassword ? "text" : "password"} placeholder="Confirm password" required
                className="w-full bg-transparent border-b border-white/40 placeholder-white/60 pl-10 pr-10 py-2 text-white focus:outline-none focus:border-white transition" />

              <LockIcon className="absolute left-0 top-1/2 -translate-y-1/2 ml-1.5 text-white/60" size={20} />

              <button type="button" onClick={() => setShowConfirmPassword((p) => !p)}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition">
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Submit */}
            <Button type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-gray-600 to-gray-800 rounded-full py-3 text-white font-semibold tracking-wide hover:brightness-125 transition-all duration-200 ease-in-out hover:scale-105 active:scale-95 disabled:opacity-60">
              {loading ? "Creating account..." : "SIGN UP"}
            </Button>

            {/* Footer */}
            <p className="text-center text-sm text-white/70">
              Already have an account?{" "}
              <a href="/auth/login" className="text-teal-400 hover:underline font-medium">
                Sign in
              </a>
            </p>

          </form>
        </div>
      </motion.div>
    </div>
  )
}
