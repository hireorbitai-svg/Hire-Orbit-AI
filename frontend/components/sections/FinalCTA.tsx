import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { ArrowRight, Sparkles, Zap, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { getSupabaseClient } from '@/lib/supabase';

export function FinalCTA() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
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
    <section className="relative py-24 lg:py-32 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-gradient-to-r from-emerald-500/20 via-violet-500/10 to-teal-500/20 rounded-full blur-3xl opacity-50" />
        
        {/* Floating elements */}
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 5, repeat: Infinity }}
          className="absolute top-20 left-20 w-20 h-20 bg-emerald-500/10 rounded-full blur-xl"
        />
        <motion.div
          animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 6, repeat: Infinity }}
          className="absolute bottom-20 right-20 w-32 h-32 bg-violet-500/10 rounded-full blur-xl"
        />
      </div>

      <div ref={ref} className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="relative"
        >
          {/* Glow */}
          <div className="absolute -inset-8 bg-gradient-to-r from-emerald-500/30 via-violet-500/20 to-teal-500/30 rounded-[3rem] blur-3xl opacity-60" />
          
          {/* Card */}
          <div className="relative glass-strong rounded-[2.5rem] p-8 lg:p-16 border border-white/10 text-center overflow-hidden">
            {/* Background pattern */}
            <div 
              className="absolute inset-0 opacity-[0.02]"
              style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)`,
                backgroundSize: '32px 32px',
              }}
            />

            <div className="relative space-y-8">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 0.2 }}
                className="inline-flex"
              >
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-sm font-medium">
                  <Sparkles className="w-4 h-4" />
                  Start Your Journey Today
                </span>
              </motion.div>

              {/* Headline */}
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.3 }}
                className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white"
              >
                Ready to Accelerate{' '}
                <span className="gradient-text">Your Career?</span>
              </motion.h2>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.4 }}
                className="text-lg text-zinc-400 max-w-2xl mx-auto"
              >
                Join thousands of professionals who have transformed their job search 
                with AI-powered matching and personalized career guidance.
              </motion.p>

              {/* Benefits */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.5 }}
                className="flex flex-wrap justify-center gap-4"
              >
                {[
                  'Free forever plan',
                  'No credit card required',
                  'Setup in 2 minutes',
                ].map((benefit, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-zinc-400">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </motion.div>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.6 }}
                className="flex flex-col sm:flex-row justify-center gap-4 pt-4"
              >
                <Button
                  asChild
                  size="lg"
                  className="bg-emerald-500 hover:bg-emerald-400 text-white text-lg px-10 py-7 rounded-xl shadow-glow hover:shadow-glow-lg transition-all group"
                >
                  <Link href={session ? (hasResume ? "/dashboard" : "/onboarding") : "/signup"}>
                    <Zap className="w-5 h-5 mr-2" />
                    {session ? (hasResume ? "Go to Dashboard" : "Upload Resume") : "Get Started Free"}
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </motion.div>

              {/* Trust indicator */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ delay: 0.8 }}
                className="text-sm text-zinc-500"
              >
                Trusted by <span className="text-white font-medium">10,000+</span> professionals worldwide
              </motion.p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
