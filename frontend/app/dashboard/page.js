"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Briefcase } from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { HeroSection } from "@/components/dashboard/HeroSection";
import { MatchScoreCard } from "@/components/dashboard/MatchScoreCard";
import { AIInsightCard } from "@/components/dashboard/AIInsightCard";
import { SkillsRadar } from "@/components/dashboard/SkillsRadar";
import { JobMatchGrid } from "@/components/dashboard/JobMatchGrid";
import { ImprovementPanel } from "@/components/dashboard/ImprovementPanel";
import { CareerSuggestions } from "@/components/dashboard/CareerSuggestions";
import { mockDashboardData, getMatchLabel } from "@/lib/mock-data";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

// 🔥 CORE SKILLS DATABASE FOR MATCHING
const TECH_SKILLS = [
  "javascript", "python", "react", "node", "sql", "java", "c++", "aws", "azure", 
  "docker", "kubernetes", "frontend", "backend", "fullstack", "devops", 
  "data science", "machine learning", "ai", "typescript", "tailwind", "nextjs", 
  "mongodb", "postgresql", "rest api", "graphql", "spring boot", "flutter", 
  "swift", "kotlin", "ruby", "php", "django", "flask", "angular", "vue"
];

const SKILL_WEIGHTS = {
  "react": 3, "javascript": 3, "python": 3, "node": 2, "aws": 2, "docker": 1,
  "typescript": 2, "nextjs": 2, "sql": 2, "machine learning": 3
};

function extractSkills(text) {
  if (!text) return [];
  const lowerText = text.toLowerCase();
  return TECH_SKILLS.filter(skill => lowerText.includes(skill.toLowerCase()));
}

// 🧠 Generate dynamic AI insight + improvement plan from real user data
function generateDynamicInsight(userSkills, userRole, jobs) {
  // Count which missing skills appear most across matched jobs
  const missingSkillFreq = {};
  (jobs || []).forEach(job => {
    (job.missingSkills || []).forEach(skill => {
      missingSkillFreq[skill] = (missingSkillFreq[skill] || 0) + 1;
    });
  });

  // Sort missing skills by frequency
  const topMissing = Object.entries(missingSkillFreq)
    .sort((a, b) => b[1] - a[1])
    .map(([skill]) => skill)
    .slice(0, 3);

  // Pick a strong skill the user already has
  const strongSkill = (userSkills && userSkills.length > 0) ? userSkills[0] : 'your core skills';

  // Build AI insight message
  const missingWord = topMissing[0] || 'additional certifications';
  const aiInsight = {
    title: '🧠 AI Insight',
    message: `You are strong in ${strongSkill} but could boost matches by adding ${missingWord}`,
    action: `Add ${missingWord} to your profile`,
    impact: `+${Math.min(10 + (missingSkillFreq[missingWord] || 1) * 5, 30)}% match increase`,
    highlightedWords: [strongSkill, missingWord],
  };

  // Build improvements from top missing skills
  const improvements = topMissing.slice(0, 3).map((skill, idx) => ({
    id: String(idx + 1),
    title: `Strengthen ${skill}`,
    description: `Add ${skill} experience or certification to your profile to unlock more job matches`,
    impact: `+${Math.max(10, (missingSkillFreq[skill] || 1) * 5)}% match`,
    difficulty: idx === 0 ? 'medium' : 'easy',
    timeEstimate: idx === 0 ? '2-4 weeks' : '1-2 weeks',
  }));

  // Build a practical weekly plan
  const weeklyPlan = topMissing.slice(0, 2).map((skill, idx) => ({
    day: idx + 1,
    title: `Week ${idx + 1}: ${skill}`,
    tasks: [
      `Research ${skill} requirements in job listings`,
      `Complete a beginner ${skill} course or module`,
    ],
    completed: false,
  }));

  // Fallback if no missing skills found
  if (improvements.length === 0) {
    improvements.push({
      id: '1',
      title: `Get ${userRole || 'Professional'} Certification`,
      description: `Earn a recognized certification in your field to stand out to employers`,
      impact: '+15% match',
      difficulty: 'medium',
      timeEstimate: '4 weeks',
    });
    weeklyPlan.push({
      day: 1,
      title: 'Research Certifications',
      tasks: ['Search for top certifications in your field', 'Enroll in one online course'],
      completed: false,
    });
  }

  return { aiInsight, improvements, weeklyPlan };
}

