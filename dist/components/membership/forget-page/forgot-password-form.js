"use client";
import { useEffect, useState } from "react";
import { MailIcon } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { Label } from "../../../../components/ui/label";
import { toast } from "sonner";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { app } from "@/lib/firebase";
import { motion } from "framer-motion";
const ForgotPasswordForm = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const auth = getAuth(app);
    useEffect(() => {
        document.title = "Forgot | My Next JS App";
    }, []);
    const handleReset = async (e) => {
        e.preventDefault();
        if (!email)
            return toast.error("Please enter your email");
        setLoading(true);
        const toastId = toast.loading("Sending reset link...");
        try {
            await sendPasswordResetEmail(auth, email);
            toast.success("Password reset email sent!", { id: toastId });
            setEmail("");
        }
        catch (error) {
            toast.error(error.message || "Failed to send reset email", { id: toastId });
        }
        finally {
            setLoading(false);
        }
    };
    return (<div className="min-h-screen flex items-center justify-center bg-linear-to-tr from-gray-900 via-gray-800 to-gray-700 px-4">
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="relative z-10">
        <div className="bg-white/5 backdrop-blur-md rounded-3xl p-15 max-w-md w-full border border-white/25 shadow-lg">
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
              <MailIcon className="w-10 h-10 text-white/50"/>
            </div>
          </div>

          <div className="mb-5">
            <h1 className="text-white text-xl font-bold text-center">Forgot Password</h1>
            <p className="text-gray-300 mt-1 text-center">Enter your email to reset your password</p>
          </div>

          <form onSubmit={handleReset} className="space-y-6 text-white">
            {/* Email input */}
            <div className="relative">
              <Label htmlFor="email" className="sr-only">Email address</Label>
              <input id="email" type="email" placeholder="Enter your email address" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full bg-transparent border-b border-white/50 placeholder-white/70 pl-10 py-2 text-white focus:outline-none focus:border-white transition"/>
              <MailIcon className="absolute left-0 top-1/2 -translate-y-1/2 text-white/70 ml-1.5" size={20}/>
            </div>

            {/* Submit button */}
            <Button type="submit" disabled={loading} className="w-full bg-linear-to-r from-gray-600 to-gray-800 rounded-full py-3 text-white font-semibold tracking-wide hover:brightness-125 transition disabled:opacity-60">
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>

            {/* Back to login */}
            <p className="text-center text-sm text-white/70 mt-2">
              Remember your password?{" "}
              <a href="/auth/login" className="font-medium text-teal-400 hover:underline">
                Login
              </a>
            </p>
          </form>
        </div>
      </motion.div>
    </div>);
};
export default ForgotPasswordForm;
