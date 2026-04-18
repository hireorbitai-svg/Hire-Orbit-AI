import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Play, Sparkles, Zap, TrendingUp, Bell, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { getSupabaseClient } from '@/lib/supabase';

// Animated Dashboard Preview Component
function DashboardPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 40 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="relative"
    >
      {/* Glow effect */}
      <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/30 via-violet-500/20 to-teal-500/30 rounded-3xl blur-2xl opacity-60" />
      
      {/* Dashboard Container */}
      <div className="relative glass-strong rounded-2xl overflow-hidden border border-white/10">
        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-white/5">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-rose-500" />
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
          </div>
          <div className="flex-1 text-center">
            <span className="text-xs text-zinc-500">hireorbit.ai/dashboard</span>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="p-4 space-y-4">
          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Match Score', value: '85%', color: 'text-emerald-400' },
              { label: 'Jobs', value: '24', color: 'text-white' },
              { label: 'Alerts', value: '3', color: 'text-amber-400' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + i * 0.1 }}
                className="bg-white/5 rounded-lg p-3 text-center"
              >
                <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-[10px] text-zinc-500 uppercase">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Job Cards */}
          <div className="space-y-2">
            {[
              { company: 'Tesla', role: 'Electrical Engineer', match: 92, color: 'bg-emerald-500' },
              { company: 'Google', role: 'Data Scientist', match: 78, color: 'bg-amber-500' },
            ].map((job, i) => (
              <motion.div
                key={job.company}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 + i * 0.15 }}
                className="flex items-center gap-3 bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-colors"
              >
                <div className={`w-8 h-8 rounded-lg ${job.color} flex items-center justify-center text-white text-xs font-bold`}>
                  {job.company[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium truncate">{job.role}</p>
                  <p className="text-xs text-zinc-500">{job.company}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-emerald-400">{job.match}%</p>
                  <p className="text-[10px] text-zinc-500">match</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* AI Insight Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.3 }}
            className="bg-gradient-to-r from-violet-500/20 to-emerald-500/20 rounded-lg p-3 border border-emerald-500/30"
          >
            <div className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400 mt-0.5" />
              <div>
                <p className="text-xs text-white font-medium">AI Insight</p>
                <p className="text-[10px] text-zinc-300 mt-0.5">
                  Add <span className="text-emerald-400">Python</span> skills → +15% match
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Floating Notification */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.5, duration: 0.5 }}
        className="absolute -right-4 top-1/4 glass rounded-xl p-3 border border-emerald-500/30 shadow-glow-sm"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <Bell className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <p className="text-xs text-white font-medium">New Job Match!</p>
            <p className="text-[10px] text-zinc-400">Senior Engineer at Meta</p>
          </div>
        </div>
      </motion.div>

      {/* Floating Badge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.7, duration: 0.5 }}
        className="absolute -left-4 bottom-1/4 glass rounded-xl p-3 border border-amber-500/30"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <p className="text-xs text-white font-medium">+23% Growth</p>
            <p className="text-[10px] text-zinc-400">This month</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function Hero() {
  const [session, setSession] = useState(null);
  const [hasResume, setHasResume] = useState(false);
  const supabase = getSupabaseClient();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (session) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .single();
        
        const uploaded = profileData?.resume_url || (profileData?.skills && profileData?.skills.length > 0) || (profileData?.role && profileData?.role !== "Unknown");
        setHasResume(uploaded);
      }
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        setHasResume(false);
      } else {
        checkAuth();
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-teal-500/5 rounded-full blur-3xl" />
        
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                AI-Powered Career Platform
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight"
            >
              Land the Right Job{' '}
              <span className="gradient-text">Faster with AI</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-zinc-400 max-w-xl"
            >
              Get real-time job alerts, AI-powered matching, and a personalized roadmap 
              to grow your career. Stop applying blindly—let AI find your perfect match.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Button
                asChild
                size="lg"
                className="bg-emerald-500 hover:bg-emerald-400 text-white text-lg px-8 py-6 rounded-xl shadow-glow hover:shadow-glow-lg transition-all group"
              >
                <Link href={session ? (hasResume ? "/dashboard" : "/onboarding") : "/signup"}>
                  {session ? (hasResume ? "Go to Dashboard" : "Upload Resume") : "Get Started Free"}
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20 text-lg px-8 py-6 rounded-xl group"
              >
                <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                View Demo
              </Button>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap items-center gap-6 pt-4"
            >
              {[
                { icon: Check, text: 'Free forever plan' },
                { icon: Zap, text: 'Setup in 2 minutes' },
                { icon: TrendingUp, text: 'Used by 10K+ professionals' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-zinc-500">
                  <item.icon className="w-4 h-4 text-emerald-400" />
                  <span>{item.text}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right Content - Dashboard Preview */}
          <div className="relative">
            <DashboardPreview />
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-6 h-10 rounded-full border-2 border-zinc-700 flex items-start justify-center p-2"
        >
          <div className="w-1 h-2 bg-zinc-500 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
}
