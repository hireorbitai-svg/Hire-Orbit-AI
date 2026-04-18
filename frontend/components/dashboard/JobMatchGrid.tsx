"use client";

import { motion } from 'framer-motion';
import { Briefcase, Filter, ChevronDown } from 'lucide-react';
import type { JobMatch } from '@/lib/types';
import { JobCard } from './JobCard';
import { Button } from '@/components/ui/button';

interface JobMatchGridProps {
  jobs: JobMatch[];
}

export function JobMatchGrid({ jobs }: JobMatchGridProps) {
  return (
    <motion.section
      id="jobs"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="space-y-6 scroll-mt-24"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Job Matches</h2>
            <p className="text-sm text-zinc-500">
              {(jobs || []).length} opportunities found for you
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10 hover:text-white"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filter
            <ChevronDown className="w-4 h-4 ml-2" />
          </Button>
          <Button className="bg-emerald-500 hover:bg-emerald-400 text-white">
            View All
          </Button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {(jobs || []).map((job, index) => (
          <JobCard key={job.id || index} job={job} index={index} />
        ))}
      </div>

      {/* Load More */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="flex justify-center"
      >
        <Button
          variant="outline"
          className="bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10 hover:text-white px-8"
        >
          Load More Jobs
        </Button>
      </motion.div>
    </motion.section>
  );
}
