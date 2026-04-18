"use client";

import { useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, KeyRound, Send } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const supabase = getSupabaseClient();
  const router = useRouter();

  const handleReset = async () => {
    if (!email) {
      alert("Please enter your email address.");
      return;
    }
    setLoading(true);

    try {
      const redirectTo = `${window.location.origin}/reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });

      if (error) {
        alert(error.message || "Failed to send reset link");
      } else {
        setSent(true);
      }
    } catch (err) {
      alert("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-violet-500/10 blur-[120px] rounded-full animate-pulse-glow" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-500/10 blur-[120px] rounded-full animate-pulse-glow" style={{ animationDelay: '2s' }} />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md glass p-10 rounded-3xl shadow-glow flex flex-col gap-8 relative z-10 mx-4"
      >
        <div className="flex flex-col gap-2">
          <button 
            onClick={() => router.push("/login")}
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-emerald-400 transition-colors mb-2 w-fit"
          >
            <ArrowLeft className="w-3 h-3" /> Back to Login
          </button>
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center mb-2"
          >
            <KeyRound className="text-violet-400 w-6 h-6" />
          </motion.div>
          <h1 className="text-4xl font-bold gradient-text-purple">Password Reset</h1>
          <p className="text-muted-foreground">We'll send a recovery link to your email</p>
        </div>

        {sent ? (
          <div className="flex flex-col gap-6 items-center text-center py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <Send className="text-emerald-400 w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">Email Sent!</h3>
              <p className="text-sm text-zinc-400">
                Check your inbox for a link to reset your password. If you don't see it, check your spam folder.
              </p>
            </div>
            <button
              onClick={() => router.push("/login")}
              className="text-emerald-400 font-semibold hover:underline text-sm"
            >
              Return to Login
            </button>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-muted-foreground px-1">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-zinc-500 group-focus-within:text-violet-400 transition-colors" />
                </div>
                <input
                  type="email"
                  placeholder="name@example.com"
                  className="w-full pl-10 p-3 border border-white/10 bg-white/5 rounded-xl focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all text-white placeholder:text-zinc-600"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <button
              onClick={handleReset}
              disabled={loading || !email}
              className="group relative bg-violet-600 hover:bg-violet-500 text-white p-4 rounded-xl font-bold shadow-glow transition-all active:scale-[0.98] flex items-center justify-center gap-2 overflow-hidden disabled:opacity-50"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
}
