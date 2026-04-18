"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Sparkles, Target } from 'lucide-react';
import { getGreeting } from '@/lib/mock-data';
import type { User, MatchScore } from '@/lib/types';

interface HeroSectionProps {
  profile: any;
  matchScore: MatchScore;
  jobCount?: number;
}

export function HeroSection({ profile, matchScore, jobCount = 0 }: HeroSectionProps) {
  const [greeting, setGreeting] = useState('Welcome');

  useEffect(() => {
    setGreeting(getGreeting());
  }, []);

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-teal-500/5 rounded-3xl" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <div className="relative glass-strong rounded-3xl p-8 lg:p-10">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Left: Greeting */}
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-3"
            >
              <span className="text-4xl">👋</span>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-white">
                  {greeting},{' '}
                  <span className="gradient-text">{profile.name}</span>
                </h1>
                <p className="text-zinc-400 mt-1">
                  Here's your career intelligence for today
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-4 flex-wrap"
            >
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
                <Target className="w-4 h-4 text-emerald-400" />
                <span className="text-sm text-zinc-300">
                  Target: <span className="text-white font-medium">{profile?.role || "Unknown"}</span>
                </span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span className="text-sm text-emerald-400 font-medium">
                  +{matchScore.improvement}% growth possible
                </span>
              </div>
              
              {/* 🔥 Dynamic Skills Tags */}
              <div className="flex items-center gap-2 flex-wrap ml-2">
                {profile.skills?.slice(0, 5).map((skill) => (
                  <span 
                    key={skill} 
                    className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-[10px] font-bold text-zinc-500 uppercase tracking-wider transition-colors hover:border-emerald-500/30 hover:text-emerald-400"
                  >
                    {skill}
                  </span>
                ))}
                {profile.skills && profile.skills.length > 5 && (
                  <span className="text-[10px] text-zinc-600 font-bold ml-1">+{profile.skills.length - 5} More</span>
                )}
              </div>
            </motion.div>
          </div>

          {/* Right: Quick Stats */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center gap-6"
          >
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-3xl font-bold text-white">{jobCount}</span>
              </div>
              <span className="text-xs text-zinc-500 uppercase tracking-wider">
                Job Matches
              </span>
            </div>
            <div className="w-px h-12 bg-white/10" />
            <div className="text-center">
              <span className="text-3xl font-bold text-white">{profile.skills?.length || 0}</span>
              <span className="text-xs text-zinc-500 uppercase tracking-wider block mt-1">
                Skills Found
              </span>
            </div>
            <div className="w-px h-12 bg-white/10" />
            <div className="text-center">
              <span className="text-3xl font-bold text-emerald-400">{matchScore.score}%</span>
              <span className="text-xs text-zinc-500 uppercase tracking-wider block mt-1">
                Profile Score
              </span>
            </div>
          </motion.div>
        </div>

        {/* Progress bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 pt-6 border-t border-white/5"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-zinc-400">
              You are <span className="text-white font-semibold">{matchScore.score}%</span> ready for{' '}
              <span className="text-emerald-400 font-medium">{profile.role}</span> role
            </span>
            <span className="text-xs text-emerald-400 font-medium">
              +{matchScore.improvement}% possible
            </span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${matchScore.score}%` }}
              transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1], delay: 0.6 }}
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full relative"
            >
              <div className="absolute inset-0 bg-white/20 animate-shimmer" />
            </motion.div>
          </div>
          {/* Improvement indicator */}
          <div className="relative h-2 mt-1">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="absolute h-full w-0.5 bg-emerald-400/50"
              style={{ left: `${matchScore.score + matchScore.improvement}%` }}
            >
              <div className="absolute -top-1 -translate-x-1/2 w-2 h-2 bg-emerald-400 rounded-full shadow-glow-sm" />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