function calculateSmartMatch(userSkills, jobSkills) {
  if (!jobSkills || jobSkills.length === 0) return { score: 70, matched: [], missing: [] };
  const matched = jobSkills.filter(skill => 
    userSkills.some(us => us.toLowerCase().includes(skill.toLowerCase()) || skill.toLowerCase().includes(us.toLowerCase()))
  );
  let totalWeight = 0;
  let matchedWeight = 0;
  jobSkills.forEach(skill => {
    const weight = SKILL_WEIGHTS[skill.toLowerCase()] || 1;
    totalWeight += weight;
    if (matched.includes(skill)) {
      matchedWeight += weight;
    }
  });
  const score = Math.round((matchedWeight / totalWeight) * 100);
  const missing = jobSkills.filter(skill => !matched.includes(skill));
  return { score, matched, missing };
}

function getRoleMatchBonus(userRole, jobTitle) {
  if (!userRole || !jobTitle) return 0;
  return jobTitle.toLowerCase().includes(userRole.toLowerCase()) ? 20 : 0;
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="glass-strong rounded-3xl p-8">
        <div className="flex items-center gap-4 mb-6">
          <Skeleton className="w-12 h-12 rounded-full bg-white/5" />
          <div className="space-y-2">
            <Skeleton className="w-64 h-8 bg-white/5" />
            <Skeleton className="w-48 h-4 bg-white/5" />
          </div>
        </div>
        <Skeleton className="w-full h-2 rounded-full bg-white/5" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Skeleton className="h-80 rounded-3xl bg-white/5" />
        <Skeleton className="h-80 rounded-3xl bg-white/5" />
        <Skeleton className="h-80 rounded-3xl bg-white/5" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-64 rounded-3xl bg-white/5" />
        <Skeleton className="h-64 rounded-3xl bg-white/5" />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState([]);
  const [activeNavItem, setActiveNavItem] = useState('dashboard');
  const router = useRouter();
  const supabase = getSupabaseClient();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          console.log("No session → redirecting once");
          router.replace("/login");
          return;
        }

        const user = session.user;
        let { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", user.id)
          .single();

        // ✅ Step 2: Auto-create profile if it doesn't exist (Fail-safe)
        if (!profileData && !profileError) {
          console.log("🛠️ Profile missing → Auto-creating profile for:", user.id);
          const { data: newProfile, error: insertError } = await supabase
            .from("profiles")
            .upsert([{ 
              user_id: user.id, 
              full_name: user.email?.split('@')[0] || "New User",
              created_at: new Date(),
              updated_at: new Date()
            }], { onConflict: 'user_id' })
            .select()
            .single();

          if (!insertError) {
            profileData = newProfile;
            console.log("✅ Profile auto-created successfully");
          } else {
            console.error("❌ Profile auto-creation failed. You likely need to run the SQL migration to add columns like 'user_id' and 'full_name'. Error:", insertError.message);
          }
        }

        // ✅ Step 5.1: GUARD - Redirect to onboarding if no resume uploaded yet
        if (profileData && !profileData.resume_url) {
          console.log("🚀 No resume found → Redirecting to onboarding");
          router.replace("/onboarding");
          return;
        }

        if (profileError) console.error("Profile Fetch Error:", profileError.message);

        let analysisData = { jobs: [], role: "Unknown", skills: [], resumeData: null };
        try {
          // ✅ Use Next.js proxy to avoid CORS
          const response = await fetch(`/api/latest-result`);
          if (response.ok) {
            const fetchedData = await response.json();
            analysisData = { ...analysisData, ...fetchedData };
          } else if (profileData?.analysis_data) {
            // 💾 Fallback: use persisted analysis from Supabase if backend lost its in-memory result
            console.log("📦 Using persisted analysis from Supabase");
            analysisData = { ...analysisData, ...profileData.analysis_data };
          }
        } catch (backendErr) {
          console.warn("Backend fetch failed, trying Supabase fallback", backendErr);
          if (profileData?.analysis_data) {
            analysisData = { ...analysisData, ...profileData.analysis_data };
          }
        }

        // ✅ Always prefer Supabase persisted profile data (survives Railway restarts)
        // Backend in-memory result (analysisData) is secondary — it's lost on every restart
        const resolvedSkills =
          (profileData?.skills?.length > 0 ? profileData.skills : null) ||
          (analysisData.skills?.length > 0 ? analysisData.skills : null) ||
          analysisData.resumeData?.skills ||
          [];

        const resolvedRole =
          (profileData?.role && profileData.role !== 'Unknown' ? profileData.role : null) ||
          (analysisData.role && analysisData.role !== 'Unknown' ? analysisData.role : null) ||
          analysisData.resumeData?.role ||
          'Professional'; // better default than 'Unknown' for SerpAPI query

        console.log("✅ Resolved skills:", resolvedSkills?.slice(0, 4), "| Role:", resolvedRole);

        let jSearchJobs = [];
        try {
          // ✅ Pass role so SerpAPI queries Google Jobs with the correct title
          const jobParams = new URLSearchParams();
          if ((resolvedSkills || []).length > 0) jobParams.set("skills", resolvedSkills.join(","));
          jobParams.set("role", resolvedRole); // always send role (never skip it)

          const jobRes = await fetch(`/api/jobs?${jobParams.toString()}`);
          if (jobRes.ok) {
            const jobData = await jobRes.json();
            const rawJobs = jobData.data || [];
            const jobSource = jobData.source || "local"; // "google_jobs" | "local"
            console.log(`📦 Job source: ${jobSource} — ${rawJobs.length} results`);

            jSearchJobs = rawJobs.map(job => {
              // ✅ Handle local matched jobs (new API) vs JSearch results
              const isLocal = job.match !== undefined;
              
              let matchScore, matchedSkills, missingSkills;
              
              if (isLocal) {
                matchScore = job.match;
                matchedSkills = job.matchedSkills;
                missingSkills = job.missingSkills;
              } else {
                const matchInfo = calculateSmartMatch(resolvedSkills, extractSkills(job.job_description));
                matchScore = Math.min(matchInfo.score + getRoleMatchBonus(resolvedRole, job.job_title), 100);
                matchedSkills = matchInfo.matched;
                missingSkills = matchInfo.missing;
              }

              // Ensure a minimum visible score so users see useful results
              matchScore = Math.max(matchScore || 0, 30);

              return {
                ...job,
                id: job.id || job.job_id,
                title: job.title || job.job_title,
                company: job.company || job.employer_name || "Orbit-Matched Partner",
                location: job.location || (job.job_city ? `${job.job_city}, ${job.job_country}` : "Remote"),
                matchScore: matchScore,
                matchedSkills: matchedSkills || [],
                missingSkills: missingSkills || [],
                salary: job.salary || (job.job_salary_currency ? `${job.job_min_salary || ''} - ${job.job_max_salary || ''} ${job.job_salary_currency}` : "Competitive"),
                postedAt: job.postedAt || (job.job_posted_at_datetime_utc ? new Date(job.job_posted_at_datetime_utc).toLocaleDateString() : "New"),
                matchLabel: getMatchLabel(matchScore),
                job_apply_link: job.redirect_url || job.job_apply_link || "#",
                source: job.source || jobSource, // preserve "Google Jobs" label
              };
            }).sort((a, b) => b.matchScore - a.matchScore);
          }
        } catch (err) { console.error("Jobs Fetch Error:", err); }

        // ── Adzuna jobs stored from resume upload ──────────────────────────────
        const adzunaJobs = (analysisData.jobs || []).map(job => ({
          ...job,
          matchLabel: getMatchLabel(job.matchScore || job.match || job.score || 0),
          job_apply_link: job.redirect_url || job.job_apply_link || '#',
          source: job.source || 'Adzuna',
        }));

        // ── Priority: Google Jobs (live) > Adzuna (from upload) > empty ────────
        // Google Jobs is always preferred — it's live, role-specific, and has real apply links.
        // Adzuna is kept as fallback if SerpAPI returned nothing (quota exceeded etc.)
        let finalJobs;
        if (jSearchJobs.length > 0) {
          // Google Jobs available — use it as the primary source
          // Optionally append any Adzuna jobs that aren't duplicates (by title)
          const googleTitles = new Set(jSearchJobs.map(j => j.title?.toLowerCase()));
          const uniqueAdzuna = adzunaJobs.filter(j => !googleTitles.has(j.title?.toLowerCase()));
          finalJobs = [...jSearchJobs, ...uniqueAdzuna].sort((a, b) => b.matchScore - a.matchScore);
        } else {
          // SerpAPI failed or quota hit — fall back to Adzuna
          finalJobs = adzunaJobs;
        }

        // 🧠 Generate role-aware AI insight from real data (no mock fallback needed)
        const dynamicInsight = generateDynamicInsight(resolvedSkills, resolvedRole, finalJobs);

        setData({
          ...profileData,
          ...analysisData,
          skills: resolvedSkills,
          role: resolvedRole,
          jobs: finalJobs,
          aiInsight: dynamicInsight.aiInsight,
          improvements: dynamicInsight.improvements,
          weeklyPlan: dynamicInsight.weeklyPlan,
        });
      } catch (err) { console.error("Error fetching dashboard data:", err); }
      finally { setLoading(false); }
    };
    fetchData();

    const loadSuggestions = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        // ✅ Use Next.js proxy — fixes undefined BACKEND scoping bug + CORS
        const res = await fetch(`/api/career-suggestions`, {
          method: "POST",
          headers: { 
            "Authorization": `Bearer ${session.access_token}`,
            "Content-Type": "application/json"
          }
        });
        
        if (res.ok) {
          const sugData = await res.json();
          setSuggestions(sugData.suggestions || []);
        }
      } catch (err) {
        console.error("Error loading suggestions:", err);
      }
    };
    loadSuggestions();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex">
        <div className="w-72 border-r border-white/5 hidden lg:block" />
        <div className="flex-1 p-8">
          <div className="max-w-7xl mx-auto flex flex-col items-center justify-center h-full gap-6">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
              <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-emerald-400 animate-pulse" />
            </div>
            <p className="text-zinc-500 font-bold tracking-widest uppercase animate-pulse">Orbit Intel Initialization...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data || data.error) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
        <div className="glass-strong rounded-3xl p-12 max-w-lg w-full text-center space-y-8 border border-white/10">
          <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center mx-auto border border-emerald-500/20">
            <Briefcase className="w-10 h-10 text-emerald-400" />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-white">No Analysis Found</h2>
            <p className="text-zinc-500">Upload your resume to unlock your professional trajectory.</p>
          </div>
          <Button 
            onClick={() => router.push("/onboarding")}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-white rounded-2xl py-8 font-black text-lg shadow-glow"
          >
            START ANALYSIS 🚀
          </Button>
        </div>
      </div>
    );
  }

  // Transform internal state to component props
  const dashboardUser = {
    name: data?.name || data?.full_name || "User",
    role: data?.role || "Unknown",
    skills: data?.skills || [],
    experience: data?.experience || "",
  };

  const dashboardMatchScore = {
    score: data.bestMatchScore || 65,
    label: "Overall Profile Match",
    improvement: 15,
  };

  const dashboardJobMatches = (data.jobs || []).map(j => ({
    ...j,
    matchLabel: j.matchScore >= 85 ? 'strong' : (j.matchScore >= 70 ? 'good' : 'weak')
  }));

  const dashboardSkills = (data.skills || []).map(s => ({
    name: s,
    level: 80,
    category: 'matched'
  }));

  return (
    <div className="min-h-screen bg-zinc-950">
      <Sidebar activeItem={activeNavItem} onItemClick={setActiveNavItem} user={dashboardUser} />
      
      <main className="lg:ml-72 min-h-screen relative">
        <div className="p-4 pt-16 lg:pt-8 lg:p-8 relative z-10">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-7xl mx-auto space-y-8"
          >
            <HeroSection profile={dashboardUser} matchScore={dashboardMatchScore} jobCount={dashboardJobMatches.length} />

            <CareerSuggestions suggestions={suggestions} />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <MatchScoreCard matchScore={dashboardMatchScore} />
              <AIInsightCard
                insight={data.aiInsight}
                skills={data.skills || []}
                role={data.role || 'Professional'}
                matchScore={dashboardMatchScore.score}
                topMissingSkills={data.improvements?.map((imp: any) => imp.title?.replace('Strengthen ', '').replace('Get ', '').split(' ')[0]).filter(Boolean) || []}
              />
              <SkillsRadar skills={dashboardSkills.length > 0 ? dashboardSkills : mockDashboardData.skills} />
            </div>

            <JobMatchGrid jobs={dashboardJobMatches.length > 0 ? dashboardJobMatches : mockDashboardData.jobMatches} />

            <ImprovementPanel 
              improvements={data.improvements || []} 
              weeklyPlan={data.weeklyPlan || []} 
            />

            <footer className="pt-8 pb-4 border-t border-white/5">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.2em]">© 2024 HireOrbitAI </span>
                <div className="flex gap-6 uppercase tracking-[0.1em] text-[10px] font-black text-zinc-600">
                  <a href="#" className="hover:text-emerald-400 transition-colors">Privacy</a>
                  <a href="#" className="hover:text-emerald-400 transition-colors">Terms</a>
                  <a href="#" className="hover:text-emerald-400 transition-colors">Support</a>
                </div>
              </div>
            </footer>
          </motion.div>
        </div>

        {/* Premium Background Effects */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-teal-500/5 rounded-full blur-[120px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-violet-500/5 rounded-full blur-[120px]" />
          <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.1) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        </div>
      </main>
    </div>
  );
}
