"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, ArrowRight, Lightbulb, Sparkles, X,
  TrendingUp, Target, Zap, IndianRupee, ChevronRight, Loader2
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

export function AIInsightCard({ insight, skills = [], role = 'Professional', matchScore = 0, topMissingSkills = [] }: AIInsightCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [gemmaInsight, setGemmaInsight] = useState<GemmaInsight | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const supabase = getSupabaseClient();

  const renderHighlightedMessage = (message: string, keywords: string[]) => {
    if (!keywords || keywords.length === 0) return message;
    const regex = new RegExp(`(${keywords.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
    const parts = message.split(regex);
    return parts.map((part, index) => {
      const isKeyword = keywords.some(k => k.toLowerCase() === part.toLowerCase());
      if (isKeyword) {
        return (
          <motion.span
            key={index}
            initial={{ opacity: 0.8 }}
            animate={{ opacity: 1, scale: isHovered ? 1.05 : 1 }}
            className="inline-block px-2 py-0.5 mx-0.5 rounded-md bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30"
          >{part}</motion.span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  const openModal = async () => {
    setModalOpen(true);
    if (gemmaInsight) return; // already loaded
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
      } else {
        setError(data.error || 'Failed to generate insight.');
      }
    } catch (err) {
      setError('Could not connect to AI service.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={openModal}
        className="relative group cursor-pointer"
      >
        <motion.div
          animate={{ opacity: isHovered ? 0.5 : 0.2, scale: isHovered ? 1.02 : 1 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 bg-gradient-to-br from-violet-500/20 via-emerald-500/10 to-teal-500/20 rounded-3xl blur-xl"
        />

        <div className="relative glass rounded-3xl p-6 h-full overflow-hidden border border-white/5 group-hover:border-emerald-500/20 transition-colors duration-300">
          {/* Floating particles */}
          <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-emerald-400/40 rounded-full"
                animate={{ y: [-20, -100], x: [0, (i - 1) * 20], opacity: [0, 1, 0] }}
                transition={{ duration: 3 + i, repeat: Infinity, delay: i * 0.8, ease: 'easeOut' }}
                style={{ left: `${30 + i * 25}%`, bottom: '0%' }}
              />
            ))}
          </div>

          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <motion.div animate={{ rotate: isHovered ? [0, -10, 10, 0] : 0 }} transition={{ duration: 0.5 }} className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-emerald-500 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }} transition={{ duration: 2, repeat: Infinity }} className="absolute inset-0 rounded-xl bg-violet-500/30 blur-md" />
              </motion.div>
              <div>
                <h3 className="text-lg font-semibold text-white">{insight?.title || '🧠 AI Insight'}</h3>
                <div className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  <span className="text-xs text-emerald-400">Powered by Gemma AI</span>
                </div>
              </div>
            </div>
            <motion.div animate={{ rotate: isHovered ? 15 : 0 }} transition={{ duration: 0.3 }}>
              <Lightbulb className="w-5 h-5 text-amber-400" />
            </motion.div>
          </div>

          {/* Insight Message */}
          <div className="mb-6">
            <p className="text-zinc-300 leading-relaxed text-base">
              {renderHighlightedMessage(insight?.message || 'Click to get your personalized AI career analysis', insight?.highlightedWords || [])}
            </p>
          </div>

          {/* Action Card */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 p-4">
            <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-full blur-xl" />
            <div className="relative flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <ArrowRight className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-zinc-300 mb-1"><span className="text-white font-medium">Suggested Action:</span>{' '}{insight?.action || 'Click to view full AI analysis'}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold">{insight?.impact || 'Deep career insights'}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="mt-5">
            <Button className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-medium py-5 rounded-xl transition-all duration-300 shadow-glow-sm hover:shadow-glow group/btn">
              <span>Deep Analysis</span>
              <motion.span animate={{ x: isHovered ? 5 : 0 }} transition={{ duration: 0.2 }}>
                <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
              </motion.span>
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Modal */}
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
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />

            {/* Modal Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-zinc-900 border border-white/10 rounded-3xl shadow-2xl"
            >
              {/* Modal Header */}
              <div className="sticky top-0 z-10 bg-zinc-900/95 backdrop-blur-sm border-b border-white/5 p-6 flex items-center justify-between rounded-t-3xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-emerald-500 flex items-center justify-center">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">AI Career Analysis</h2>
                    <p className="text-xs text-emerald-400 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Powered by Google Gemma
                    </p>
                  </div>
                </div>
                <button onClick={() => setModalOpen(false)} className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                  <X className="w-4 h-4 text-zinc-400" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Loading */}
                {loading && (
                  <div className="flex flex-col items-center justify-center py-16 gap-4">
                    <div className="relative">
                      <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                      <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-emerald-400 animate-pulse" />
                    </div>
                    <p className="text-zinc-400 animate-pulse">Gemma AI is analyzing your profile...</p>
                  </div>
                )}

                {/* Error */}
                {error && !loading && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-red-400 text-sm text-center">{error}</div>
                )}

                {/* Gemma Insight */}
                {gemmaInsight && !loading && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">

                    {/* Summary */}
                    <div className="bg-gradient-to-br from-violet-500/10 to-emerald-500/10 border border-white/10 rounded-2xl p-5">
                      <p className="text-zinc-200 leading-relaxed">{gemmaInsight.summary}</p>
                    </div>

                    {/* Strengths & Gaps */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <TrendingUp className="w-4 h-4 text-emerald-400" />
                          <h4 className="text-sm font-semibold text-emerald-400">Your Strengths</h4>
                        </div>
                        <ul className="space-y-2">
                          {(gemmaInsight.strengths || []).map((s, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm text-zinc-300">
                              <ChevronRight className="w-3 h-3 text-emerald-500 flex-shrink-0" />{s}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Target className="w-4 h-4 text-amber-400" />
                          <h4 className="text-sm font-semibold text-amber-400">Skill Gaps</h4>
                        </div>
                        <ul className="space-y-2">
                          {(gemmaInsight.gaps || []).map((g, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm text-zinc-300">
                              <ChevronRight className="w-3 h-3 text-amber-500 flex-shrink-0" />{g}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Quick Wins */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Zap className="w-4 h-4 text-violet-400" />
                        <h4 className="text-sm font-semibold text-white">Quick Wins</h4>
                      </div>
                      <div className="space-y-3">
                        {(gemmaInsight.quickWins || []).map((qw, i) => (
                          <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="flex items-center gap-3 bg-violet-500/5 border border-violet-500/20 rounded-xl p-3">
                            <div className="w-6 h-6 rounded-full bg-violet-500/20 flex items-center justify-center flex-shrink-0 text-xs font-bold text-violet-400">{i + 1}</div>
                            <div className="flex-1">
                              <p className="text-sm text-zinc-200">{qw.action}</p>
                              <div className="flex gap-2 mt-1">
                                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">{qw.impact}</span>
                                <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-700 text-zinc-400">{qw.timeframe}</span>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Career Path + Salary */}
                    <div className="grid grid-cols-1 gap-4">
                      <div className="bg-teal-500/5 border border-teal-500/20 rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="w-4 h-4 text-teal-400" />
                          <h4 className="text-sm font-semibold text-teal-400">Career Path</h4>
                        </div>
                        <p className="text-sm text-zinc-300">{gemmaInsight.careerPath}</p>
                      </div>
                      <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <IndianRupee className="w-4 h-4 text-amber-400" />
                          <h4 className="text-sm font-semibold text-amber-400">Salary Insight</h4>
                        </div>
                        <p className="text-sm text-zinc-300">{gemmaInsight.salaryInsight}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
