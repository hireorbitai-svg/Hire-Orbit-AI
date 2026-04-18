"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, ArrowRight, Lightbulb, Sparkles, X,
  TrendingUp, Target, Zap, IndianRupee, ChevronRight,
  CheckCircle2, Star, Rocket, Trophy, Clock, AlertCircle
} from 'lucide-react';
import type { AIInsight } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { getSupabaseClient } from '@/lib/supabase';

interface AIInsightCardProps {
  insight: AIInsight;
  skills?: string[];
  role?: string;
  matchScore?: number;
  topMissingSkills?: string[];
}

interface GemmaInsight {
  summary: string;
  strengths: string[];
  gaps: string[];
  quickWins: { action: string; impact: string; timeframe: string }[];
  careerPath: string;
  salaryInsight: string;
}

const LOADING_PHRASES = [
  "Scanning your skill profile...",
  "Analyzing market trends...",
  "Identifying growth opportunities...",
  "Crafting personalized insights...",
  "Finalizing your career roadmap...",
];

export function AIInsightCard({ insight, skills = [], role = 'Professional', matchScore = 0, topMissingSkills = [] }: AIInsightCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [gemmaInsight, setGemmaInsight] = useState<GemmaInsight | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadingPhrase, setLoadingPhrase] = useState(0);
  const [activeSection, setActiveSection] = useState<string>('summary');
  const supabase = getSupabaseClient();

  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setLoadingPhrase(p => (p + 1) % LOADING_PHRASES.length);
    }, 1800);
    return () => clearInterval(interval);
  }, [loading]);

  const openModal = async () => {
    setModalOpen(true);
    if (gemmaInsight) return;
    setLoading(true);
    setError('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setError('Please log in to get AI insights.'); setLoading(false); return; }

      const res = await fetch('/api/ai-insight', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ skills, role, topMissingSkills, matchScore }),
      });

      const data = await res.json();
      if (data.success && data.insight) {
        setGemmaInsight(data.insight);
        setActiveSection('summary');
      } else {
        setError(data.error || 'Failed to generate insight.');
      }
    } catch {
      setError('Could not connect to AI service.');
    } finally {
      setLoading(false);
    }
  };

  const sections = [
    { id: 'summary', label: 'Overview', icon: Sparkles },
    { id: 'strengths', label: 'Strengths', icon: Trophy },
    { id: 'gaps', label: 'Skill Gaps', icon: Target },
    { id: 'quickwins', label: 'Quick Wins', icon: Zap },
    { id: 'career', label: 'Career & Salary', icon: TrendingUp },
  ];

  return (
    <>
      {/* ── Trigger Card ─────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={openModal}
        className="relative group cursor-pointer"
      >
        {/* Glow */}
        <motion.div
          animate={{ opacity: isHovered ? 0.6 : 0.2, scale: isHovered ? 1.03 : 1 }}
          transition={{ duration: 0.4 }}
          className="absolute inset-0 bg-gradient-to-br from-violet-500/30 via-emerald-500/15 to-teal-500/25 rounded-3xl blur-xl"
        />

        <div className="relative glass rounded-3xl p-6 h-full overflow-hidden border border-white/5 group-hover:border-emerald-500/30 transition-all duration-500">
          {/* Animated background grid */}
          <div className="absolute inset-0 opacity-[0.02] rounded-3xl" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />

          {/* Floating orbs */}
          <motion.div animate={{ y: [0, -8, 0], opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 4, repeat: Infinity }} className="absolute top-4 right-4 w-16 h-16 bg-violet-500/20 rounded-full blur-xl" />
          <motion.div animate={{ y: [0, 8, 0], opacity: [0.2, 0.5, 0.2] }} transition={{ duration: 3, repeat: Infinity, delay: 1 }} className="absolute bottom-4 left-4 w-12 h-12 bg-emerald-500/20 rounded-full blur-xl" />

          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="relative">
                <motion.div
                  animate={{ rotate: isHovered ? 360 : 0 }}
                  transition={{ duration: 0.6 }}
                  className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500 to-emerald-500 flex items-center justify-center shadow-lg"
                >
                  <Brain className="w-5 h-5 text-white" />
                </motion.div>
                <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }} className="absolute inset-0 rounded-xl bg-violet-500/40 blur-lg" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">{insight?.title || 'AI Career Intelligence'}</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="text-xs text-emerald-400 font-medium">Powered by Google Gemma</span>
                </div>
              </div>
            </div>
            <motion.div
              animate={{ rotate: isHovered ? [0, -15, 15, 0] : 0, scale: isHovered ? 1.2 : 1 }}
              transition={{ duration: 0.5 }}
              className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center"
            >
              <Lightbulb className="w-4 h-4 text-amber-400" />
            </motion.div>
          </div>

          {/* Score pill */}
          {matchScore > 0 && (
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 mb-4">
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span className="text-xs font-semibold text-white">{matchScore}% avg. job match</span>
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            </motion.div>
          )}

          {/* Preview message */}
          <p className="text-zinc-400 text-sm leading-relaxed mb-5 line-clamp-2">
            {insight?.message || 'Get your personalised AI-powered career analysis with strengths, skill gaps, quick wins, and salary insights.'}
          </p>

          {/* Mini stats row */}
          <div className="flex gap-2 mb-5">
            {[
              { label: 'Strengths', color: 'emerald' },
              { label: 'Skill Gaps', color: 'amber' },
              { label: 'Quick Wins', color: 'violet' },
              { label: 'Salary', color: 'teal' },
            ].map((item) => (
              <div key={item.label} className={`flex-1 text-center py-1.5 rounded-xl bg-${item.color}-500/5 border border-${item.color}-500/20`}>
                <span className={`text-[10px] font-semibold text-${item.color}-400 uppercase tracking-wide`}>{item.label}</span>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <div className="relative w-full py-3.5 rounded-2xl overflow-hidden bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 transition-all duration-300 shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 font-semibold text-white text-sm">
              <Rocket className="w-4 h-4" />
              <span>Get Deep Analysis</span>
              <motion.span animate={{ x: isHovered ? 4 : 0 }} transition={{ duration: 0.2 }}>
                <ArrowRight className="w-4 h-4" />
              </motion.span>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* ── Modal ─────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget) setModalOpen(false); }}
          >
            {/* Backdrop */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/85 backdrop-blur-xl" />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 30 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="relative w-full max-w-2xl max-h-[92vh] overflow-hidden bg-zinc-950 border border-white/10 rounded-[2rem] shadow-2xl flex flex-col"
            >
              {/* Gradient top accent */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 via-emerald-500 to-teal-500" />

              {/* Modal Header */}
              <div className="relative p-6 flex items-center justify-between border-b border-white/5 flex-shrink-0">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-emerald-500/5" />
                <div className="relative flex items-center gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
                      <Brain className="w-6 h-6 text-white" />
                    </div>
                    <motion.div animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0.8, 0.4] }} transition={{ duration: 2.5, repeat: Infinity }} className="absolute inset-0 rounded-2xl bg-violet-500/30 blur-lg" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white tracking-tight">AI Career Analysis</h2>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Sparkles className="w-3 h-3 text-emerald-400" />
                      <span className="text-xs text-emerald-400 font-medium">Google Gemma · Personalised for {role}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="relative w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all hover:scale-110 hover:border-white/20"
                >
                  <X className="w-4 h-4 text-zinc-400" />
                </button>
              </div>

              {/* Loading State */}
              {loading && (
                <div className="flex-1 flex flex-col items-center justify-center py-20 gap-6">
                  <div className="relative">
                    {/* Outer ring */}
                    <div className="w-24 h-24 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
                    {/* Inner ring */}
                    <div className="absolute top-3 left-3 w-18 h-18 border-4 border-emerald-500/20 border-b-emerald-500 rounded-full animate-spin" style={{ width: '72px', height: '72px', animationDirection: 'reverse', animationDuration: '1.2s' }} />
                    {/* Center icon */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Brain className="w-8 h-8 text-white/80" />
                    </div>
                  </div>
                  <div className="text-center space-y-2">
                    <AnimatePresence mode="wait">
                      <motion.p
                        key={loadingPhrase}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="text-zinc-300 font-medium"
                      >
                        {LOADING_PHRASES[loadingPhrase]}
                      </motion.p>
                    </AnimatePresence>
                    <p className="text-xs text-zinc-600">This may take 10–20 seconds</p>
                  </div>
                  {/* Progress dots */}
                  <div className="flex gap-2">
                    {[0,1,2,3,4].map(i => (
                      <motion.div key={i} animate={{ opacity: loadingPhrase >= i ? 1 : 0.2, scale: loadingPhrase === i ? 1.3 : 1 }} transition={{ duration: 0.3 }} className="w-2 h-2 bg-emerald-500 rounded-full" />
                    ))}
                  </div>
                </div>
              )}

              {/* Error State */}
              {error && !loading && (
                <div className="flex-1 flex items-center justify-center p-8">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
                      <AlertCircle className="w-8 h-8 text-red-400" />
                    </div>
                    <p className="text-red-400 font-medium">{error}</p>
                    <button onClick={openModal} className="px-4 py-2 bg-white/5 rounded-xl text-sm text-zinc-400 hover:text-white hover:bg-white/10 transition-all">
                      Try Again
                    </button>
                  </div>
                </div>
              )}

              {/* ── Content ── */}
              {gemmaInsight && !loading && (
                <div className="flex flex-col flex-1 overflow-hidden">
                  {/* Section Nav Tabs */}
                  <div className="flex gap-1 p-3 border-b border-white/5 overflow-x-auto flex-shrink-0 scrollbar-hide">
                    {sections.map((sec) => {
                      const Icon = sec.icon;
                      return (
                        <button
                          key={sec.id}
                          onClick={() => setActiveSection(sec.id)}
                          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                            activeSection === sec.id
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          {sec.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Section Content */}
                  <div className="flex-1 overflow-y-auto p-6">
                    <AnimatePresence mode="wait">

                      {/* ── Overview ── */}
                      {activeSection === 'summary' && (
                        <motion.div key="summary" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }} className="space-y-5">
                          {/* Hero summary */}
                          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-500/10 via-emerald-500/5 to-teal-500/10 border border-white/10 p-6">
                            <div className="absolute top-2 right-2">
                              <Sparkles className="w-5 h-5 text-violet-400/40" />
                            </div>
                            <p className="text-zinc-200 leading-relaxed text-base">{gemmaInsight.summary}</p>
                          </div>

                          {/* Mini stat cards */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-2xl p-4 text-center">
                              <div className="text-2xl font-black text-emerald-400 mb-1">{(gemmaInsight.strengths || []).length}</div>
                              <div className="text-xs text-zinc-500 uppercase tracking-wider">Key Strengths</div>
                            </div>
                            <div className="bg-amber-500/5 border border-amber-500/15 rounded-2xl p-4 text-center">
                              <div className="text-2xl font-black text-amber-400 mb-1">{(gemmaInsight.gaps || []).length}</div>
                              <div className="text-xs text-zinc-500 uppercase tracking-wider">Skill Gaps</div>
                            </div>
                            <div className="bg-violet-500/5 border border-violet-500/15 rounded-2xl p-4 text-center">
                              <div className="text-2xl font-black text-violet-400 mb-1">{(gemmaInsight.quickWins || []).length}</div>
                              <div className="text-xs text-zinc-500 uppercase tracking-wider">Quick Wins</div>
                            </div>
                            <div className="bg-teal-500/5 border border-teal-500/15 rounded-2xl p-4 text-center">
                              <div className="text-2xl font-black text-teal-400 mb-1">{matchScore}%</div>
                              <div className="text-xs text-zinc-500 uppercase tracking-wider">Job Match</div>
                            </div>
                          </div>

                          {/* Navigate prompt */}
                          <p className="text-center text-xs text-zinc-600">Explore each section using the tabs above ↑</p>
                        </motion.div>
                      )}

                      {/* ── Strengths ── */}
                      {activeSection === 'strengths' && (
                        <motion.div key="strengths" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }} className="space-y-3">
                          <p className="text-sm text-zinc-500 mb-4">What makes you stand out from the competition</p>
                          {(gemmaInsight.strengths || []).map((s, i) => (
                            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} className="flex items-start gap-4 p-4 bg-emerald-500/5 border border-emerald-500/15 rounded-2xl group hover:border-emerald-500/30 hover:bg-emerald-500/10 transition-all duration-200">
                              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              </div>
                              <div className="flex-1">
                                <p className="text-zinc-200 text-sm font-medium">{s}</p>
                              </div>
                              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-xs font-bold text-emerald-400">
                                {i + 1}
                              </div>
                            </motion.div>
                          ))}
                        </motion.div>
                      )}

                      {/* ── Skill Gaps ── */}
                      {activeSection === 'gaps' && (
                        <motion.div key="gaps" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }} className="space-y-3">
                          <p className="text-sm text-zinc-500 mb-4">Skills to acquire for higher job match scores</p>
                          {(gemmaInsight.gaps || []).map((g, i) => (
                            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} className="flex items-start gap-4 p-4 bg-amber-500/5 border border-amber-500/15 rounded-2xl hover:border-amber-500/30 hover:bg-amber-500/10 transition-all duration-200">
                              <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                                <Target className="w-4 h-4 text-amber-400" />
                              </div>
                              <p className="text-zinc-200 text-sm font-medium flex-1">{g}</p>
                              <span className="flex-shrink-0 text-xs px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 font-semibold">Gap</span>
                            </motion.div>
                          ))}
                        </motion.div>
                      )}

                      {/* ── Quick Wins ── */}
                      {activeSection === 'quickwins' && (
                        <motion.div key="quickwins" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }} className="space-y-4">
                          <p className="text-sm text-zinc-500 mb-4">High-impact actions you can take right now</p>
                          {(gemmaInsight.quickWins || []).map((qw, i) => (
                            <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="relative overflow-hidden bg-violet-500/5 border border-violet-500/15 rounded-2xl p-5 hover:border-violet-500/30 hover:bg-violet-500/8 transition-all duration-200 group">
                              {/* Step number accent */}
                              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-violet-500 to-violet-500/0 rounded-l-2xl" />
                              <div className="flex items-start gap-4">
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500/30 to-violet-600/20 flex items-center justify-center flex-shrink-0 text-sm font-black text-violet-300">
                                  {i + 1}
                                </div>
                                <div className="flex-1">
                                  <p className="text-white font-semibold text-sm mb-3">{qw.action}</p>
                                  <div className="flex flex-wrap gap-2">
                                    <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 font-semibold">
                                      <TrendingUp className="w-3 h-3" />{qw.impact}
                                    </span>
                                    <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-zinc-800 border border-white/10 text-zinc-400">
                                      <Clock className="w-3 h-3" />{qw.timeframe}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </motion.div>
                      )}

                      {/* ── Career & Salary ── */}
                      {activeSection === 'career' && (
                        <motion.div key="career" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }} className="space-y-4">
                          {/* Career Path */}
                          <div className="relative overflow-hidden bg-teal-500/5 border border-teal-500/20 rounded-2xl p-6">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/10 rounded-full blur-2xl" />
                            <div className="relative">
                              <div className="flex items-center gap-2 mb-3">
                                <div className="w-8 h-8 rounded-xl bg-teal-500/20 flex items-center justify-center">
                                  <Rocket className="w-4 h-4 text-teal-400" />
                                </div>
                                <h4 className="font-bold text-teal-400">Your Career Path</h4>
                              </div>
                              <p className="text-zinc-300 leading-relaxed">{gemmaInsight.careerPath}</p>
                            </div>
                          </div>

                          {/* Salary Insight */}
                          <div className="relative overflow-hidden bg-amber-500/5 border border-amber-500/20 rounded-2xl p-6">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl" />
                            <div className="relative">
                              <div className="flex items-center gap-2 mb-3">
                                <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center">
                                  <IndianRupee className="w-4 h-4 text-amber-400" />
                                </div>
                                <h4 className="font-bold text-amber-400">Salary Intelligence</h4>
                              </div>
                              <p className="text-zinc-300 leading-relaxed">{gemmaInsight.salaryInsight}</p>
                            </div>
                          </div>

                          {/* Refresh button */}
                          <button
                            onClick={() => { setGemmaInsight(null); openModal(); }}
                            className="w-full py-3 rounded-2xl border border-white/10 text-zinc-500 hover:text-white hover:border-white/20 hover:bg-white/5 transition-all text-sm font-medium flex items-center justify-center gap-2"
                          >
                            <Sparkles className="w-4 h-4" /> Regenerate Analysis
                          </button>
                        </motion.div>
                      )}

                    </AnimatePresence>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
