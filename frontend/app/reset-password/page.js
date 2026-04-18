"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Lock, CheckCircle2, AlertCircle, ArrowLeft, KeyRound } from "lucide-react"
import { getSupabaseClient } from "@/lib/supabase"

function ResetPasswordForm() {
  const router = useRouter()
  const supabase = getSupabaseClient()

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [validating, setValidating] = useState(true)
  const [valid, setValid] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  // Supabase sends a recovery link that sets a session automatically.
  // Listen for the PASSWORD_RECOVERY event to confirm the link is valid.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        setValid(true)
        setValidating(false)
      }
    })

    // If user already has a session (e.g., page refreshed after clicking link)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setValid(true)
      }
      setValidating(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const handleReset = async (e) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      setError("Passwords do not match!")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.")
      return
    }

    setLoading(true)
    setError("")

    // This updates the password in Supabase Auth directly
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError(error.message || "Failed to update password.")
      setLoading(false)
    } else {
      setSuccess(true)
      setTimeout(() => router.push("/login"), 3000)
    }
  }

  if (validating) {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
        <p className="text-emerald-400 font-medium animate-pulse">Verifying reset link...</p>
      </div>
    )
  }

  if (!valid && !success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center flex flex-col gap-6"
      >
        <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto">
          <AlertCircle className="text-red-400 w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Invalid Reset Link</h2>
          <p className="text-zinc-400 max-w-xs mx-auto">
            This link is invalid or has expired. Please request a new one.
          </p>
        </div>
        <button
          onClick={() => router.push("/forgot-password")}
          className="flex items-center justify-center gap-2 text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Request New Link
        </button>
      </motion.div>
    )
  }

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center flex flex-col gap-6"
      >
        <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto">
          <CheckCircle2 className="text-emerald-400 w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Password Updated!</h2>
          <p className="text-zinc-400">Your account is now secure. Redirecting to login...</p>
        </div>
        <div className="flex justify-center">
          <div className="w-48 h-1 bg-white/5 overflow-hidden rounded-full">
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "0%" }}
              transition={{ duration: 3 }}
              className="h-full bg-emerald-500"
            />
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-8 w-full"
    >
      <div className="flex flex-col gap-2">
        <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-2">
          <KeyRound className="text-emerald-400 w-6 h-6" />
        </div>
        <h1 className="text-3xl font-bold gradient-text">Create New Password</h1>
        <p className="text-muted-foreground text-sm">Enter your new password below</p>
      </div>

      <form onSubmit={handleReset} className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-muted-foreground px-1">New Password</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-zinc-500 group-focus-within:text-emerald-400 transition-colors" />
            </div>
            <input
              type="password"
              required
              placeholder="••••••••"
              className="w-full pl-10 p-3 border border-white/10 bg-white/5 rounded-xl focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all text-white placeholder:text-zinc-600"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-muted-foreground px-1">Confirm New Password</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-zinc-500 group-focus-within:text-emerald-400 transition-colors" />
            </div>
            <input
              type="password"
              required
              placeholder="••••••••"
              className="w-full pl-10 p-3 border border-white/10 bg-white/5 rounded-xl focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all text-white placeholder:text-zinc-600"
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg flex items-center gap-2 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="group relative bg-emerald-600 hover:bg-emerald-500 text-white p-4 rounded-xl font-bold shadow-glow transition-all active:scale-[0.98] flex items-center justify-center gap-2 overflow-hidden disabled:opacity-50"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            "Update Password"
          )}
        </button>
      </form>
    </motion.div>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/10 blur-[120px] rounded-full animate-pulse-glow" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-teal-500/10 blur-[120px] rounded-full animate-pulse-glow" style={{ animationDelay: '1s' }} />

      <div className="w-full max-w-md glass p-10 rounded-3xl shadow-glow relative z-10 mx-4">
        <Suspense fallback={
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
            <p className="text-emerald-400 font-medium animate-pulse">Loading...</p>
          </div>
        }>
          <ResetPasswordForm />
        </Suspense>
      </div>

      {/* Decorative footer */}
      <footer className="absolute bottom-8 left-0 right-0 text-center z-10">
        <p className="text-xs text-zinc-500 flex items-center justify-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50 animate-pulse" />
          Secure password recovery active
        </p>
      </footer>
    </div>
  )
}
