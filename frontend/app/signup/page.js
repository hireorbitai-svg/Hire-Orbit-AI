"use client"

import { useState, useEffect } from "react"
import { getSupabaseClient } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Mail, Lock, UserPlus, Sparkles, ArrowLeft } from "lucide-react"
import { toast } from "sonner"

export default function Signup() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = getSupabaseClient()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) router.push("/dashboard");
    };
    checkUser();
  }, [router, supabase]);

  const handleSignup = async () => {
    if (!email || !password) {
      toast.error("Please fill in all fields.")
      return
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.")
      return
    }
    setLoading(true)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      toast.error(error.message)
      setLoading(false)
    } else {
      // ✅ Step 1: Create profile immediately after signup
      if (data?.user) {
        await supabase.from("profiles").upsert([
          {
            user_id: data.user.id,
            email: data.user.email,
            full_name: email.split('@')[0],
          },
        ], { onConflict: 'user_id' });
      }
      
      toast.success("🎉 Account created! Welcome to HireOrbitAi.")
      setTimeout(() => router.push("/dashboard"), 1000)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-500/10 blur-[120px] rounded-full animate-pulse-glow" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-teal-500/10 blur-[120px] rounded-full animate-pulse-glow" style={{ animationDelay: '1.5s' }} />
      
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
            className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-2"
          >
            <UserPlus className="text-emerald-400 w-6 h-6" />
          </motion.div>
          <h1 className="text-4xl font-bold gradient-text">Create Account</h1>
          <p className="text-muted-foreground">Join HireOrbitAi today</p>
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-muted-foreground px-1">Email Address</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-zinc-500 group-focus-within:text-emerald-400 transition-colors" />
              </div>
              <input
                type="email"
                placeholder="name@example.com"
                className="w-full pl-10 p-3 border border-white/10 bg-white/5 rounded-xl focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all text-white placeholder:text-zinc-600"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-muted-foreground px-1">Password</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-zinc-500 group-focus-within:text-emerald-400 transition-colors" />
              </div>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full pl-10 p-3 border border-white/10 bg-white/5 rounded-xl focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all text-white placeholder:text-zinc-600"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <p className="text-[10px] text-zinc-500 px-1 italic">Min. 6 characters required</p>
          </div>
        </div>

        <button
          onClick={handleSignup}
          disabled={loading}
          className="group relative bg-emerald-600 hover:bg-emerald-500 text-white p-4 rounded-xl font-bold shadow-glow transition-all active:scale-[0.98] flex items-center justify-center gap-2 overflow-hidden disabled:opacity-50"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Sparkles className="w-5 h-5" />
          )}
          {loading ? "Creating..." : "Create Account"}
        </button>
        
        <p className="text-center text-sm text-muted-foreground">
          Already have an account? <span onClick={() => router.push("/login")} className="text-emerald-400 font-semibold cursor-pointer hover:underline">Log in</span>
        </p>
      </motion.div>
      
      {/* Decorative background text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.02] select-none">
        <h2 className="text-[20rem] font-black rotate-[-10deg]">HIRE</h2>
      </div>
    </div>
  )
}