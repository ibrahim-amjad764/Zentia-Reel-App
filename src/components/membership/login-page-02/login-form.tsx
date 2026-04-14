"use client";

import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, type UserCredential } from "firebase/auth";
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useState, useEffect } from "react";
import { PremiumModeToggle } from "../../../../components/ui/premium-mode-toggle";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { Checkbox } from "../../../../components/ui/checkbox";
import { Button } from "../../../../components/ui/button";
import { motion } from "framer-motion";
import { Label } from "../../../../components/ui/label";
import { toast } from "sonner";
import { app } from "@/lib/firebase";
import { Input } from "../../../../components/ui/input";
import RippleButton from "@components/ui/RippleButton";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const auth = getAuth(app);

  useEffect(() => {
    document.title = "Login | My Next JS App";
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) router.replace("/feed");
    });
    return () => unsub();
  }, [auth, router]);

  // Token login handling with refreshing and retrying in case of expiry
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading("Signing in...");

    let userCredential: UserCredential | null = null;

    try {
      // Signing in the user and obtaining the userCredential
      userCredential = await signInWithEmailAndPassword(auth, email, password);

      // Get the token (forcefully refresh it if needed)
      const token = await userCredential.user.getIdToken(true);
      console.log("Fetched Firebase token:", token);

      // Decode the Firebase token using jwtDecode
      const decodedToken = jwtDecode(token);
      console.log("Decoded Token:", decodedToken);
      console.log("Token Expiry Time:", decodedToken.exp);

      // Send the token to the backend API to set the cookie
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      console.log("Login API response:", data);

      if (res.status !== 200) {
        throw new Error("Backend authentication failed");
      }

      // Show a success toast
      toast.success(`Welcome, ${data.email}!`, { id: toastId });

      // Redirect after successful login
      router.replace("/feed");
    } catch (error: unknown) {
      const errAny = error as { code?: string; message?: string };
      if (errAny?.code === "auth/id-token-expired" && userCredential) {
        console.log("Token expired. Refreshing the token...");

        // Refresh the token by forcing a new one using getIdToken(true)
        const newToken = await userCredential.user.getIdToken(true);
        console.log("New Token:", newToken); // Log the refreshed token

        // Retry sending the new token to the backend for authentication
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { Authorization: `Bearer ${newToken}` },
        });

        const data = await res.json();
        console.log("Login API response after refreshing token:", data);

        if (res.status !== 200) {
          throw new Error("Backend authentication failed after refreshing token");
        }

        // Show success message with the refreshed token
        toast.success(`Welcome back, ${data.email}!`, { id: toastId });

        // Redirect after successful login
        router.replace("/feed");
      } else {
        // Handle any other errors (e.g., invalid email or password)
        console.error("[Login] Failed:", error);
        toast.error(errAny?.message || "Invalid email or password", { id: toastId });
      }
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#F8F9FC] dark:bg-gray-900">
      {/* Simple Soft Background */}
      <div className="absolute inset-0 bg-[#F0F4FF] dark:bg-gray-800" />

      {/* Very Subtle Pattern */}
      <div className="absolute inset-0 opacity-30 dark:opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #3B82F6 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Soft Floating Shapes */}
      {/* Desktop: extra shapes */}
      <motion.div
        animate={{ y: [0, -25, 0], rotate: [0, 10, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-24 left-24 w-72 h-72 border border-gray-400 dark:border-blue-700 rounded-3xl opacity-40 hidden md:block"
      />
      <motion.div
        animate={{ y: [0, 30, 0], rotate: [0, -15, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-32 right-28 w-80 h-80 border border-gray-400 dark:border-blue-700 rounded-full opacity-30 hidden md:block"
      />
      {/* Extra desktop shapes */}
      <motion.div
        animate={{ y: [0, -20, 0], rotate: [0, 15, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-10 right-10 w-60 h-60 border border-gray-400 dark:border-blue-600 rounded-2xl opacity-25 hidden md:block"
      />
      <motion.div
        animate={{ y: [0, 25, 0], rotate: [0, -10, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-16 left-16 w-64 h-64 border border-gray-400 dark:border-blue-600 rounded-full opacity-25 hidden md:block"
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

      {/* Premium Toggle */}
      <div className="absolute top-6 right-6 z-50">
        <PremiumModeToggle />
      </div>

      {/* Main Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md px-6"
      >
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 p-8">

          {/* Logo */}
          <div className="flex justify-center mb-8">
            <motion.div
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="w-20 h-20 bg-blue-600 dark:bg-blue-500 rounded-2xl flex items-center justify-center shadow-md"
            >
              <span className="text-white text-5xl font-bold">Z</span>
            </motion.div>
          </div>

          {/* Header */}
          <div className="text-center mb-9">
            <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              Sign in to continue to Zentia Universe
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email */}
            <div>
              <Label htmlFor="email" className="text-gray-700 dark:text-gray-300 font-medium mb-1.5 block">
                Email Address
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 pl-11 bg-white dark:bg-gray-900/50 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500 rounded-2xl text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
              </div>
            </div>

            {/* Password */}
            <div>
              <Label htmlFor="password" className="text-gray-700 dark:text-gray-300 font-medium mb-1.5 block">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 pl-11 pr-12 bg-white dark:bg-gray-900/50 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500 rounded-2xl text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-300 hover:text-gray-600 dark:hover:text-gray-100"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer text-gray-600 dark:text-gray-300">
                <Checkbox className="border-gray-300 dark:border-gray-600" />
                Remember me
              </label>
              <a href="/auth/forgot-password" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
                Forgot password?
              </a>
            </div>

            {/* Login Button */}
            <RippleButton
              type="submit"
              loading={loading}
              className="w-full h-12 rounded-2xl bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white font-semibold text-base shadow-sm transition-all active:scale-[0.985]"
            >
              {loading ? "Entering Zentia..." : "Continue to Zentia"}
            </RippleButton>
          </form>

          {/* Sign Up Link */}
          <div className="text-center mt-8 text-gray-600 dark:text-gray-400 text-sm">
            Don&apos;t have an account?{' '}
            <a href="/auth/sign-up" className="text-blue-600 dark:text-blue-400 font-medium hover:text-blue-700 dark:hover:text-blue-300">
              Create your universe
            </a>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 dark:text-gray-400 text-xs mt-8">
          © 2026 Zentia • Where connections come alive
        </p>
      </motion.div>
    </div>
  );
};


export default LoginForm;
